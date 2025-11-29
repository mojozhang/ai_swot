export const createGeminiClient = (apiKey, modelName, baseUrl) => {
    // Default to official Google API if no baseUrl is provided
    const defaultBaseUrl = "https://generativelanguage.googleapis.com";
    // Remove trailing slash if present
    const apiBase = (baseUrl || defaultBaseUrl).replace(/\/+$/, "");
    const model = modelName || "gemini-1.5-flash";

    return {
        chat: async (history, message) => {
            try {
                // Construct the REST API URL
                const url = `${apiBase}/v1beta/models/${model}:generateContent?key=${apiKey}`;

                // Convert history to Gemini REST format
                const contents = history.map(msg => ({
                    role: msg.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));

                // Add the new message
                contents.push({
                    role: 'user',
                    parts: [{ text: message }]
                });

                console.log(`Sending request to: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

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
                    const errorMsg = errorData.error?.message || `HTTP Error ${response.status} ${response.statusText}`;

                    const error = new Error(errorMsg);
                    error.status = response.status;
                    error.failedUrl = url.replace(apiKey, '***'); // Hide key in error logs
                    error.failedModel = model;
                    throw error;
                }

                const data = await response.json();

                // Extract text from response
                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    throw new Error("Empty response from Gemini API");
                }

            } catch (error) {
                console.error("Gemini REST API Error:", error);
                throw error;
            }
        }
    };
};
