import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { createAIService } from '../services/aiFactory';
import { handleAIError } from '../utils/errorHandler';
import DynamicForm from './DynamicForm';

const SYSTEM_PROMPT = `
你是一个专业的 SWOT 分析顾问。你的任务是通过引导式访谈帮助用户进行 SWOT 分析，并制定后续行动计划。

IMPORTANT: 你的交互必须遵循以下规则：
1. **分步提问**：请一步步引导用户，不要一次性抛出所有问题。
2. **全程使用交互式表单**：**任何时候**当你需要用户回答问题、列举想法或制定计划时（无论是 SWOT 分析阶段，还是后续的行动计划、详细设计阶段），只要你需要用户输入信息，**必须**使用 JSON 表单格式。
3. **提供建议**：在询问时，请根据上下文主动列举 3-5 个可能的条目作为参考（预填在 editable-list 中）。
4. **数据格式**：对于 "editable-list" 类型的 values，**必须**是简单的字符串数组，**不要**使用对象。如果你想包含额外信息（如优先级、时间），请合并到字符串中，例如："行动项内容 (优先级: 高, 时间: 2天)"。
5. **最终总结**：在完成所有步骤（SWOT 分析 + 行动计划）后，请先输出一份完整的 **Markdown 格式总结**（包含所有 S, W, O, T 和行动计划），然后再输出一个表单询问用户是否还有补充。

JSON 格式如下：
\`\`\`json
{
  "type": "form",
  "intro": "基于你的目标，我们需要制定具体的行动计划。我想到了一些方向，你可以修改或补充：",
  "fields": [
    {
      "id": "action_items",
      "type": "editable-list", 
      "label": "行动计划 (Action Items)",
      "values": ["建议行动1 (优先级: 高)", "建议行动2 (优先级: 中)"] // 必须是字符串数组
    }
  ]
}
\`\`\`
请确保 JSON 格式正确。不要把 JSON 包裹在 markdown 代码块里，直接输出 JSON 字符串即可，或者包裹在 \`\`\`json ... \`\`\` 中也可以，我会解析它。
`;

function GuidedMode({ apiKey, modelName, provider, baseUrl }) {
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            content: '你好！我是你的 SWOT 分析助手。你想分析什么目标？（比如“我要做一个新产品”或“我想转行”）'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const aiService = createAIService(provider, apiKey, modelName, baseUrl);
            // Construct history for the API, excluding the last user message which is sent separately
            // However, the service wrapper I wrote takes (history, message).
            // Let's pass the previous messages as history.
            // Construct history for the API
            // Inject system prompt at the beginning
            const history = [
                { role: 'user', content: SYSTEM_PROMPT },
                { role: 'ai', content: '明白。我是专业的 SWOT 分析顾问。' },
                ...messages
            ];

            const response = await aiService.chat(history, userMessage);

            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: handleAIError(error) }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (responseText) => {
        if (loading) return;

        setMessages(prev => [...prev, { role: 'user', content: responseText }]);
        setLoading(true);

        try {
            const aiService = createAIService(provider, apiKey, modelName, baseUrl);
            // Construct history for the API
            // Inject system prompt at the beginning
            const history = [
                { role: 'user', content: SYSTEM_PROMPT },
                { role: 'ai', content: '明白。我是专业的 SWOT 分析顾问。' },
                ...messages,
                { role: 'user', content: responseText }
            ];

            const response = await aiService.chat(history, responseText);
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: handleAIError(error) }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '1rem' }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        style={{ marginBottom: '1rem' }}
                    >
                        {msg.role === 'ai' && (
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                backgroundColor: 'var(--color-accent)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Bot size={18} color="white" />
                            </div>
                        )}

                        <div style={{
                            maxWidth: '80%',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-bg-card)',
                            color: msg.role === 'user' ? 'var(--color-bg)' : 'var(--color-text-primary)',
                            border: msg.role === 'ai' ? '1px solid var(--color-border)' : 'none'
                        }}>
                            {msg.role === 'ai' ? (
                                <div className="markdown-content">
                                    {(() => {
                                        try {
                                            const content = msg.content.trim();
                                            // Regex to find JSON block: looks for { "type": "form" ... }
                                            // We use a simple regex to find the start of the JSON object containing "type": "form"
                                            // and then try to parse from there.
                                            const jsonMatch = content.match(/\{[\s\S]*"type":\s*"form"[\s\S]*\}/);

                                            if (jsonMatch) {
                                                const potentialJson = jsonMatch[0];
                                                // Try to parse the extracted JSON
                                                const schema = JSON.parse(potentialJson);

                                                // Extract text before the JSON
                                                const textBefore = content.substring(0, jsonMatch.index).trim();

                                                return (
                                                    <div>
                                                        {textBefore && <ReactMarkdown>{textBefore}</ReactMarkdown>}
                                                        {/* Use intro from schema if available, or just render form */}
                                                        {schema.intro && <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{schema.intro}</p>}
                                                        <DynamicForm
                                                            schema={schema}
                                                            onSubmit={(response) => {
                                                                handleFormSubmit(response);
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            }
                                        } catch (e) {
                                            // Not valid JSON or parsing failed, render as text
                                            console.log("JSON parse error:", e);
                                        }
                                        return <ReactMarkdown>{msg.content}</ReactMarkdown>;
                                    })()}
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                backgroundColor: 'var(--color-text-secondary)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <User size={18} color="var(--color-bg)" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-sm justify-start">
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: 'var(--color-accent)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Bot size={18} color="white" />
                        </div>
                        <div className="card flex items-center gap-sm" style={{ padding: '0.5rem 1rem' }}>
                            <Loader className="animate-spin" size={16} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>思考中...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-sm" style={{ marginTop: '1rem' }}>
                <input
                    type="text"
                    className="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="输入你的回答..."
                    disabled={loading}
                />
                <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
                    <Send size={18} />
                    发送
                </button>
            </form>
        </div>
    );
}

GuidedMode.propTypes = {
    apiKey: PropTypes.string.isRequired,
    modelName: PropTypes.string,
};

export default GuidedMode;

