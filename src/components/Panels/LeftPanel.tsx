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
import { Hexagon, Globe, Orbit, Edit2, Trash2, Check, X, MoreVertical } from 'lucide-react';
import { Provider, CustomNode } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

interface LeftPanelProps {
  isOpen: boolean;
  width?: number;
  onResizeStart?: () => void;
  providers: Array<{ id: Provider | string; name: string; color: string }>;
  genresByProvider: Record<string, (string | any)[]>;
  customNodes: CustomNode[];
  currentGenre: string | any;
  onGenreClick: (url: string, name: string, provider: Provider, updateSearch: boolean) => void;
  getGenreUrl: (genre: string | any, provider: Provider | string) => string | undefined;
  onEditNode?: (oldNode: CustomNode, newNode: CustomNode) => void;
  onDeleteNode?: (node: CustomNode) => void;
  onAddNode?: (node: CustomNode) => void;
  theme: { text: string };
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  isOpen,
  width = 320,
  onResizeStart,
  providers,
  genresByProvider,
  customNodes,
  currentGenre,
  onGenreClick,
  getGenreUrl,
  onEditNode,
  onDeleteNode,
  onAddNode,
  theme
}) => {
  const { settings } = useSettings();
  
  const [isHovered, setIsHovered] = useState(false);
  const shouldShow = isOpen || isHovered;
  
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
    setContextMenuNode(null); // Закрываем меню
  };
  
  const handleSaveEdit = () => {
    if (editingNode && onEditNode && editName.trim() && editUrl.trim()) {
      const updatedNode: CustomNode = {
        ...editingNode,
        name: editName.trim(),
        url: editUrl.trim()
      };
      onEditNode(editingNode, updatedNode);
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
    <>
      {/* Hover trigger zone */}
      <div
        className="hidden lg:block absolute left-0 top-[60px] bottom-0 w-4 z-30"
        onMouseEnter={() => setIsHovered(true)}
      />
      
      <div
        className="transition-all duration-500 border-r bg-black/5 backdrop-blur-2xl flex flex-col overflow-hidden absolute left-0 top-[60px] bottom-0 z-40"
        style={{ 
          borderColor: `${theme.text}08`, 
          width: shouldShow ? `${width}px` : '0',
          opacity: shouldShow ? 1 : 0,
          pointerEvents: shouldShow ? 'auto' : 'none'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onWheel={(e) => e.stopPropagation()}
      >
      {/* Resize handle */}
      {shouldShow && onResizeStart && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20 transition-colors z-50"
          onMouseDown={onResizeStart}
          style={{ backgroundColor: `${theme.text}10` }}
        />
      )}
      <div 
        className="p-3 md:p-4 w-full min-w-[280px] max-w-[380px] h-full overflow-y-auto no-scrollbar space-y-4"
        onWheel={(e) => e.stopPropagation()} // Изолируем скролл списка
      >
        <h3 className="text-sm md:text-base font-bold uppercase tracking-wider flex items-center gap-2 opacity-60"
            style={{ color: theme.text }}>
          <Hexagon className="w-4 h-4" /> NEURAL_CORE
        </h3>
        
        {providers.map(p => {
          const genres = p.id === Provider.CUSTOM
            ? customNodes
            : genresByProvider[p.id] || [];
          
          return (
            <div 
              key={p.id} 
              className="space-y-2"
              onWheel={(e) => e.stopPropagation()} // Изолируем скролл списка жанров
            >
              <div className="text-xs font-semibold uppercase opacity-40 mb-2 px-3 tracking-wide">
                {p.name}
              </div>
              
              {genres.slice(0, 15).map((g: any) => {
                const name = typeof g === 'string' ? g : g.name;
                const url = typeof g === 'string' ? getGenreUrl(name, p.id) : g.url;
                const isCustom = p.id === Provider.CUSTOM;
                
                // Создаем временный node для любого потока (для UI кнопок)
                const node: CustomNode = isCustom 
                  ? g as CustomNode 
                  : {
                      id: `${p.id}-${name}`,
                      name,
                      url: url || '',
                      provider: p.id as Provider
                    };
                
                const isEditing = editingNode?.name === node.name && editingNode?.url === node.url;
                const hasContextMenu = contextMenuNode?.name === node.name && contextMenuNode?.url === node.url;
                
                if (isEditing) {
                  return (
                    <div key={name} className="space-y-2 p-2 rounded-lg bg-black/10 backdrop-blur-sm">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Название"
                        className="w-full px-2 py-1.5 text-sm font-medium rounded bg-black/20 border border-white/10"
                        style={{ color: theme.text }}
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={e => setEditUrl(e.target.value)}
                        placeholder="URL"
                        className="w-full px-2 py-1.5 text-xs rounded bg-black/20 border border-white/10"
                        style={{ color: theme.text }}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-2 py-1.5 rounded bg-green-500/20 hover:bg-green-500/30 transition-all flex items-center justify-center"
                          style={{ color: theme.text }}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-2 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-all flex items-center justify-center"
                          style={{ color: theme.text }}
                        >
                          <X size={16} />
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
                        className="flex-1 text-left px-3 py-2 rounded-lg text-sm font-semibold uppercase transition-all"
                        style={{
                          backgroundColor: currentGenre === name ? `${theme.accent}20` : 'transparent',
                          color: currentGenre === name ? theme.accent : theme.text,
                          opacity: currentGenre === name ? 1 : 0.5,
                          borderLeft: currentGenre === name ? `2px solid ${theme.accent}` : '2px solid transparent'
                        }}
                        onMouseEnter={e => currentGenre !== name && (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => {
                          handleLongPressEnd();
                          if (currentGenre !== name) e.currentTarget.style.opacity = '0.6';
                        }}
                      >
                        {name}
                      </button>
                      {/* Кнопка меню для ВСЕХ потоков */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuNode(hasContextMenu ? null : node);
                        }}
                        className="p-1.5 rounded hover:bg-white/10 active:bg-white/20 transition-all shrink-0"
                        style={{ 
                          color: theme.text, 
                          opacity: hasContextMenu ? 1 : 0.4,
                          backgroundColor: hasContextMenu ? 'rgba(255,255,255,0.1)' : 'transparent'
                        }}
                        title="Меню управления"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    
                    {hasContextMenu && (
                      <div 
                        ref={contextMenuRef}
                        className="absolute right-0 top-full mt-1 bg-black/90 backdrop-blur-xl rounded shadow-xl border border-white/10 p-0.5 z-50 min-w-[120px]"
                      >
                        <button
                          onClick={() => handleStartEdit(node)}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded hover:bg-blue-500/20 transition-all"
                          style={{ color: theme.text }}
                        >
                          <Edit2 size={12} /> Изменить
                        </button>
                        <button
                          onClick={() => {
                            if (isCustom) {
                              handleDelete(node);
                            } else {
                              // Для встроенных потоков - копируем в User Nodes
                              if (onAddNode && confirm(`Скопировать "${node.name}" в User Nodes?`)) {
                                onAddNode(node);
                                setContextMenuNode(null);
                              }
                            }
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded hover:bg-red-500/20 transition-all"
                          style={{ color: theme.text }}
                        >
                          <Trash2 size={12} /> {isCustom ? 'Удалить' : 'Копировать'}
                        </button>
                        {!isCustom && (
                          <button
                            onClick={() => {
                              if (confirm(`Удалить поток "${node.name}" из списка?`)) {
                                // Для встроенных потоков просто скрываем (можно реализовать blacklist)
                                setContextMenuNode(null);
                                // TODO: Добавить в blacklist если нужно постоянное скрытие
                              }
                            }}
                            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded hover:bg-red-500/20 transition-all"
                            style={{ color: theme.text }}
                          >
                            <Trash2 size={12} /> Удалить
                          </button>
                        )}
                        <div className="border-t border-white/10 my-0.5" />
                        <button
                          onClick={() => setContextMenuNode(null)}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded hover:bg-white/10 transition-all"
                          style={{ color: theme.text, opacity: 0.5 }}
                        >
                          <X size={12} /> Закрыть
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
    </>
  );
};
