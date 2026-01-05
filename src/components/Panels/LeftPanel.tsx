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
    <div
      className="hidden lg:flex transition-all duration-500 border-r bg-black/20 backdrop-blur-xl flex-col overflow-hidden absolute left-0 top-0 bottom-0 z-40"
      style={{ borderColor: `${theme.text}11`, width: isOpen ? '480px' : '0' }}
      onWheel={(e) => e.stopPropagation()} // Изолируем скролл панели
    >
      <div 
        className="p-10 w-[480px] h-full overflow-y-auto no-scrollbar space-y-10"
        onWheel={(e) => e.stopPropagation()} // Изолируем скролл списка
      >
        <h3 className="text-[24px] font-black uppercase tracking-widest flex items-center gap-5"
            style={{ color: theme.text }}>
          <Hexagon size={32} /> NEURAL_CORE
        </h3>
        
        {providers.map(p => {
          const genres = p.id === Provider.CUSTOM
            ? customNodes
            : genresByProvider[p.id] || [];
          
          return (
            <div 
              key={p.id} 
              className="space-y-3"
              onWheel={(e) => e.stopPropagation()} // Изолируем скролл списка жанров
            >
              <div className="text-[18px] font-black uppercase opacity-40 mb-3 px-6 tracking-wider">
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
                      {/* Кнопка меню для ВСЕХ потоков */}
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
                    </div>
                    
                    {hasContextMenu && (
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
                          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase rounded hover:bg-red-500/40 transition-all"
                          style={{ color: theme.text }}
                        >
                          <Trash2 size={13} /> {isCustom ? 'УДАЛИТЬ' : 'КОПИРОВАТЬ'}
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
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase rounded hover:bg-red-500/40 transition-all"
                            style={{ color: theme.text }}
                          >
                            <Trash2 size={13} /> УДАЛИТЬ
                          </button>
                        )}
                        <div className="border-t border-white/10 my-1" />
                        <button
                          onClick={() => setContextMenuNode(null)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase rounded hover:bg-white/10 transition-all"
                          style={{ color: theme.text, opacity: 0.6 }}
                        >
                          <X size={13} /> ЗАКРЫТЬ
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
