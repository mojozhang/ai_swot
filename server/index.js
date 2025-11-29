import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Hardcoded Configuration
const API_KEY = 'AIzaSyDGKVA6eH2CDXwSB6FNmOU98tJjLejaAfY';
// Use the model that was confirmed to exist in the user's test
const MODEL_NAME = 'gemini-2.0-flash';

// Health check endpoint
app.get('/', (req, res) => {
    res.send('SWOT Analysis API Server is running! (SWOT 分析助手后台服务已启动)');
});

// Proxy endpoint for Chat (Gemini Only via REST API)
app.post('/api/chat', async (req, res) => {
    console.log('Received request:', new Date().toISOString());
    const { messages, model } = req.body;

    try {
        const targetModel = model || MODEL_NAME;
        console.log(`Using model: ${targetModel}`);

        // Construct the REST API URL (v1beta is required for newer models)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${API_KEY}`;

        let contents = [];

        if (messages && Array.isArray(messages)) {
            // Convert standard format [{role, content}] to Gemini REST format
            contents = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
        } else {
            console.error('Error: Invalid messages format');
            return res.status(400).json({ error: "Invalid messages format" });
        }

        console.log(`Sending request to: ${url.replace(API_KEY, 'HIDDEN_KEY')}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini REST API Error Response:', JSON.stringify(errorData, null, 2));
            const errorMsg = JSON.stringify(errorData.error) || `HTTP Error ${response.status} ${response.statusText}`;
            throw new Error(errorMsg);
        }

        const data = await response.json();

        // Extract text from response
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            console.log('Gemini response received successfully');
            res.json({ content: text });
        } else {
            throw new Error("Empty response from Gemini API");
        }

    } catch (error) {
        console.error('Gemini API Error:', error);
        const errorMessage = error.message || 'Unknown error occurred';
        res.status(500).json({ error: errorMessage });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
