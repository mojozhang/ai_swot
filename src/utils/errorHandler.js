export const handleAIError = (error) => {
    console.error(error);
    let errorMessage = '抱歉，发生了未知错误。';

    if (error.message) {
        if (error.message.includes('404')) {
            const modelInfo = error.failedModel ? ` (尝试使用的模型: ${error.failedModel})` : '';
            errorMessage = `错误 (404): 找不到该模型${modelInfo}。\n建议：请在设置中重新选择模型 (推荐 gemini-1.5-flash)。`;
        } else if (error.message.includes('403') || error.message.includes('key')) {
            errorMessage = '错误 (403): API Key 无效。\n建议：请检查您的 Gemini API Key 是否正确。';
        } else if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('quota')) {
            errorMessage = '错误 (429): 配额已用完或请求过于频繁。\n建议：请检查您的 Google Cloud 账户配额。';
        } else if (error.message.includes('500') || error.message.includes('503') || error.message.includes('5xx')) {
            errorMessage = `错误 (5xx): Google Gemini 服务器暂时繁忙。\n详情: ${error.message}\n建议：请稍后再试，或检查您的网络连接。`;
        } else {
            errorMessage = `错误详情: ${error.message}`;
        }
    }

    return errorMessage;
};
