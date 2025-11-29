import { createGeminiClient } from './geminiClient';

export const createAIService = (provider, apiKey, modelName, baseUrl) => {
    // Ignore provider, force Gemini Client but pass baseUrl
    return createGeminiClient(apiKey, modelName, baseUrl);
};
