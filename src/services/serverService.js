const SERVER_URL = '/api/chat';

export const createServerService = (provider, apiKey, modelName, baseUrl) => {

    const chat = async (history, message) => {
        // Unify history to standard [{role, content}] format
        // History comes in as [{role: 'user'|'ai', content: '...'}] from frontend state
        // We map 'ai' to 'assistant' for standard compatibility
        const messages = history.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : msg.role,
            content: msg.content
        }));

        if (message) {
            messages.push({ role: 'user', content: message });
        }

        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    apiKey,
                    model: modelName,
                    baseUrl,
                    messages
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            }

            const data = await response.json();
            return data.content;
        } catch (error) {
            console.error("Server API Error:", error);
            throw error;
        }
    };

    const generate = async (prompt) => {
        // Treat generate as a single turn chat
        return chat([], prompt);
    };

    return { chat, generate };
};
