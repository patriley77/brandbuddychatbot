const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Check Node.js version for fetch compatibility
const fetch = global.fetch || require("node-fetch");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Load API Key from .env
const API_URL = "https://api.deepseek.com/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

// ✅ Function to read cached document
function getCachedDocument() {
    try {
        return fs.readFileSync("cached_document.txt", "utf8");
    } catch (error) {
        console.error("Error reading cached document:", error);
        return "No additional context available.";
    }
}

// ✅ API Endpoint for Chatbot Requests
app.post("/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ reply: "Error: No message provided." });
    }

    if (!API_KEY) {
        console.error("Missing API Key");
        return res.status(500).json({ reply: "Error: Missing API key. AI service unavailable." });
    }

    const cachedDoc = getCachedDocument();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: `You are Chad, an AI assistant. Use this document for responses: ${cachedDoc}` },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "I'm not sure how to respond to that.";
        res.json({ reply });

    } catch (error) {
        console.error("Error fetching AI response:", error);
        res.status(500).json({ reply: "Error: Unable to connect to AI service." });
    }
});

// ✅ API Endpoint for AI-Generated Welcome Message
app.get("/welcome", async (req, res) => {
    function getCurrentDay() {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[new Date().getDay()];
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Generate a fun, friendly, and engaging chatbot welcome message. It should reference today's day of the week and encourage users to chat." }
                ]
            })
        });

        const data = await response.json();
        let welcomeMessage = data.choices?.[0]?.message?.content || "Hey there! I'm Chad, your AI buddy!";

        // Replace any placeholder with the actual day
        const today = getCurrentDay();
        welcomeMessage = welcomeMessage.replace(/\[Day of the Week\]/g, today);

        res.json({ welcomeMessage });

    } catch (error) {
        console.error("Error fetching AI welcome message:", error);
        res.status(500).json({ welcomeMessage: "Hey there! I'm Chad, your AI buddy!" });
    }
});

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
