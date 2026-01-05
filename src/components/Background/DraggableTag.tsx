/**
 * DraggableTag.tsx
 * 
 * Обертка для тегов в облаке с поддержкой drag & drop через LayoutContext
 */

import React from 'react';
import { DraggableElement } from '../UI/DraggableElement';

interface DraggableTagProps {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  data: any;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const DraggableTag: React.FC<DraggableTagProps> = ({
  id,
  x,
  y,
  z,
  size,
  data,
  onClick,
  children,
  className = '',
  style = {}
}) => {
  const tagName = typeof data === 'string' ? data : (data?.name || data?.id || 'unknown');
  const uniqueId = `tag-${tagName.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return (
    <DraggableElement
      id={uniqueId}
      showHandle={false}
      resizable={false}
      defaultPanel="float"
      defaultPosition={{ x, y }}
      defaultSize={{ width: size * 100, height: size * 50 }}
      className={className}
      style={style}
    >
      <div 
        onClick={onClick}
        className="pointer-events-auto"
        style={{ cursor: 'pointer' }}
      >
        {children}
      </div>
    </DraggableElement>
  );
};
