import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

function Settings({
    apiKey,
    setApiKey,
    modelName,
    setModelName,
    baseUrl,
    setBaseUrl,
    onClose
}) {
    const [isCustomModel, setIsCustomModel] = useState(false);
    const [customModelInput, setCustomModelInput] = useState('');

    // Comprehensive Gemini models list
    // Comprehensive Gemini models list
    // Comprehensive Gemini models list
    const geminiModels = [
        { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (推荐)" },
        { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash Exp" },
        { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (最新)" },
        { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (最强)" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { value: "custom", label: "自定义模型 (手动输入)" }
    ];

    // Initialize custom state based on current modelName
    useEffect(() => {
        const isKnown = geminiModels.some(m => m.value === modelName);
        if (!isKnown && modelName) {
            setIsCustomModel(true);
            setCustomModelInput(modelName);
        } else if (modelName === 'custom') {
            setIsCustomModel(true);
        } else {
            setIsCustomModel(false);
        }
    }, []);

    const handleModelChange = (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            setIsCustomModel(true);
            // Don't change modelName yet, wait for input
        } else {
            setIsCustomModel(false);
            setModelName(value);
        }
    };

    const handleCustomInputChange = (e) => {
        const value = e.target.value;
        setCustomModelInput(value);
        setModelName(value);
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto', width: '90%' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h2>设置</h2>
                <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                    <X size={24} />
                </button>
            </div>

            <div className="flex flex-col gap-md">
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        AI 提供商
                    </label>
                    <div className="nav-tabs" style={{ marginBottom: '0.5rem' }}>
                        <div className="nav-tab active">
                            Google Gemini
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        当前仅支持 Google 官方 Gemini API
                    </p>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        API 代理地址 (可选)
                    </label>
                    <input
                        type="text"
                        className="input"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="默认: https://generativelanguage.googleapis.com"
                    />
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        如果你使用代理或中转服务，请在此填入地址。留空则使用 Google 官方地址。
                    </p>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        API Key
                    </label>
                    <input
                        type="text"
                        className="input"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value.replace(/[^\x00-\x7F]/g, '').trim())}
                        placeholder="输入你的 Gemini API Key"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        模型选择 (Model)
                    </label>
                    <select
                        className="input"
                        value={isCustomModel ? 'custom' : modelName}
                        onChange={handleModelChange}
                        style={{ width: '100%', appearance: 'auto', marginBottom: isCustomModel ? '0.5rem' : '0' }}
                    >
                        {geminiModels.map(model => (
                            <option key={model.value} value={model.value}>
                                {model.label}
                            </option>
                        ))}
                    </select>

                    {isCustomModel && (
                        <input
                            type="text"
                            className="input animate-fade-in"
                            value={customModelInput}
                            onChange={handleCustomInputChange}
                            placeholder="输入模型名称，例如: gemini-1.5-pro-002"
                            autoFocus
                        />
                    )}

                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        选择适合的模型，或者选择“自定义”手动输入。
                    </p>
                </div>

                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div className="flex justify-between items-center">
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>调试工具</span>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={async () => {
                                if (!apiKey) return alert('请先输入 API Key');
                                const defaultBaseUrl = "https://generativelanguage.googleapis.com";
                                const apiBase = (baseUrl || defaultBaseUrl).replace(/\/+$/, "");
                                const url = `${apiBase}/v1beta/models?key=${apiKey}`;

                                try {
                                    alert(`正在连接: ${url.replace(apiKey, '***')} ...`);
                                    const res = await fetch(url);
                                    const data = await res.json();
                                    if (data.models) {
                                        const names = data.models.map(m => m.name.replace('models/', '')).join('\n');
                                        alert(`连接成功！可用模型:\n${names}`);
                                    } else {
                                        alert(`连接成功，但返回格式异常:\n${JSON.stringify(data, null, 2)}`);
                                    }
                                } catch (e) {
                                    alert(`连接失败:\n${e.message}`);
                                }
                            }}
                        >
                            测试连接 & 列出模型
                        </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
                        如果报错 404，点这个按钮看看服务器到底支持哪些模型。
                    </p>
                </div>

                <div className="flex justify-end" style={{ marginTop: '1rem' }}>
                    <button onClick={onClose} className="btn btn-primary">
                        保存并关闭
                    </button>
                </div>
            </div>
        </div>
    );
}

Settings.propTypes = {
    apiKey: PropTypes.string.isRequired,
    setApiKey: PropTypes.func.isRequired,
    modelName: PropTypes.string.isRequired,
    setModelName: PropTypes.func.isRequired,
    baseUrl: PropTypes.string,
    setBaseUrl: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default Settings;
