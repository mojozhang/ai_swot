import { useState } from 'react';
import { Play, Loader, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { createAIService } from '../services/aiFactory';
import { handleAIError } from '../utils/errorHandler';

function ReviewMode({ apiKey, modelName, provider, baseUrl }) {
    const [input, setInput] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!input.trim() || loading) return;

        setLoading(true);
        try {
            const aiService = createAIService(provider, apiKey, modelName, baseUrl);
            const prompt = `
                You are an AI assistant specialized in analyzing user input for strengths, weaknesses, and logical inconsistencies.
                The user will provide a list of thoughts, ideas, advantages, and disadvantages.
                Your task is to:
                1. Organize and categorize the input into clear sections (e.g., Strengths, Weaknesses, Opportunities, Threats, Key Ideas).
                2. Identify any logical gaps, contradictions, or areas that need further clarification.
                3. Provide constructive feedback and suggestions for improvement or further consideration.
                4. Present the analysis in a clear, concise, and easy-to-read markdown format.

                User Input:
                ${input}
            `;
            const result = await aiService.generate(prompt);
            setAnalysis(result);
        } catch (error) {
            setAnalysis(handleAIError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-md">
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>输入你的想法</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                    把你想到的一堆乱七八糟的优势、劣势、想法直接发给我。我会帮你整理、归类并指出逻辑漏洞。
                </p>
                <textarea
                    className="textarea"
                    rows={6}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="例如：
- 产品技术很强，但是没钱做推广
- 团队很有经验
- 市场上竞争对手很多
- 最近有个新政策对我们有利..."
                />
                <div className="flex justify-end" style={{ marginTop: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleAnalyze}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : <Play size={18} />}
                        开始分析
                    </button>
                </div>
            </div>

            {analysis && (
                <div className="card animate-fade-in">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} color="var(--color-accent)" />
                        分析结果
                    </h3>
                    <div className="markdown-content">
                        <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

ReviewMode.propTypes = {
    apiKey: PropTypes.string.isRequired,
    modelName: PropTypes.string,
};

export default ReviewMode;
