# 🚜 Smart Farm Bot — Enterprise IoT Telemetry Dashboard

An enterprise-grade, real-time IoT web telemetry dashboard built to monitor, analyze, and persist automated **Smart Farm Bot** sensor data using the **ThingSpeak REST API** backed by **Google Cloud Firestore**.

---

## 🌟 Architectural Upgrades & Key Features

* **⚡ Persistent Cloud Telemetry (Firebase Firestore)**: Eliminates ThingSpeak's historical query caps by idempotently archiving feeds into Cloud Firestore using deterministic document IDs (`${channel_id}_${entry_id}`) and batched writes (`writeBatch`), ensuring zero duplicates and optimal write quotas.
* **🔄 Two-Tier Data Hydration**: Instantly hydrates historical charts from Firestore on startup, then polls ThingSpeak for incoming delta feeds and persists only new records.
* **🔒 Isolated Configuration (`config.js`)**: Decouples sensitive API keys, ThingSpeak channel IDs, and Firebase credentials from the presentation layer for production security.
* **📊 Dynamic Field Visualization**: Customize sensor feed mappings (`field1`, `field2`), display labels, physical units (`cm`, `%`, `°C`), and chart color themes directly from an interactive settings modal.
* **📈 High-Performance Analytics**: Powered by Chart.js with responsive splines, tooltips, and real-time trend indicators (`▲` / `▼`).
* **🕹️ Subsystem Actuator Control**: Direct toggles for farm bot peripherals (Water Pump, UV Sterilizer, Pest Repeller, Headlights).

---

## 📂 Project Structure

```text
.
├── config.js         # Isolated credentials & schema definitions (Excluded from Git)
├── config.example.js # Safe credential template for collaborators
├── index.html        # Main SPA dashboard frontend (ES Module)
├── vercel.json       # Vercel routing rules for SPA deployment
├── .gitignore        # Secret protection rules
└── README.md         # Project documentation
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
* A web browser (Chrome, Firefox, Edge, Safari).
* A **ThingSpeak** account with an active IoT channel.
* A **Firebase project** with Cloud Firestore enabled.
* A local HTTP server (such as Python 3, Node `serve`, or VS Code Live Server) to support JavaScript ES Modules (`type="module"`).

### 2. Configuration (`config.js`)
Create a file named `config.js` in your root directory (matching `config.example.js`) and populate your credentials:

```javascript
// config.js
export const APP_CONFIG = {
    thingspeak: {
        baseUrl: "[https://api.thingspeak.com](https://api.thingspeak.com)",
        channelId: "YOUR_THINGSPEAK_CHANNEL_ID", 
        readKey: "YOUR_THINGSPEAK_READ_API_KEY", // Leave "" if public channel
        initialFetchCount: 8000,
        pollFetchCount: 50
    },
    firebase: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.firebasestorage.app",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    firestoreCollection: "farmbot_telemetry",
    defaultFields: [
        { key: "field1", name: "Distance (HC-SR04)", unit: "cm", color: "#f43f5e" }
    ]
};
```

### 3. Running Locally
Because the app uses native ES Modules, running it requires an HTTP server rather than opening `index.html` via `file://`:

* **Python 3:** `python3 -m http.server 8080`
* **Node.js (`serve`):** `npx serve .`

Open your browser and navigate to `http://localhost:8080`.

---

## 🔥 Firebase Firestore Rules & Indexing

1. **Firestore Database:** Create your Firestore database in production mode in a region close to your deployment (e.g., `asia-south1`).
2. **Composite Index:** The dashboard queries documents filtered by `channel_id` and ordered by `entry_id`. On your first app launch, if a missing index error appears in the browser console (`F12`), click the direct link provided by Firebase to auto-generate the composite index.
3. **Security Rules:** Secure your database collection under **Firestore Database → Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /farmbot_telemetry/{docId} {
         allow read: if true;
         allow write: if request.resource.data.keys().hasAll(['channel_id',
