# 🚜 Smart Farm Bot — Enterprise IoT Telemetry Dashboard

An enterprise-grade, real-time IoT web telemetry dashboard built to monitor, analyze, and persist automated **Smart Farm Bot** sensor data using the **ThingSpeak REST API** backed by **Google Cloud Firestore** and deployed securely on **Vercel**.

---

## 🌟 Architectural Upgrades & Key Features

* **⚡ Persistent Cloud Telemetry (Firebase Firestore)**: Eliminates ThingSpeak's historical query caps by idempotently archiving feeds into Cloud Firestore using deterministic document IDs (`${channel_id}_${entry_id}`) and batched writes (`writeBatch`), ensuring zero duplicates and optimal write quotas.
* **🔒 Secure Environment Injection (Vercel Serverless API)**: Decouples sensitive API keys, ThingSpeak channel IDs, and Firebase credentials from client-side code using a secure Vercel serverless function (`/api/config.js`).
* **🔄 Two-Tier Data Hydration**: Instantly hydrates historical charts from Firestore on startup, then polls ThingSpeak for incoming delta feeds and persists only new records.
* **📊 Dynamic Field Visualization**: Customize sensor feed mappings (`field1`, `field2`), display labels, physical units (`cm`, `%`, `°C`), and chart color themes directly from an interactive settings modal.
* **📈 High-Performance Analytics**: Powered by Chart.js with responsive splines, tooltips, and real-time trend indicators (`▲` / `▼`).
* **🕹️ Subsystem Actuator Control**: Direct toggles for farm bot peripherals (Water Pump, UV Sterilizer, Pest Repeller, Headlights).

---

## 📂 Project Structure

```text
.
├── api/
│   └── config.js     # Vercel serverless backend function for secure credential injection
├── config.js         # Frontend asynchronous configuration loader
├── index.html        # Main SPA dashboard frontend (ES Module)
├── vercel.json       # Vercel routing & SPA rewrite configuration
└── README.md         # Project documentation
