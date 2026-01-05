/**
 * ContextInspector.tsx
 * 
 * Инспектор контекста для отладки AI подбора моделей
 * Показывает: контекст тега, выбранную модель, reasoning
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { getCachedModelUrlAsync, clearModelCache, setAIEnabled } from '../../services/modelMatcher';
import { getGeminiModelService } from '../../services/geminiModelService';

interface ContextInspectorProps {
  theme: { text: string; accent: string; surface: string };
}

export const ContextInspector: React.FC<ContextInspectorProps> = ({ theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [testContext, setTestContext] = useState({ name: 'Deep Space One', genre: 'ambient', provider: 'somafm' });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const gemini = getGeminiModelService();
  
  const testSelection = async () => {
    setIsLoading(true);
    try {
      const modelUrl = await getCachedModelUrlAsync(testContext);
      setResult({
        modelUrl,
        context: testContext,
        timestamp: new Date().toISOString(),
        aiAvailable: !!gemini
      });
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 p-3 rounded-full shadow-xl z-50 hover:scale-110 transition-all"
        style={{ backgroundColor: theme.accent, color: '#fff' }}
        title="Context Inspector"
      >
        <Eye size={20} />
      </button>
    );
  }
  
  return (
    <div 
      className="fixed bottom-20 right-4 w-96 rounded-lg shadow-2xl z-50 p-4 border backdrop-blur-xl"
      style={{ 
        backgroundColor: `${theme.surface}`,
        borderColor: `${theme.accent}40`,
        color: theme.text 
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye size={18} style={{ color: theme.accent }} />
          <span className="font-bold text-sm">CONTEXT INSPECTOR</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
          <EyeOff size={16} />
        </button>
      </div>
      
      {/* AI Status */}
      <div className="mb-4 p-2 rounded bg-black/20 text-xs">
        <div>🤖 Gemini: {gemini ? '✅ Available' : '❌ Not Available'}</div>
        <div>📊 Model: gemini-2.0-flash-exp</div>
        <div>🎛️ Temperature: {gemini?.getSettings().temperature}</div>
      </div>
      
      {/* Test Inputs */}
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={testContext.name}
          onChange={(e) => setTestContext({ ...testContext, name: e.target.value })}
          placeholder="Tag name"
          className="w-full px-2 py-1 text-xs rounded bg-black/20 border"
          style={{ borderColor: `${theme.accent}20` }}
        />
        <input
          type="text"
          value={testContext.genre}
          onChange={(e) => setTestContext({ ...testContext, genre: e.target.value })}
          placeholder="Genre"
          className="w-full px-2 py-1 text-xs rounded bg-black/20 border"
          style={{ borderColor: `${theme.accent}20` }}
        />
        <input
          type="text"
          value={testContext.provider}
          onChange={(e) => setTestContext({ ...testContext, provider: e.target.value })}
          placeholder="Provider"
          className="w-full px-2 py-1 text-xs rounded bg-black/20 border"
          style={{ borderColor: `${theme.accent}20` }}
        />
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={testSelection}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs font-bold rounded transition-all"
          style={{ backgroundColor: theme.accent, color: '#fff' }}
        >
          {isLoading ? '⏳ Testing...' : '🔍 Test Selection'}
        </button>
        <button
          onClick={() => {
            clearModelCache();
            setResult(null);
          }}
          className="px-3 py-2 text-xs rounded hover:bg-white/10"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      
      {/* Result */}
      {result && (
        <div className="p-3 rounded bg-black/30 text-xs font-mono overflow-auto max-h-64">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
