# 🚜 Smart Farm Bot — ThingSpeak IoT Dashboard

A modern, responsive, real-time IoT web dashboard designed to monitor and visualize telemetry data for an automated **Smart Farm Bot** using the **ThingSpeak REST API**.

---

## 🌟 Key Features

* **⚡ Bulk Historical Load**: Automatically retrieves up to **8,000 historical feed entries** upon initial launch to render complete time-series trends without data clipping.
* **🔄 Automatic Live Polling**: Fetches real-time sensor updates every 15 seconds (configurable up to 1 minute).
* **⚙️ Dynamic Field Management**: Add or delete custom fields (`field1`, `field2`, etc.), set custom metric names (e.g., *Distance HC-SR04*, *Soil Moisture*), specify units (`cm`, `%`, `°C`), and pick custom graph colors directly from the settings panel.
* **📊 Time-Series Analytics Chart**: Powered by Chart.js with smooth splines, responsive tooltips, and dynamic legend toggles.
* **📋 Raw Entry Audit Feed**: Live tabular log of incoming API data showing timestamps and sensor readings.
* **🕹️ Subsystem Control Panel**: Toggles for farm bot actuators (Water Pump, UV Sterilizer, Pest Repeller, Headlights).
* **💾 Local Storage Persistence**: Keeps your Channel ID, Read API Key, and field configurations saved locally in your browser.

---

## 🚀 Getting Started

### Prerequisites
* A web browser (Chrome, Firefox, Edge, Safari).
* A **ThingSpeak** account with an active channel.

### Installation
No build step or `npm install` is required! The dashboard is completely self-contained in a single HTML file.

1. Download or save `index.html` to your local machine.
2. Double-click `index.html` (or open it with your browser).

---

## ⚙️ Configuration Guide

1. Click the **"Configure API & Fields"** button in the top right corner.
2. Enter your ThingSpeak details:
   * **Channel ID / Channel No**: (e.g., `3499273`)
   * **Read API Key**: Required only if your channel is set to *Private*.
3. **Configure Fields**:
   * Click **"+ Add Field"** to track a new sensor.
   * Specify the **ThingSpeak Key** (e.g., `field1`), **Display Label** (e.g., `Distance (HC-SR04)`), **Unit** (e.g., `cm`), and pick a color.
   * Click the 🗑️ **Trash icon** to remove any field you do not wish to display.
4. Click **Save & Sync Channel**.

---

## 🛠️ Built With

* **Tailwind CSS** — Modern utility-first styling
* **Chart.js** — Interactive time-series graphing library
* **Lucide Icons** — Lightweight vector icons
* **ThingSpeak REST API** — Cloud IoT data ingestion & retrieval

---

## 📂 Project Structure

```text
.
├── index.html        # Main single-file IoT Dashboard application
└── README.md         # Documentation
```