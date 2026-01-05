/**
 * ShardCloud.tsx
 * 
 * Компонент 3D облака тегов на фоне
 * Содержит:
 * - Вращающееся 3D облако
 * - Интерактивные теги с перетаскиванием
 * - Управление: ПКМ - вращение, колесико - zoom
 */

import React, { useRef, useState, useEffect } from 'react';

interface ShardCloudProps {
  rotation: { x: number; y: number };
  shards: Array<{
    data: any;
    x: number;
    y: number;
    z: number;
    size: number;
  }>;
  onShardClick: (item: any) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  theme: { accent: string };
  onResetPositions?: () => void;
  fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  showIcons?: boolean;
}

export const ShardCloud: React.FC<ShardCloudProps> = ({
  rotation: externalRotation,
  shards,
  onShardClick,
  isDragging,
  onDragStart,
  onDragEnd,
  theme,
  onResetPositions,
  fontSize = 'lg',
  showIcons = true
}) => {
  // Мапинг размеров шрифта
  const fontSizeMap = {
    xs: 0.5,
    sm: 0.7,
    md: 0.9,
    lg: 1.0,
    xl: 1.3,
    xxl: 1.7
  };
  const fontScale = fontSizeMap[fontSize];
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [localRotation, setLocalRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const rotationStartRef = useRef({ x: 0, y: 0 });
  
  // Хранилище пользовательских позиций тегов
  const [customPositions, setCustomPositions] = useState<Map<string, { x: number; y: number; z: number }>>(new Map());
  const [draggedShard, setDraggedShard] = useState<number | null>(null);
  const shardDragStartRef = useRef({ x: 0, y: 0 });
  
  // Загрузка сохраненных позиций из localStorage
  useEffect(() => {
    const loadPositions = () => {
      const saved = localStorage.getItem('aurawave_custom_positions');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setCustomPositions(new Map(Object.entries(data)));
        } catch (e) {
          console.error('Failed to load custom positions');
        }
      } else {
        setCustomPositions(new Map());
      }
    };
    
    loadPositions();
    
    // Слушаем событие сброса позиций
    const handleReset = () => {
      setCustomPositions(new Map());
    };
    
    window.addEventListener('resetCloudPositions', handleReset);
    return () => window.removeEventListener('resetCloudPositions', handleReset);
  }, []);
  
  // Сохранение позиций в localStorage
  const savePositions = (positions: Map<string, { x: number; y: number; z: number }>) => {
    const obj = Object.fromEntries(positions);
    localStorage.setItem('aurawave_custom_positions', JSON.stringify(obj));
  };

  // Вращение правой кнопкой мыши
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) { // Правая кнопка
        e.preventDefault();
        setIsRightDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        rotationStartRef.current = { ...localRotation };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isRightDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setLocalRotation({
          x: rotationStartRef.current.x + dy * 0.3,
          y: rotationStartRef.current.y + dx * 0.3
        });
      }
      
      // Перетаскивание отдельного тега
      if (draggedShard !== null) {
        const dx = e.clientX - shardDragStartRef.current.x;
        const dy = e.clientY - shardDragStartRef.current.y;
        
        const shard = shards[draggedShard];
        // Используем ПОЛНОЕ имя как ключ
        const fullName = typeof shard.data === 'string' 
          ? shard.data 
          : (shard.data?.name || shard.data?.title || shard.data?.url || `item_${draggedShard}`);
        
        // Получаем текущую позицию (кастомную или исходную)
        const currentPos = customPositions.get(fullName) || { x: shard.x, y: shard.y, z: shard.z };
        
        // Обновляем позицию (с учетом масштаба)
        const newPos = {
          x: currentPos.x + dx / zoom,
          y: currentPos.y + dy / zoom,
          z: currentPos.z
        };
        
        setCustomPositions(prev => {
          const updated = new Map(prev);
          updated.set(fullName, newPos);
          return updated;
        });
        
        shardDragStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        setIsRightDragging(false);
      }
      
      if (draggedShard !== null) {
        // Сохраняем позиции при окончании перетаскивания
        savePositions(customPositions);
        setDraggedShard(null);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Отключаем контекстное меню
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isRightDragging, localRotation, draggedShard, shards, customPositions, zoom]);

  // Zoom колесиком мыши
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prev => Math.max(0.3, Math.min(3, prev - e.deltaY * 0.001)));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const finalRotation = {
    x: externalRotation.x + localRotation.x,
    y: externalRotation.y + localRotation.y
  };

  return (
    <div
      ref={containerRef}
      className="scene-3d flex-1 pointer-events-auto"
      style={{ cursor: isRightDragging ? 'grabbing' : draggedShard !== null ? 'move' : 'default' }}
    >
      <div
        className="cloud-3d"
        style={{
          transform: `rotateX(${finalRotation.x}deg) rotateY(${finalRotation.y}deg) scale(${zoom})`
        }}
      >
        {shards.map((shard, i) => {
          // Извлекаем ПОЛНОЕ имя для ключа
          const fullName = typeof shard.data === 'string' 
            ? shard.data 
            : (shard.data?.name || shard.data?.title || shard.data?.url || `item_${i}`);
          
          // Извлекаем текст для отображения (обрезанный)
          let displayText = fullName;
          if (displayText.length > 12) {
            displayText = displayText.substring(0, 12).toUpperCase();
          }
          
          // Проверяем есть ли пользовательская позиция по ПОЛНОМУ имени
          const customPos = customPositions.get(fullName);
          const position = customPos || { x: shard.x, y: shard.y, z: shard.z };
          
          // ВАЖНО: DraggableTag не используется для CSS3D облака
          // потому что absolute positioning ломает translate3d transforms
          // Вместо этого используем существующую систему перетаскивания
          return (
            <div
              key={i}
              className="shard-item pointer-events-auto"
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px) rotateY(${-finalRotation.y}deg) rotateX(${-finalRotation.x}deg)`,
                transition: 'none',
                cursor: draggedShard === i ? 'grabbing' : 'grab'
              }}
              onClick={(e) => {
                // Клик только если не было перетаскивания
                if (!isRightDragging && draggedShard === null) {
                  onShardClick(shard.data);
                }
              }}
              onMouseDown={(e) => {
                // Левая кнопка - начало перетаскивания тега
                // Работает всегда, независимо от editMode
                if (e.button === 0) {
                  e.stopPropagation();
                  setDraggedShard(i);
                  shardDragStartRef.current = { x: e.clientX, y: e.clientY };
                }
              }}
            >
              <span
                className="shard-label font-black uppercase tracking-widest block select-none flex items-center gap-2"
                data-item={JSON.stringify(shard.data)}
                style={{
                  fontSize: `${shard.size * fontScale}rem`,
                  color: i % 5 === 0 ? theme.accent : 'inherit',
                  opacity: 0.15 + (position.z + 340) / 680,
                  transition: 'none',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'auto'
                }}
              >
                {showIcons && (shard.data.favicon || shard.data.icon) && (
                  <img 
                    src={shard.data.favicon || shard.data.icon} 
                    alt="" 
                    className="inline-block"
                    style={{ 
                      width: `${shard.size * fontScale * 0.8}rem`, 
                      height: `${shard.size * fontScale * 0.8}rem`,
                      opacity: 0.8
                    }}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
                {displayText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
