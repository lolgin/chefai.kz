/**
 * ModuleSwitcher.tsx
 * 
 * Переключатель активного модуля
 * Содержит:
 * - Кнопки для каждого модуля
 * - Индикация активного модуля
 * - Иконки модулей
 */

import React, { ReactNode } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

export type ModuleType = 'none' | 'nodes' | 'discovery' | 'themes' | 'display';

interface ModuleSwitcherProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
  modules: Array<{
    id: ModuleType;
    icon: ReactNode;
    label: string;
  }>;
}

export const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({
  activeModule,
  onModuleChange,
  modules
}) => {
  const { theme } = useSettings();
  
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 lg:gap-8 z-40">
      {modules.map(nav => (
        <button
          key={nav.id}
          onClick={() => onModuleChange(nav.id as ModuleType)}
          className="group flex flex-col items-center gap-2 transition-all"
          style={{
            color: activeModule === nav.id ? theme.accent : theme.text,
            opacity: activeModule === nav.id ? 1 : 0.2,
            transform: activeModule === nav.id ? 'scale(1.1)' : 'scale(1)'
          }}
          onMouseEnter={e => activeModule !== nav.id && (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => activeModule !== nav.id && (e.currentTarget.style.opacity = '0.2')}
        >
          <div
            className="p-3 rounded-2xl transition-all shadow-xl"
            style={{
              backgroundColor: activeModule === nav.id ? theme.accent : theme.surface,
              color: activeModule === nav.id ? (theme.isLight ? '#fff' : '#fff') : theme.text
            }}
          >
            {nav.icon}
          </div>
          <span className="text-[7px] font-black tracking-[0.2em]">{nav.label}</span>
        </button>
      ))}
    </div>
  );
};
