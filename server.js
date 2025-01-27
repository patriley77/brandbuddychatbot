const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // Allow frontend to call this server

const API_URL = "https://api.deepseek.com/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

// API Endpoint for Chatbot Requests
app.post("/chat", async (req, res) => {
    const { message } = req.body;

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
                    { role: "system", content: "You are Chad, an AI assistant." },
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
app.use(express.static("public"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
