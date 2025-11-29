import { useState } from 'react';
import { Zap, Loader, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { createAIService } from '../services/aiFactory';
import { handleAIError } from '../utils/errorHandler';

function AutoMode({ apiKey, modelName, provider, baseUrl }) {
    const [topic, setTopic] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim() || loading) return;

        setLoading(true);
        try {
            const aiService = createAIService(provider, apiKey, modelName, baseUrl);
            const prompt = `请为主题“${topic}”生成一份详细的 SWOT 分析，包括优势（Strengths）、劣势（Weaknesses）、机会（Opportunities）和威胁（Threats）四个部分，每个部分至少包含3点，并提供详细的解释和建议。`;
            const analysisResult = await aiService.generate(prompt);
            setAnalysis(analysisResult);
        } catch (error) {
            setAnalysis(handleAIError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-md">
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>一键生成 SWOT 模板</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                    输入一个主题，我会基于行业知识为你生成一份标准的参考模板。
                </p>
                <form onSubmit={handleGenerate} className="flex gap-sm">
                    <input
                        type="text"
                        className="input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="例如：在中国开一家高端宠物店"
                        style={{ flex: 1 }}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !topic.trim()}
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : <Zap size={18} />}
                        生成
                    </button>
                </form>
            </div>

            {
                analysis && (
                    <div className="card animate-fade-in">
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="var(--color-accent)" />
                            生成结果
                        </h3>
                        <div className="markdown-content">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

AutoMode.propTypes = {
    apiKey: PropTypes.string.isRequired,
    modelName: PropTypes.string,
};

export default AutoMode;
