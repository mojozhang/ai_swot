import { GoogleGenerativeAI } from '@google/generative-ai';

// Netlify Function handler
export const handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { messages, model } = body;

        // 1. Get API Key from Netlify Environment Variables
        // Fallback to the hardcoded one if env var is missing (for easier transition)
        const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDGKVA6eH2CDXwSB6FNmOU98tJjLejaAfY';

        if (!API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ error: 'Missing API Key configuration' }) };
        }

        // 2. Determine Model
        const MODEL_NAME = model || 'gemini-2.0-flash';
        console.log(`Using model: ${MODEL_NAME}`);

        // 3. Call Gemini API (using REST via fetch for 2.0 support, or SDK if compatible)
        // Note: Netlify Node runtime usually supports fetch.
        // We will use the REST API approach to be safe and consistent with previous fixes.

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Gemini API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            return {
                statusCode: 200,
                body: JSON.stringify({ content: text })
            };
        } else {
            throw new Error("Empty response from Gemini");
        }

    } catch (error) {
        console.error('Netlify Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
