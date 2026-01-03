/**
 * DisplayModule.tsx
 * 
 * Модуль расширенных настроек отображения
 * Содержит:
 * - Размеры шрифтов и иконок
 * - Стеклянные эффекты
 * - Случайные цвета
 * - Анимации и spacing
 */

import React from 'react';
import { Paintbrush, Type, Sparkles, Layers, Zap, Maximize, Cloud, Link, Grid3x3, List, Globe } from 'lucide-react';
import { DisplaySettings, CloudSettings } from '../../types';
import { Button } from '../UI/Button';

interface DisplayModuleProps {
  displaySettings: DisplaySettings;
  onUpdate: (updates: Partial<DisplaySettings>) => void;
}

export const DisplayModule: React.FC<DisplayModuleProps> = ({
  displaySettings,
  onUpdate
}) => {
  const fontSizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
  const iconSizes = ['sm', 'md', 'lg', 'xl'] as const;
  const speeds = ['slow', 'normal', 'fast'] as const;
  const borderStyles = ['none', 'solid', 'gradient', 'glow'] as const;
  const spacings = ['tight', 'normal', 'relaxed'] as const;
  
  const viewModes = [
    { id: 'cloud', icon: Cloud, label: 'Облако' },
    { id: 'grid', icon: Grid3x3, label: 'Сетка' },
    { id: 'list', icon: List, label: 'Список' },
    { id: 'web', icon: Globe, label: 'Паутина' }
  ] as const;
  
  const connectionStyles = ['lines', 'threads', 'glow', 'none'] as const;
  const sortOptions = ['name', 'popularity', 'recent', 'random'] as const;

  const cloudSettings = displaySettings.cloudSettings || {
    viewMode: 'cloud',
    cloudScale: 1.0,
    rotationSpeed: 1.0,
    showConnections: false,
    connectionStyle: 'threads',
    sortBy: 'popularity',
    filterTags: []
  };
  
  const updateCloudSettings = (updates: Partial<CloudSettings>) => {
    onUpdate({
      cloudSettings: { ...cloudSettings, ...updates }
    });
  };

  return (
    <div className="space-y-8 p-8">
      {/* Размер шрифта */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Type size={24} />
          <h3 className="text-lg font-black uppercase">Размер Шрифта</h3>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {fontSizes.map(size => (
            <Button
              key={size}
              size="sm"
              variant={displaySettings.fontSize === size ? 'primary' : 'secondary'}
              onClick={() => onUpdate({ fontSize: size })}
            >
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Размер иконок */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Maximize size={24} />
          <h3 className="text-lg font-black uppercase">Размер Иконок</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {iconSizes.map(size => (
            <Button
              key={size}
              size="sm"
              variant={displaySettings.iconSize === size ? 'primary' : 'secondary'}
              onClick={() => onUpdate({ iconSize: size })}
            >
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Стиль границ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Layers size={24} />
          <h3 className="text-lg font-black uppercase">Стиль Границ</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {borderStyles.map(style => (
            <Button
              key={style}
              size="sm"
              variant={displaySettings.borderStyle === style ? 'primary' : 'secondary'}
              onClick={() => onUpdate({ borderStyle: style })}
            >
              {style.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles size={24} />
          <h3 className="text-lg font-black uppercase">Отступы</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {spacings.map(spacing => (
            <Button
              key={spacing}
              size="sm"
              variant={displaySettings.spacing === spacing ? 'primary' : 'secondary'}
              onClick={() => onUpdate({ spacing: spacing })}
            >
              {spacing.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Скорость анимаций */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap size={24} />
          <h3 className="text-lg font-black uppercase">Скорость Анимаций</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {speeds.map(speed => (
            <Button
              key={speed}
              size="sm"
              variant={displaySettings.animationSpeed === speed ? 'primary' : 'secondary'}
              onClick={() => onUpdate({ animationSpeed: speed })}
            >
              {speed.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
      
      {/* НОВЫЙ РАЗДЕЛ: Настройки Облака */}
      <div className="space-y-6 pt-8 border-t-4 border-current/20">
        <div className="flex items-center gap-3">
          <Cloud size={32} className="text-cyan-400" />
          <h2 className="text-2xl font-black uppercase">Облако Тегов</h2>
        </div>
        
        {/* Режим просмотра */}
        <div className="space-y-4">
          <h3 className="text-base font-black uppercase opacity-70">Режим Отображения</h3>
          <div className="grid grid-cols-4 gap-3">
            {viewModes.map(mode => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  size="sm"
                  variant={cloudSettings.viewMode === mode.id ? 'primary' : 'secondary'}
                  onClick={() => updateCloudSettings({ viewMode: mode.id })}
                  icon={<Icon size={20} />}
                >
                  {mode.label}
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Масштаб облака */}
        <div className="space-y-3">
          <h3 className="text-base font-black uppercase opacity-70">Масштаб Облака</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">0.5x</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={cloudSettings.cloudScale}
              onChange={e => updateCloudSettings({ cloudScale: parseFloat(e.target.value) })}
              className="flex-1 h-3 rounded-full appearance-none"
            />
            <span className="text-sm font-bold">2x</span>
            <span className="text-lg font-black text-cyan-400 w-16 text-right">
              {cloudSettings.cloudScale.toFixed(1)}x
            </span>
          </div>
        </div>
        
        {/* Скорость вращения */}
        <div className="space-y-3">
          <h3 className="text-base font-black uppercase opacity-70">Скорость Вращения</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">0</span>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={cloudSettings.rotationSpeed}
              onChange={e => updateCloudSettings({ rotationSpeed: parseFloat(e.target.value) })}
              className="flex-1 h-3 rounded-full appearance-none"
            />
            <span className="text-sm font-bold">5</span>
            <span className="text-lg font-black text-cyan-400 w-16 text-right">
              {cloudSettings.rotationSpeed.toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Стиль связей */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black uppercase opacity-70">Связи Между Элементами</h3>
            <input
              type="checkbox"
              checked={cloudSettings.showConnections}
              onChange={e => updateCloudSettings({ showConnections: e.target.checked })}
              className="w-12 h-6 rounded-full appearance-none cursor-pointer"
            />
          </div>
          
          {cloudSettings.showConnections && (
            <div className="grid grid-cols-4 gap-3">
              {connectionStyles.map(style => (
                <Button
                  key={style}
                  size="sm"
                  variant={cloudSettings.connectionStyle === style ? 'primary' : 'secondary'}
                  onClick={() => updateCloudSettings({ connectionStyle: style })}
                >
                  {style.toUpperCase()}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {/* Сортировка */}
        <div className="space-y-4">
          <h3 className="text-base font-black uppercase opacity-70">Сортировка</h3>
          <div className="grid grid-cols-4 gap-3">
            {sortOptions.map(sort => (
              <Button
                key={sort}
                size="sm"
                variant={cloudSettings.sortBy === sort ? 'primary' : 'secondary'}
                onClick={() => updateCloudSettings({ sortBy: sort })}
              >
                {sort.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Переключатели */}
      <div className="space-y-6 pt-6 border-t border-current/10">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-4">
            <Paintbrush size={24} />
            <div>
              <div className="font-black text-base">Стеклянный Эффект</div>
              <div className="text-xs opacity-60">Прозрачность и размытие</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={displaySettings.glassEffect}
            onChange={e => onUpdate({ glassEffect: e.target.checked })}
            className="w-16 h-8 rounded-full appearance-none cursor-pointer transition-all"
            style={{
              backgroundColor: displaySettings.glassEffect ? 'var(--accent)' : 'rgba(0,0,0,0.1)'
            }}
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-4">
            <Sparkles size={24} />
            <div>
              <div className="font-black text-base">Случайные Цвета</div>
              <div className="text-xs opacity-60">Уникальные цвета для каждого элемента</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={displaySettings.randomColors}
            onChange={e => onUpdate({ randomColors: e.target.checked })}
            className="w-16 h-8 rounded-full appearance-none cursor-pointer transition-all"
            style={{
              backgroundColor: displaySettings.randomColors ? 'var(--accent)' : 'rgba(0,0,0,0.1)'
            }}
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-4">
            <Layers size={24} />
            <div>
              <div className="font-black text-base">Компактный Режим</div>
              <div className="text-xs opacity-60">Уменьшенные отступы</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={displaySettings.compactMode}
            onChange={e => onUpdate({ compactMode: e.target.checked })}
            className="w-16 h-8 rounded-full appearance-none cursor-pointer transition-all"
            style={{
              backgroundColor: displaySettings.compactMode ? 'var(--accent)' : 'rgba(0,0,0,0.1)'
            }}
          />
        </label>
      </div>

      {/* Генератор случайных настроек */}
      <div className="pt-6">
        <Button
          size="lg"
          icon={<Sparkles size={32} />}
          onClick={() => {
            const randomFontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];
            const randomIconSize = iconSizes[Math.floor(Math.random() * iconSizes.length)];
            const randomBorderStyle = borderStyles[Math.floor(Math.random() * borderStyles.length)];
            const randomSpacing = spacings[Math.floor(Math.random() * spacings.length)];
            
            onUpdate({
              fontSize: randomFontSize,
              iconSize: randomIconSize,
              borderStyle: randomBorderStyle,
              spacing: randomSpacing,
              randomColors: Math.random() > 0.5,
              glassEffect: Math.random() > 0.3
            });
          }}
        >
          Случайная Конфигурация
        </Button>
      </div>
    </div>
  );
};
