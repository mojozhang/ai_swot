import { useState, useEffect } from 'react';
import { MessageSquare, FileText, Zap, Settings as SettingsIcon, BrainCircuit } from 'lucide-react';
import GuidedMode from './components/GuidedMode';
import ReviewMode from './components/ReviewMode';
import AutoMode from './components/AutoMode';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('guided');
  const [showSettings, setShowSettings] = useState(false);

  // Manage model name state
  const [modelName, setModelName] = useState(localStorage.getItem('gemini_model_name') || 'gemini-2.0-flash');

  // Hardcoded provider settings (handled by server)
  const provider = 'gemini';
  const apiKey = 'SERVER_MANAGED';
  const baseUrl = '';

  useEffect(() => {
    localStorage.setItem('gemini_model_name', modelName);
  }, [modelName]);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-sm">
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--color-accent-gradient)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <BrainCircuit size={24} color="white" />
          </div>
          <h1>SWOT 分析助手 (Gemini 2.0 Flash)</h1>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => setShowSettings(true)}
        >
          <SettingsIcon size={20} />
          设置
        </button>
      </header>

      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <Settings
            modelName={modelName}
            setModelName={setModelName}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}

      <div className="animate-fade-in">
        <nav className="nav-tabs">
          <div
            className={`nav-tab ${activeTab === 'guided' ? 'active' : ''}`}
            onClick={() => setActiveTab('guided')}
          >
            <div className="flex items-center justify-center gap-sm">
              <MessageSquare size={18} />
              <span>引导式访谈</span>
            </div>
          </div>
          <div
            className={`nav-tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            <div className="flex items-center justify-center gap-sm">
              <FileText size={18} />
              <span>评审与优化</span>
            </div>
          </div>
          <div
            className={`nav-tab ${activeTab === 'auto' ? 'active' : ''}`}
            onClick={() => setActiveTab('auto')}
          >
            <div className="flex items-center justify-center gap-sm">
              <Zap size={18} />
              <span>全自动生成</span>
            </div>
          </div>
        </nav>

        <main>
          {activeTab === 'guided' && <GuidedMode apiKey={apiKey} modelName={modelName} provider={provider} baseUrl={baseUrl} />}
          {activeTab === 'review' && <ReviewMode apiKey={apiKey} modelName={modelName} provider={provider} baseUrl={baseUrl} />}
          {activeTab === 'auto' && <AutoMode apiKey={apiKey} modelName={modelName} provider={provider} baseUrl={baseUrl} />}
        </main>
      </div>
    </div>
  );
}

export default App;
