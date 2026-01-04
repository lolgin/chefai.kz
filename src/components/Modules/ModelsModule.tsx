/**
 * ModelsModule.tsx
 * 
 * Модуль для выбора 3D моделей для тегов
 * Работает по той же логике что Discovery/Nodes/Themes
 */

import React, { useState, useMemo } from 'react';
import { X, Search, Layers } from 'lucide-react';
import { BUILT_IN_MODELS, MODEL_CATEGORIES, ModelCategory } from '../../constants/models';
import { useSettings } from '../../contexts/SettingsContext';

interface ModelsModuleProps {
  onClose: () => void;
  theme: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
  };
}

export const ModelsModule: React.FC<ModelsModuleProps> = ({ onClose, theme }) => {
  const { settings, updateDisplaySettings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | 'all'>('all');
  
  // Текущая выбранная модель
  const currentModel = settings.display?.tagModel || 'sphere';
  
  // Фильтрация моделей
  const filteredModels = useMemo(() => {
    let models = BUILT_IN_MODELS;
    
    // Фильтр по категории
    if (selectedCategory !== 'all') {
      models = models.filter(m => m.category === selectedCategory);
    }
    
    // Фильтр по поиску
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      models = models.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query)
      );
    }
    
    return models;
  }, [searchQuery, selectedCategory]);
  
  const handleModelSelect = (modelId: string) => {
    updateDisplaySettings({ tagModel: modelId });
    console.log('Selected 3D model:', modelId);
  };
  
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center z-50 p-8"
      style={{
        background: `linear-gradient(135deg, ${theme.bg}dd, ${theme.surface}dd)`,
        backdropFilter: 'blur(20px)'
      }}
    >
      <div 
        className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: theme.surface,
          border: `1px solid ${theme.accent}40`
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: `${theme.accent}20` }}
        >
          <div className="flex items-center gap-3">
            <Layers size={24} style={{ color: theme.accent }} />
            <div>
              <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                3D Models Library
              </h2>
              <p className="text-sm opacity-60" style={{ color: theme.text }}>
                Choose a 3D model for your tags
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
            style={{ color: theme.text }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-6 border-b" style={{ borderColor: `${theme.accent}20` }}>
          {/* Search */}
          <div className="relative mb-4">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
              style={{ color: theme.text }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/20 border transition-all outline-none"
              style={{
                color: theme.text,
                borderColor: `${theme.accent}20`,
                '::placeholder': { color: `${theme.text}60` }
              }}
            />
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: selectedCategory === 'all' ? theme.accent : 'transparent',
                color: selectedCategory === 'all' ? theme.bg : theme.text,
                border: `1px solid ${selectedCategory === 'all' ? theme.accent : theme.accent + '40'}`
              }}
            >
              All ({BUILT_IN_MODELS.length})
            </button>
            {MODEL_CATEGORIES.map(cat => {
              const count = BUILT_IN_MODELS.filter(m => m.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: selectedCategory === cat.id ? theme.accent : 'transparent',
                    color: selectedCategory === cat.id ? theme.bg : theme.text,
                    border: `1px solid ${selectedCategory === cat.id ? theme.accent : theme.accent + '40'}`
                  }}
                >
                  {cat.icon} {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Models Grid */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            {filteredModels.map(model => {
              const isSelected = currentModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className="relative p-4 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: isSelected 
                      ? `linear-gradient(135deg, ${theme.accent}40, ${theme.accent}20)`
                      : theme.bg,
                    border: `2px solid ${isSelected ? theme.accent : theme.accent + '20'}`,
                    boxShadow: isSelected ? `0 0 20px ${theme.accent}60` : 'none'
                  }}
                >
                  {/* Model Preview (будет заменено на 3D превью позже) */}
                  <div 
                    className="aspect-square rounded-lg flex items-center justify-center text-4xl mb-2"
                    style={{ background: `${theme.accent}10` }}
                  >
                    {model.category === ModelCategory.GEOMETRIC && '📐'}
                    {model.category === ModelCategory.ABSTRACT && '🌀'}
                    {model.category === ModelCategory.SPACE && '🪐'}
                    {model.category === ModelCategory.TECH && '⚙️'}
                  </div>
                  
                  {/* Model Name */}
                  <div className="text-sm font-medium text-center" style={{ color: theme.text }}>
                    {model.name}
                  </div>
                  
                  {/* Selected Badge */}
                  {isSelected && (
                    <div 
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ 
                        background: theme.accent,
                        color: theme.bg 
                      }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {filteredModels.length === 0 && (
            <div className="text-center py-12 opacity-60" style={{ color: theme.text }}>
              No models found. Try a different search or category.
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div 
          className="p-4 border-t text-sm text-center opacity-60"
          style={{ 
            borderColor: `${theme.accent}20`,
            color: theme.text 
          }}
        >
          Currently showing: <strong>{filteredModels.length}</strong> models
          {currentModel && ` • Selected: ${BUILT_IN_MODELS.find(m => m.id === currentModel)?.name || 'None'}`}
        </div>
      </div>
    </div>
  );
};
