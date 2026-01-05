/**
 * ModuleSwitcher.tsx
 * 
 * Переключатель активного модуля
 * Содержит:
 * - Кнопки для каждого модуля
 * - Индикация активного модуля
 * - Иконки модулей
 * - Кнопка рандомизации цветов
 */

import React, { ReactNode } from 'react';
import { Dices } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export type ModuleType = 'none' | 'nodes' | 'discovery' | 'themes' | 'models' | 'streams' | 'engine';

interface ModuleSwitcherProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
  modules: Array<{
    id: ModuleType;
    icon: ReactNode;
    label: string;
  }>;
  onRandomizeColors?: () => void;
}

export const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({
  activeModule,
  onModuleChange,
  modules,
  onRandomizeColors
}) => {
  const { theme } = useSettings();
  
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40 bg-black/5 backdrop-blur-2xl rounded-full px-3 py-2 border border-white/10">
      {modules.map(nav => (
        <button
          key={nav.id}
          onClick={() => onModuleChange(nav.id as ModuleType)}
          className="transition-all p-2 rounded-full"
          style={{
            color: activeModule === nav.id ? theme.accent : theme.text,
            opacity: activeModule === nav.id ? 1 : 0.3,
            backgroundColor: activeModule === nav.id ? `${theme.accent}20` : 'transparent'
          }}
          onMouseEnter={e => activeModule !== nav.id && (e.currentTarget.style.opacity = '0.6')}
          onMouseLeave={e => activeModule !== nav.id && (e.currentTarget.style.opacity = '0.3')}
          title={nav.label}
        >
          {nav.icon}
        </button>
      ))}
      
      {onRandomizeColors && (
        <>
          <div className="w-px h-8 my-auto bg-white/10" />
          <button
            onClick={onRandomizeColors}
            className="transition-all p-2 rounded-full hover:scale-110"
            style={{
              color: theme.accent,
              opacity: 0.5
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
            title="Случайные цвета"
          >
            <Dices size={20} />
          </button>
        </>
      )}
    </div>
  );
};
