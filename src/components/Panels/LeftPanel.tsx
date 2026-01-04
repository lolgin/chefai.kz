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
      style={{ borderColor: `${theme.text}11`, width: isOpen ? '280px' : '0' }}
    >
      <div className="p-6 w-80 h-full overflow-y-auto no-scrollbar space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            style={{ color: theme.text }}>
          <Hexagon size={12} /> NEURAL_CORE
        </h3>
        
        {/* Dropdown для выбора движка рендеринга */}
        <div className="relative">
          <button
            onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-black/20 hover:bg-black/30 transition-all border"
            style={{ borderColor: `${theme.text}22`, color: theme.text }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {RENDER_ENGINES.find(e => e.id === currentEngine)?.icon || '🎨'}
              </span>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase tracking-wider">
                  {RENDER_ENGINES.find(e => e.id === currentEngine)?.name || 'Three.js'}
                </div>
                <div className="text-[7px] opacity-50">
                  {RENDER_ENGINES.find(e => e.id === currentEngine)?.performance || 'medium'}
                </div>
              </div>
            </div>
            <ChevronDown 
              size={14} 
              className="transition-transform"
              style={{ transform: isEngineDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          
          {/* Dropdown menu */}
          {isEngineDropdownOpen && (
            <div 
              className="absolute top-full left-0 right-0 mt-1 py-1 rounded-lg bg-black/95 backdrop-blur-xl border shadow-xl z-50 max-h-80 overflow-y-auto"
              style={{ borderColor: `${theme.text}22` }}
            >
              {RENDER_ENGINES.map(engine => {
                const isActive = currentEngine === engine.id;
                const isAvailable = engine.id === RenderEngine.CSS3D || engine.id === RenderEngine.THREEJS; // Пока доступны только эти
                
                return (
                  <button
                    key={engine.id}
                    onClick={() => {
                      if (isAvailable) {
                        updateDisplaySettings({ renderEngine: engine.id });
                        setIsEngineDropdownOpen(false);
                      }
                    }}
                    disabled={!isAvailable}
                    className="w-full px-3 py-2 flex items-start gap-2 hover:bg-white/10 transition-all text-left"
                    style={{
                      backgroundColor: isActive ? `${theme.text}15` : 'transparent',
                      opacity: isAvailable ? 1 : 0.3,
                      cursor: isAvailable ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <span className="text-xl mt-0.5">{engine.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-black uppercase tracking-wider" style={{ color: theme.text }}>
                          {engine.name}
                        </span>
                        {!isAvailable && (
                          <span className="text-[7px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                            SOON
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[7px] px-1.5 py-0.5 rounded" style={{ backgroundColor: theme.text + '20', color: theme.text }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] opacity-60 mt-0.5" style={{ color: theme.text }}>
                        {engine.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {engine.features.slice(0, 3).map((feat, i) => (
                          <span 
                            key={i} 
                            className="text-[6px] px-1 py-0.5 rounded"
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
            <div key={p.id} className="space-y-1">
              <div className="text-[7px] font-black uppercase opacity-20 mb-1.5 px-3 tracking-tighter">
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
                    <div key={name} className="space-y-1 p-2 rounded-lg bg-black/20">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Название"
                        className="w-full px-2 py-1 text-[9px] font-bold uppercase rounded bg-black/30 border border-white/10"
                        style={{ color: theme.text }}
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={e => setEditUrl(e.target.value)}
                        placeholder="URL"
                        className="w-full px-2 py-1 text-[8px] rounded bg-black/30 border border-white/10"
                        style={{ color: theme.text }}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-2 py-1 rounded bg-green-500/20 hover:bg-green-500/30 transition-all flex items-center justify-center"
                          style={{ color: theme.text }}
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 transition-all flex items-center justify-center"
                          style={{ color: theme.text }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={name} className="relative">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => url && onGenreClick(url, name, p.id as Provider, true)}
                        onMouseDown={() => isCustom && node && handleLongPressStart(node)}
                        onMouseUp={handleLongPressEnd}
                        onTouchStart={() => isCustom && node && handleLongPressStart(node)}
                        onTouchEnd={handleLongPressEnd}
                        className="flex-1 text-left px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shadow-md"
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
                          className="p-1.5 rounded-md hover:bg-white/20 active:bg-white/30 transition-all shrink-0"
                          style={{ 
                            color: theme.text, 
                            opacity: hasContextMenu ? 1 : 0.6,
                            backgroundColor: hasContextMenu ? 'rgba(255,255,255,0.1)' : 'transparent'
                          }}
                          title="Меню управления"
                        >
                          <MoreVertical size={16} />
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
