import { createServerService } from './serverService';

export const createAIService = (provider, apiKey, modelName, baseUrl) => {
    // Ignore params, server handles everything
    return createServerService();
};
