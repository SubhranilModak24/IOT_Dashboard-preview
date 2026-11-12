// // config.js
// // ============================================================================
// // PRODUCTION CONFIGURATION & CREDENTIALS
// // Add this file to .gitignore before pushing to a public repository.
// // ============================================================================

// export const APP_CONFIG = {
//     thingspeak: {
//         baseUrl: "https://api.thingspeak.com",
//         channelId: "3499273", // e.g., "3499273"
//         readKey: "FATM89HFI889BCRZ", // Leave "" if channel is public
//         initialFetchCount: 8000,                 // Max historical pull from ThingSpeak
//         pollFetchCount: 50                       // Incremental pull per refresh cycle
//     },

//     firebase: {
//         apiKey: "AIzaSyDkJ05O_UkNKPcoE_25_EgYMSIj7tqoVx4",
//         authDomain: "smart-farm-bot.firebaseapp.com",
//         projectId: "smart-farm-bot",
//         storageBucket: "smart-farm-bot.firebasestorage.app",
//         messagingSenderId: "114644917362",
//         appId: "1:114644917362:web:5698a9072f27e56aa436eb"
//     },

//     // Firestore collection name for historical telemetry persistence
//     firestoreCollection: "farmbot_telemetry",

//     // Default sensor field mappings (can still be customized visually in the UI)
//     defaultFields: [
//         { key: "field1", name: "Distance (HC-SR04)", unit: "cm", color: "#f43f5e" }
//         // Add additional fields as needed:
//         // { key: "field2", name: "Soil Moisture", unit: "%", color: "#10b981" },
//         // { key: "field3", name: "Temperature", unit: "°C", color: "#3b82f6" }
//     ]
// };

// config.js
let cachedConfig = null;

export async function loadConfig() {
    if (cachedConfig) return cachedConfig;
    
    try {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        cachedConfig = await response.json();
        return cachedConfig;
    } catch (err) {
        console.error("Failed to load remote configuration, using local fallback:", err);
        // Fallback for local testing if serverless function isn't running locally
        return {
            thingspeak: { baseUrl: "https://api.thingspeak.com", channelId: "", readKey: "", initialFetchCount: 8000, pollFetchCount: 50 },
            firebase: { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" },
            firestoreCollection: "farmbot_telemetry",
            defaultFields: [{ key: "field1", name: "Distance (HC-SR04)", unit: "cm", color: "#f43f5e" }]
        };
    }
}

// Backward-compatible getter placeholder (will be populated on app init)
export let APP_CONFIG = null;