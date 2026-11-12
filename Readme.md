# 🚜 Smart Farm Bot — Enterprise IoT Telemetry Dashboard

An enterprise-grade, real-time IoT web telemetry dashboard built to monitor, analyze, and persist automated **Smart Farm Bot** sensor feeds using the **ThingSpeak REST API**, **Google Cloud Firestore**, and **Vercel Serverless Functions**.

---

## 📖 Table of Contents
1. [System Architecture & Data Flow](#-system-architecture--data-flow)
2. [Key Features](#-key-features)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [Environment Variables Setup (Vercel)](#-environment-variables-setup-vercel)
6. [Firebase Firestore Configuration & Security Rules](#-firebase-firestore-configuration--security-rules)
7. [Local Development Setup](#-local-development-setup)
8. [Production Deployment](#-production-deployment)
9. [Troubleshooting](#-troubleshooting)

---

## 🏗️ System Architecture & Data Flow

Traditional ThingSpeak dashboards suffer from API rate limits and hard caps on historical data retrieval (typically limited to 8,000 entries per query). This application solves that limitation through a **Two-Tier Hybrid Cloud Architecture**:

```text
┌───────────────────┐       ┌───────────────────────┐       ┌──────────────────────┐
│  Smart Farm Bot   │──────▶│   ThingSpeak Cloud    │◀──────│   Browser Frontend   │
│  (Edge Sensors)   │ HTTP  │   (Live Ingestion)    │ Poll  │   (index.html SPA)   │
└───────────────────┘       └───────────────────────┘       └──────────┬───────────┘
                                                                       │
                            ┌───────────────────────┐                  │ 1. Fetch Config
                            │  Vercel Serverless    │◀─────────────────┤    (/api/config)
                            │  (/api/config.js)     │                  │
                            └───────────────────────┘                  │
                                                                       │ 2. Hydrate & Persist
                            ┌───────────────────────┐                  │    (writeBatch)
                            │   Google Firestore    │◀─────────────────┘
                            │  (Long-Term Archive)  │
                            └───────────────────────┘
```

### How It Works Under the Hood:
1. **Runtime Secret Injection**: Upon page load, `config.js` makes a `GET` request to `/api/config`. The Vercel serverless function reads encrypted environment variables on the server and returns a runtime JSON configuration—ensuring zero API keys are ever committed to Git.
2. **Firestore Historical Hydration**: The frontend queries Google Cloud Firestore for all archived records matching the configured `channel_id`, sorted chronologically by `entry_id`. Charts and tables render immediately from this persistent archive.
3. **Delta Polling & Idempotent Archival**: The dashboard polls ThingSpeak at user-configurable intervals (`15s`, `30s`, `60s`). Incoming feeds are deduplicated in memory against an `entry_id` Map. Only unseen entries are written to Firestore using batched writes (`writeBatch`, chunked at 450 docs/batch) with deterministic document IDs (`${channel_id}_${entry_id}`).

---

## 🌟 Key Features

* **⚡ Unlimited Historical Retention (Cloud Firestore)**: Automatically archives every ThingSpeak reading into Firestore without duplicates, preserving long-term agricultural telemetry beyond ThingSpeak's rolling window.
* **🔐 Zero-Secret Git Repository**: Decouples sensitive ThingSpeak and Firebase credentials from client-side source files via Vercel Serverless Functions.
* **📊 Dynamic Sensor Field Mapping**: Map any ThingSpeak field (`field1` through `field8`) to custom human-readable labels, physical units (`cm`, `%`, `°C`, `lux`), and chart line colors via an interactive UI modal—persisted in `localStorage`.
* **📈 Real-Time Interactive Analytics**: Built on **Chart.js** with responsive splines, hover crosshairs, dark-mode styling, and real-time delta trend indicators (`▲` / `▼`) comparing the latest reading against the previous entry.
* **🕹️ Subsystem Actuator Control Panel**: Interactive UI toggles for managing peripheral farm bot subsystems (*Water Pump*, *UV Sterilizer*, *Pest Repeller*, *Headlights*) alongside live API/DB connection heartbeats and sync timestamps.

---

## 📂 Project Structure

```text
.
├── api/
│   └── config.js     # Vercel Serverless Function serving runtime env variables as JSON
├── config.js         # Client-side async configuration loader with local fallback
├── index.html        # Single-Page Application (HTML5, Tailwind CSS, Chart.js, Firebase SDK v12)
├── vercel.json       # Vercel routing rules prioritizing /api/* over SPA index rewrites
├── .gitignore        # Standard Git exclusions (.env, .vercel, OS metadata)
└── README.md         # Comprehensive project documentation
```

---

## 📋 Prerequisites

Before setting up or deploying this dashboard, ensure you have:
* A **ThingSpeak** account with an active channel receiving sensor data.
* A **Firebase** project with **Cloud Firestore** enabled.
* A **Vercel** account linked to your GitHub repository.
* **Node.js (v18+)** and the **Vercel CLI** installed locally (for local development).

---

## ⚙️ Environment Variables Setup (Vercel)

Because credentials are injected dynamically at runtime, configure the following variables in your **Vercel Dashboard → Project Settings → Environment Variables** across **Production**, **Preview**, and **Development**:

| Variable Name | Vercel Type | Required | Example / Description |
| :--- | :--- | :--- | :--- |
| `THINGSPEAK_CHANNEL_ID` | **Config** | Yes | Numeric ThingSpeak Channel ID (e.g., `3499273`) |
| `THINGSPEAK_READ_KEY` | **Secret** | Conditional | ThingSpeak Read API Key *(leave blank if channel is public)* |
| `FIREBASE_API_KEY` | **Secret** | Yes | Firebase Web App API Key (`AIzaSy...`) |
| `FIREBASE_AUTH_DOMAIN` | **Config** | Yes | Firebase Auth Domain (`your-project.firebaseapp.com`) |
| `FIREBASE_PROJECT_ID` | **Config** | Yes | Firebase Project ID (`your-project-id`) |
| `FIREBASE_STORAGE_BUCKET` | **Config** | Yes | Firebase Storage Bucket (`your-project.firebasestorage.app`) |
| `FIREBASE_MESSAGING_SENDER_ID` | **Secret** | Yes | Firebase Cloud Messaging Numeric Sender ID |
| `FIREBASE_APP_ID` | **Secret** | Yes | Firebase Web App Identifier (`1:123456:web:abcdef`) |

---

## 🔥 Firebase Firestore Configuration & Security Rules

### 1. Database Initialization
1. Open the [Firebase Console](https://console.firebase.google.com/) and navigate to **Build → Firestore Database**.
2. Click **Create database**, select **Production mode**, and choose a server location closest to your deployment region (e.g., `asia-south1`).

### 2. Composite Index Setup
The application queries Firestore using a compound filter (`channel_id == X` combined with `orderBy("entry_id", "asc")`).
* On your very first launch, open the browser Developer Console (`F12`).
* Firestore will log a warning containing a direct URL to generate the required composite index. Click that link and confirm index creation (takes ~1–2 minutes to build).

### 3. Production Security Rules
Navigate to **Firestore Database → Rules** and apply the following schema-enforced rules to protect your telemetry collection (`farmbot_telemetry`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /farmbot_telemetry/{docId} {
      // Allow public read access for dashboard visualization
      allow read: if true;

      // Enforce strict schema validation on telemetry ingestion
      allow write: if request.resource.data.keys().hasAll(['channel_id', 'entry_id', 'created_at'])
                   && request.resource.data.entry_id is int
                   && request.resource.data.channel_id is string;
    }
  }
}
```

---

## 💻 Local Development Setup

Because the dashboard relies on `/api/config` to fetch environment variables, running a basic static server (like Python's `http.server`) will trigger the empty local fallback in `config.js`. Use the **Vercel CLI** to emulate the full serverless environment locally:

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Link your local folder to your Vercel project:**
   ```bash
   vercel link
   ```

3. **Pull your environment variables down to a local `.env.local` file:**
   ```bash
   vercel env pull .env.local
   ```
   *(Ensure `.env.local` is listed in your `.gitignore` so it is never committed).*

4. **Start the local development server:**
   ```bash
   vercel dev
   ```
   Open `http://localhost:3000` in your browser. Both your frontend and `/api/config` serverless endpoint will run seamlessly.

---

## 🚀 Production Deployment

1. **Verify `vercel.json` Routing Rules:**
   Ensure `/api/(.*)` is explicitly routed before the wildcard SPA fallback so Vercel does not serve `index.html` for API requests:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy Smart Farm Bot dashboard with serverless environment injection"
   git push origin main
   ```

3. **Verify Live Deployment:**
   * Check the **Deployments** tab in Vercel until the status turns **Ready**.
   * Open your live URL and confirm both header badges turn green: **`DB: X Retained`** and **`API: Connected`**.

---

## 🛠️ Troubleshooting

| Symptom | Likely Cause | Resolution |
| :--- | :--- | :--- |
| **Yellow Banner: `THINGSPEAK_CHANNEL_ID environment variable is missing`** | Environment variables were added in Vercel after the last build, or `/api/config` returned HTML instead of JSON. | Check `vercel.json` to ensure `/api/(.*)` rewrite is above `/(.*)`, then trigger a **Redeploy** in Vercel. |
| **`DB: Read Error` in Header Badge** | Missing Firestore Composite Index or restrictive Security Rules. | Open Browser Console (`F12`), click the Firebase auto-index creation link, and verify Firestore rules are published. |
| **`API: Offline / Error` in Header Badge** | Invalid ThingSpeak Channel ID, private channel without a Read Key, or network block. | Verify `THINGSPEAK_CHANNEL_ID` and `THINGSPEAK_READ_KEY` in Vercel Environment Variables. |
| **Duplicate / Corrupt Field Cards** | Stale preferences stored in browser `localStorage`. | Click **Configure Fields → Reset to config.js defaults** and apply settings. |
