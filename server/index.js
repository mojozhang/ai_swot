import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

// Polyfill fetch for Node.js environments that might need it for the SDK
if (!global.fetch) {
    global.fetch = fetch;
    global.Headers = fetch.Headers;
    global.Request = fetch.Request;
    global.Response = fetch.Response;
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.send('SWOT Analysis API Server is running! (SWOT 分析助手后台服务已启动)');
});

// Proxy endpoint for Chat (Gemini Only)
app.post('/api/chat', async (req, res) => {
    console.log('Received request:', new Date().toISOString());
    const { apiKey, model, messages } = req.body;

    if (!apiKey) {
        console.error('Error: API Key is missing');
        return res.status(400).json({ error: 'API Key is required' });
    }

    try {
        console.log(`Using model: ${model || 'gemini-1.5-flash'}`);
        // Default to Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });

        let chatHistory = [];
        let lastMessage = '';

        if (messages && Array.isArray(messages)) {
            // Convert standard format [{role, content}] to Gemini format
            const geminiHistory = messages.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            lastMessage = messages[messages.length - 1].content;
            chatHistory = geminiHistory;
        } else {
            console.error('Error: Invalid messages format');
            return res.status(400).json({ error: "Invalid messages format" });
        }

        console.log('Sending message to Gemini...');
        const chat = geminiModel.startChat({ history: chatHistory });
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        console.log('Gemini response received successfully');
        res.json({ content: text });

    } catch (error) {
        console.error('Gemini API Error:', error);
        // Ensure we send a string message
        const errorMessage = error.message || 'Unknown error occurred';
        res.status(500).json({ error: errorMessage });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
