// api/config.js
export default function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0'); // Prevent stale caching of credentials
    
    res.status(200).json({
        thingspeak: {
            baseUrl: "https://api.thingspeak.com",
            channelId: process.env.THINGSPEAK_CHANNEL_ID || "",
            readKey: process.env.THINGSPEAK_READ_KEY || "",
            initialFetchCount: 8000,
            pollFetchCount: 50
        },
        firebase: {
            apiKey: process.env.FIREBASE_API_KEY || "",
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
            projectId: process.env.FIREBASE_PROJECT_ID || "",
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
            appId: process.env.FIREBASE_APP_ID || ""
        },
        firestoreCollection: "farmbot_telemetry",
        defaultFields: [
            { key: "field1", name: "Distance (HC-SR04)", unit: "cm", color: "#f43f5e" }
        ]
    });
}