/**
 * TagContextMenu.tsx
 * 
 * Универсальное контекстное меню для всех тегов
 * Активируется долгим удержанием (2 сек)
 * Содержит: Сохранить, Изменить, Удалить
 */

import React from 'react';
import { Edit2, Trash2, Save, Copy, X, Eye, EyeOff } from 'lucide-react';

interface TagContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  item: any;
  moduleType: string;
  onSave?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onCopy?: (item: any) => void;
  onToggleIcon?: (item: any) => void;
  onClose: () => void;
  theme: { text: string; accent: string };
  showIcons?: boolean;
}

export const TagContextMenu: React.FC<TagContextMenuProps> = ({
  isVisible,
  position,
  item,
  moduleType,
  onSave,
  onEdit,
  onDelete,
  onCopy,
  onToggleIcon,
  onClose,
  theme,
  showIcons = true
}) => {
  if (!isVisible) return null;

  // Определяем какие действия доступны для каждого типа модуля
  const canSave = ['discovery', 'streams'].includes(moduleType);
  const canEdit = ['streams', 'nodes'].includes(moduleType);
  const canDelete = ['streams', 'nodes'].includes(moduleType);
  const canCopy = true; // Копировать можно всегда

  return (
    <>
      {/* Backdrop для закрытия меню */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />
      
      {/* Меню */}
      <div
        className="fixed z-[9999] bg-black/90 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 p-1 min-w-[140px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          color: theme.text
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {canSave && onSave && (
          <button
            onClick={() => {
              onSave(item);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded hover:bg-green-500/20 transition-all"
            style={{ color: theme.text }}
          >
            <Save size={14} /> Сохранить
          </button>
        )}
        
        {canEdit && onEdit && (
          <button
            onClick={() => {
              onEdit(item);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded hover:bg-blue-500/20 transition-all"
            style={{ color: theme.text }}
          >
            <Edit2 size={14} /> Изменить
          </button>
        )}
        
        {canCopy && onCopy && (
          <button
            onClick={() => {
              onCopy(item);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded hover:bg-purple-500/20 transition-all"
            style={{ color: theme.text }}
          >
            <Copy size={14} /> Копировать
          </button>
        )}
        
        {canDelete && onDelete && (
          <>
            <div className="border-t border-white/10 my-1" />
            <button
              onClick={() => {
                onDelete(item);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded hover:bg-red-500/20 transition-all"
              style={{ color: theme.text }}
            >
              <Trash2 size={14} /> Удалить
            </button>
          </>
        )}
        
        {onToggleIcon && (
          <button
            onClick={() => {
              onToggleIcon(item);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded hover:bg-yellow-500/20 transition-all"
            style={{ color: theme.text }}
          >
            {showIcons ? <EyeOff size={14} /> : <Eye size={14} />} {showIcons ? 'Скрыть' : 'Показать'} обложку
          </button>
        )}
        
        <div className="border-t border-white/10 my-1" />
        <button
          onClick={onClose}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded hover:bg-white/10 transition-all opacity-50"
          style={{ color: theme.text }}
        >
          <X size={14} /> Закрыть
        </button>
      </div>
    </>
  );
};
