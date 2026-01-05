/**
 * DraggableElement.tsx
 * 
 * Обертка для создания перетаскиваемых и изменяемых элементов интерфейса
 */

import React, { useRef, useState, useEffect } from 'react';
import { GripVertical, Maximize2 } from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';

interface DraggableElementProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showHandle?: boolean; // Показывать ручку для перетаскивания
  resizable?: boolean; // Можно ли менять размер
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  id,
  children,
  className = '',
  style = {},
  showHandle = true,
  resizable = false
}) => {
  const { layouts, updateLayout, isDragging, setIsDragging, isResizing, setIsResizing } = useLayout();
  const layout = layouts[id];
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  if (!layout || !layout.visible) return null;

  const handleDragStart = (e: React.MouseEvent) => {
    if (layout.locked) return;
    e.stopPropagation();
    
    setIsDragging(id);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (layout.locked) return;
    e.stopPropagation();
    e.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsResizing(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height
    });
  };

  useEffect(() => {
    if (isDragging !== id && isResizing !== id) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Dragging
      if (isDragging === id && dragStart && layout.panel === 'float') {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        updateLayout(id, {
          position: {
            x: (layout.position?.x || 0) + dx,
            y: (layout.position?.y || 0) + dy
          }
        });
        
        setDragStart({ x: e.clientX, y: e.clientY });
      }

      // Resizing
      if (isResizing === id && resizeStart) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
        
        let newWidth = resizeStart.width + dx;
        let newHeight = resizeStart.height + dy;

        // Apply constraints
        if (layout.minSize) {
          newWidth = Math.max(newWidth, layout.minSize.width);
          newHeight = Math.max(newHeight, layout.minSize.height);
        }
        if (layout.maxSize) {
          newWidth = Math.min(newWidth, layout.maxSize.width);
          newHeight = Math.min(newHeight, layout.maxSize.height);
        }

        updateLayout(id, {
          size: { width: newWidth, height: newHeight }
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      setIsResizing(null);
      setDragStart(null);
      setResizeStart(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, id, layout]);

  const containerStyle: React.CSSProperties = {
    ...style,
    position: layout.panel === 'float' ? 'fixed' : 'relative',
    ...(layout.position && layout.panel === 'float' ? {
      left: layout.position.x,
      top: layout.position.y
    } : {}),
    ...(layout.size ? {
      width: layout.size.width,
      height: layout.size.height
    } : {}),
    cursor: isDragging === id ? 'grabbing' : 'default',
    transition: isDragging === id || isResizing === id ? 'none' : 'all 0.2s ease'
  };

  return (
    <div
      ref={containerRef}
      className={`${className} ${isDragging === id ? 'opacity-80 z-[100]' : ''}`}
      style={containerStyle}
      data-draggable-id={id}
    >
      {showHandle && !layout.locked && (
        <div
          className="absolute top-1 left-1 p-1 cursor-grab hover:bg-white/10 rounded opacity-0 hover:opacity-100 transition-opacity z-10"
          onMouseDown={handleDragStart}
          title="Перетащить элемент"
        >
          <GripVertical size={14} className="opacity-50" />
        </div>
      )}

      {children}

      {resizable && !layout.locked && (
        <div
          className="absolute bottom-0 right-0 p-1 cursor-nwse-resize hover:bg-white/10 rounded opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
          title="Изменить размер"
        >
          <Maximize2 size={12} className="opacity-50" />
        </div>
      )}
    </div>
  );
};
