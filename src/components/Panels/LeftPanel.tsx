/**
 * LeftPanel.tsx
 * 
 * Левая боковая панель навигации
 * Содержит:
 * - Список провайдеров (SomaFM, Nightride, etc)
 * - Список жанров/станций каждого провайдера
 * - Анимация открытия/закрытия
 */

import React, { useState, useEffect, useRef } from 'react';
import { Hexagon, Globe, Orbit, Edit2, Trash2, Check, X, MoreVertical, ChevronDown } from 'lucide-react';
import { Provider, CustomNode } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import { RENDER_ENGINES, RenderEngine } from '../../constants/renderEngines';

interface LeftPanelProps {
  isOpen: boolean;
  providers: Array<{ id: Provider | string; name: string; color: string }>;
  genresByProvider: Record<string, (string | any)[]>;
  customNodes: CustomNode[];
  currentGenre: string | any;
  onGenreClick: (url: string, name: string, provider: Provider, updateSearch: boolean) => void;
  getGenreUrl: (genre: string | any, provider: Provider | string) => string | undefined;
  onEditNode?: (oldNode: CustomNode, newNode: CustomNode) => void;
  onDeleteNode?: (node: CustomNode) => void;
  theme: { text: string };
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  isOpen,
  providers,
  genresByProvider,
  customNodes,
  currentGenre,
  onGenreClick,
  getGenreUrl,
  onEditNode,
  onDeleteNode,
  theme
}) => {
  const { settings, updateDisplaySettings } = useSettings();
  const currentEngine = settings.displaySettings?.renderEngine || RenderEngine.THREEJS;
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  
  const [editingNode, setEditingNode] = useState<CustomNode | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [contextMenuNode, setContextMenuNode] = useState<CustomNode | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const engineDropdownRef = useRef<HTMLDivElement>(null);
  
  // Закрытие контекстного меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenuNode(null);
      }
    };
    
    if (contextMenuNode) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenuNode]);
  
  // Закрытие dropdown движков при клике ВНЕ его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(event.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
    };
    
    if (isEngineDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEngineDropdownOpen]);
  
  const handleStartEdit = (node: CustomNode) => {
    setEditingNode(node);
    setEditName(node.name);
    setEditUrl(node.url);
    setContextMenuNode(null);
  };
  
  const handleSaveEdit = () => {
    if (editingNode && onEditNode && editName.trim() && editUrl.trim()) {
      onEditNode(editingNode, { name: editName.trim(), url: editUrl.trim() });
      setEditingNode(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingNode(null);
    setEditName('');
    setEditUrl('');
  };
  
  const handleDelete = (node: CustomNode) => {
    if (onDeleteNode && confirm(`Удалить поток "${node.name}"?`)) {
      onDeleteNode(node);
      setContextMenuNode(null);
    }
  };
  
  const handleLongPressStart = (node: CustomNode) => {
    const timer = setTimeout(() => {
      setContextMenuNode(node);
    }, 500); // 500ms для long press
    setLongPressTimer(timer);
  };
  
  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div
      className="hidden lg:flex transition-all duration-500 border-r bg-black/5 flex-col overflow-hidden"
      style={{ borderColor: `${theme.text}11`, width: isOpen ? '480px' : '0' }}
    >
      <div className="p-10 w-[480px] h-full overflow-y-auto no-scrollbar space-y-10">
        <h3 className="text-[24px] font-black uppercase tracking-widest flex items-center gap-5"
            style={{ color: theme.text }}>
          <Hexagon size={32} /> NEURAL_CORE
        </h3>
        
        {/* Dropdown для выбора движка рендеринга */}
        <div className="relative" ref={engineDropdownRef}>
          <button
            onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
            className="w-full flex items-center justify-between px-6 py-5 rounded-xl bg-black/20 hover:bg-black/30 transition-all border-2"
            style={{ borderColor: `${theme.text}22`, color: theme.text }}
          >
            <div className="flex items-center gap-5">
              <span className="text-5xl">
                {RENDER_ENGINES.find(e => e.id === currentEngine)?.icon || '🎨'}
              </span>
              <div className="text-left">
                <div className="text-[22px] font-black uppercase tracking-wider">
                  {RENDER_ENGINES.find(e => e.id === currentEngine)?.name || 'Three.js'}
                </div>
                <div className="text-[16px] opacity-50">
                  {RENDER_ENGINES.find(e => e.id === currentEngine)?.performance || 'medium'}
                </div>
              </div>
            </div>
            <ChevronDown 
              size={32} 
              className="transition-transform"
              style={{ transform: isEngineDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          
          {/* Dropdown menu */}
          {isEngineDropdownOpen && (
            <div 
              className="absolute top-full left-0 right-0 mt-1 py-1 rounded-lg bg-black/95 backdrop-blur-xl border shadow-xl z-50 max-h-80 overflow-y-auto"
              style={{ borderColor: `${theme.text}22` }}
              onClick={(e) => e.stopPropagation()} // Не закрывать при клике внутри
            >
              {RENDER_ENGINES.map(engine => {
                const isActive = currentEngine === engine.id;
                const isAvailable = engine.id === RenderEngine.CSS3D || engine.id === RenderEngine.THREEJS; // Пока доступны только эти
                
                return (
                  <button
                    key={engine.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAvailable) {
                        updateDisplaySettings({ renderEngine: engine.id });
                      }
                    }}
                    disabled={!isAvailable}
                    className="w-full px-6 py-5 flex items-start gap-5 hover:bg-white/10 transition-all text-left rounded-lg relative"
                    style={{
                      backgroundColor: isActive ? `${theme.text}15` : 'transparent',
                      opacity: isAvailable ? 1 : 0.3,
                      cursor: isAvailable ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {/* Интерактивная пиктограмма с hover эффектом */}
                    <span 
                      className="text-4xl mt-1 transition-transform hover:scale-110 active:scale-95"
                      style={{ 
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        filter: isActive ? 'brightness(1.3)' : 'brightness(1)'
                      }}
                    >
                      {engine.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[22px] font-black uppercase tracking-wider" style={{ color: theme.text }}>
                          {engine.name}
                        </span>
                        {!isAvailable && (
                          <span className="text-[14px] px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 font-bold">
                            SOON
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[14px] px-3 py-1.5 rounded-lg font-bold" style={{ backgroundColor: theme.text + '20', color: theme.text }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[16px] opacity-60 mt-2" style={{ color: theme.text }}>
                        {engine.description}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {engine.features.slice(0, 3).map((feat, i) => (
                          <span 
                            key={i} 
                            className="text-[13px] px-3 py-1.5 rounded"
                            style={{ backgroundColor: `${theme.text}10`, color: theme.text }}
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {providers.map(p => {
          const genres = p.id === Provider.CUSTOM
            ? customNodes
            : genresByProvider[p.id] || [];
          
          return (
            <div key={p.id} className="space-y-3">
              <div className="text-[18px] font-black uppercase opacity-40 mb-3 px-6 tracking-wider">
                {p.name}
              </div>
              
              {genres.slice(0, 15).map((g: any) => {
                const name = typeof g === 'string' ? g : g.name;
                const url = typeof g === 'string' ? getGenreUrl(name, p.id) : g.url;
                const isCustom = p.id === Provider.CUSTOM;
                const node = isCustom ? g as CustomNode : null;
                const isEditing = node && editingNode?.name === node.name && editingNode?.url === node.url;
                const hasContextMenu = node && contextMenuNode?.name === node.name && contextMenuNode?.url === node.url;
                
                if (isEditing) {
                  return (
                    <div key={name} className="space-y-3 p-4 rounded-xl bg-black/20">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Название"
                        className="w-full px-4 py-3 text-[16px] font-bold uppercase rounded-lg bg-black/30 border-2 border-white/10"
                        style={{ color: theme.text }}
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={e => setEditUrl(e.target.value)}
                        placeholder="URL"
                        className="w-full px-4 py-3 text-[14px] rounded-lg bg-black/30 border-2 border-white/10"
                        style={{ color: theme.text }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-4 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all flex items-center justify-center"
                          style={{ color: theme.text }}
                        >
                          <Check size={24} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all flex items-center justify-center"
                          style={{ color: theme.text }}
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={name} className="relative">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => url && onGenreClick(url, name, p.id as Provider, true)}
                        onMouseDown={() => isCustom && node && handleLongPressStart(node)}
                        onMouseUp={handleLongPressEnd}
                        onTouchStart={() => isCustom && node && handleLongPressStart(node)}
                        onTouchEnd={handleLongPressEnd}
                        className="flex-1 text-left px-6 py-4 rounded-xl text-[18px] font-black uppercase transition-all shadow-lg"
                        style={{
                          backgroundColor: currentGenre === name ? theme.accent : 'transparent',
                          color: currentGenre === name ? (theme.isLight ? '#000' : '#fff') : theme.text,
                          opacity: currentGenre === name ? 1 : 0.6
                        }}
                        onMouseEnter={e => currentGenre !== name && (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => {
                          handleLongPressEnd();
                          if (currentGenre !== name) e.currentTarget.style.opacity = '0.6';
                        }}
                      >
                        {name}
                      </button>
                      {isCustom && node && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenuNode(hasContextMenu ? null : node);
                          }}
                          className="p-3 rounded-lg hover:bg-white/20 active:bg-white/30 transition-all shrink-0"
                          style={{ 
                            color: theme.text, 
                            opacity: hasContextMenu ? 1 : 0.6,
                            backgroundColor: hasContextMenu ? 'rgba(255,255,255,0.1)' : 'transparent'
                          }}
                          title="Меню управления"
                        >
                          <MoreVertical size={32} />
                        </button>
                      )}
                    </div>
                    
                    {hasContextMenu && node && (
                      <div 
                        ref={contextMenuRef}
                        className="absolute right-0 top-full mt-1 bg-black/95 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20 p-1 z-50 min-w-[140px]"
                      >
                        <button
                          onClick={() => handleStartEdit(node)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase rounded hover:bg-blue-500/30 transition-all"
                          style={{ color: theme.text }}
                        >
                          <Edit2 size={13} /> ИЗМЕНИТЬ
                        </button>
                        <button
                          onClick={() => handleDelete(node)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase rounded hover:bg-red-500/40 transition-all"
                          style={{ color: theme.text }}
                        >
                          <Trash2 size={13} /> УДАЛИТЬ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
