import { useState } from 'react';
import { MessageSquare, FileText, Zap, BrainCircuit } from 'lucide-react';
import GuidedMode from './components/GuidedMode';
import ReviewMode from './components/ReviewMode';
import AutoMode from './components/AutoMode';

function App() {
  const [activeTab, setActiveTab] = useState('guided');

  // Hardcoded provider settings (handled by server now)
  const provider = 'gemini';
  const apiKey = 'SERVER_MANAGED';
  const modelName = 'gemini-2.0-flash';
  const baseUrl = '';

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
      </header>

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
