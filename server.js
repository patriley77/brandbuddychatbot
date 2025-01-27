const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Load API Key from .env
const API_URL = "https://api.deepseek.com/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

// Function to read cached document
function getCachedDocument() {
    try {
        return fs.readFileSync("cached_document.txt", "utf8");
    } catch (error) {
        console.error("Error reading cached document:", error);
        return "";
    }
}

// API Endpoint for Chatbot Requests
app.post("/chat", async (req, res) => {
    const { message } = req.body;
    const cachedDoc = getCachedDocument(); // Load cached document

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
        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Error fetching AI response:", error);
        res.status(500).json({ reply: "Error: Unable to connect to AI service." });
    }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Se
