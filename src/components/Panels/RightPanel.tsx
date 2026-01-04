/**
 * RightPanel.tsx
 * 
 * Правая боковая панель для управления custom nodes
 * Содержит:
 * - Список custom потоков
 * - Редактирование (название и URL)
 * - Удаление
 * - Добавление новых
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Radio } from 'lucide-react';
import { CustomNode, Provider } from '../../types';

interface RightPanelProps {
  isOpen: boolean;
  customNodes: CustomNode[];
  currentGenre: string | any;
  onGenreClick: (url: string, name: string, provider: Provider, updateSearch: boolean) => void;
  onEditNode?: (oldNode: CustomNode, newNode: CustomNode) => void;
  onDeleteNode?: (node: CustomNode) => void;
  onAddNode?: (node: CustomNode) => void;
  theme: { text: string; accent: string; isLight?: boolean };
}

export const RightPanel: React.FC<RightPanelProps> = ({
  isOpen,
  customNodes,
  currentGenre,
  onGenreClick,
  onEditNode,
  onDeleteNode,
  onAddNode,
  theme
}) => {
  const [editingNode, setEditingNode] = useState<CustomNode | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Редактирование
  const handleStartEdit = (node: CustomNode) => {
    setEditingNode(node);
    setEditName(node.name);
    setEditUrl(node.url);
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (editingNode && onEditNode && editName.trim() && editUrl.trim()) {
      onEditNode(editingNode, { name: editName.trim(), url: editUrl.trim() });
      setEditingNode(null);
      setEditName('');
      setEditUrl('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNode(null);
    setEditName('');
    setEditUrl('');
  };

  // Удаление
  const handleDelete = (node: CustomNode) => {
    if (onDeleteNode && confirm(`Удалить "${node.name}"?`)) {
      onDeleteNode(node);
    }
  };

  // Добавление
  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingNode(null);
    setNewName('');
    setNewUrl('');
  };

  const handleSaveAdd = () => {
    if (onAddNode && newName.trim() && newUrl.trim()) {
      onAddNode({ name: newName.trim(), url: newUrl.trim() });
      setIsAdding(false);
      setNewName('');
      setNewUrl('');
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewName('');
    setNewUrl('');
  };

  return (
    <div
      className="hidden lg:flex transition-all duration-500 border-l bg-black/5 flex-col overflow-hidden"
      style={{ borderColor: `${theme.text}11`, width: isOpen ? '320px' : '0' }}
    >
      <div className="w-80 h-full flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b" style={{ borderColor: `${theme.text}11` }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                style={{ color: theme.text }}>
              <Radio size={12} /> CUSTOM STREAMS
            </h3>
            <button
              onClick={handleStartAdd}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
              style={{ color: theme.accent }}
              title="Добавить поток"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="text-[8px] opacity-40" style={{ color: theme.text }}>
            {customNodes.length} потоков
          </div>
        </div>

        {/* Список потоков */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
          {/* Форма добавления */}
          {isAdding && (
            <div className="p-3 rounded-lg bg-black/20 border space-y-2" style={{ borderColor: theme.accent }}>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Название потока"
                className="w-full px-3 py-2 text-[10px] font-bold uppercase rounded-lg bg-black/30 border border-white/10 focus:border-white/30 outline-none"
                style={{ color: theme.text }}
                autoFocus
              />
              <input
                type="text"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://stream-url.com/radio.mp3"
                className="w-full px-3 py-2 text-[9px] rounded-lg bg-black/30 border border-white/10 focus:border-white/30 outline-none"
                style={{ color: theme.text }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAdd}
                  className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1 text-[9px] font-bold"
                  style={{ color: theme.text }}
                >
                  <Check size={14} /> SAVE
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1 text-[9px] font-bold"
                  style={{ color: theme.text }}
                >
                  <X size={14} /> CANCEL
                </button>
              </div>
            </div>
          )}

          {/* Список custom nodes */}
          {customNodes.map((node, idx) => {
            const isEditing = editingNode?.name === node.name && editingNode?.url === node.url;
            const isCurrent = currentGenre === node.name;

            if (isEditing) {
              return (
                <div key={idx} className="p-3 rounded-lg bg-black/20 border space-y-2" style={{ borderColor: theme.accent }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Название"
                    className="w-full px-3 py-2 text-[10px] font-bold uppercase rounded-lg bg-black/30 border border-white/10 focus:border-white/30 outline-none"
                    style={{ color: theme.text }}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editUrl}
                    onChange={e => setEditUrl(e.target.value)}
                    placeholder="URL"
                    className="w-full px-3 py-2 text-[9px] rounded-lg bg-black/30 border border-white/10 focus:border-white/30 outline-none"
                    style={{ color: theme.text }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1 text-[9px] font-bold"
                      style={{ color: theme.text }}
                    >
                      <Check size={14} /> SAVE
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1 text-[9px] font-bold"
                      style={{ color: theme.text }}
                    >
                      <X size={14} /> CANCEL
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="group p-3 rounded-lg transition-all border"
                style={{
                  backgroundColor: isCurrent ? `${theme.accent}22` : 'transparent',
                  borderColor: isCurrent ? theme.accent : `${theme.text}11`
                }}
              >
                <button
                  onClick={() => onGenreClick(node.url, node.name, Provider.CUSTOM, true)}
                  className="w-full text-left mb-2"
                >
                  <div className="text-[10px] font-black uppercase mb-1" style={{ color: theme.text }}>
                    {node.name}
                  </div>
                  <div className="text-[8px] opacity-40 truncate" style={{ color: theme.text }}>
                    {node.url}
                  </div>
                </button>
                <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(node);
                    }}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1 text-[8px] font-bold"
                    style={{ color: theme.text }}
                  >
                    <Edit2 size={12} /> EDIT
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(node);
                    }}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1 text-[8px] font-bold"
                    style={{ color: theme.text }}
                  >
                    <Trash2 size={12} /> DELETE
                  </button>
                </div>
              </div>
            );
          })}

          {customNodes.length === 0 && !isAdding && (
            <div className="text-center py-8 opacity-30" style={{ color: theme.text }}>
              <Radio size={32} className="mx-auto mb-2 opacity-20" />
              <div className="text-[9px] font-bold">Нет custom потоков</div>
              <div className="text-[8px] mt-1">Нажмите + чтобы добавить</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
