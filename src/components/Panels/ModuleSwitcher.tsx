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

export type ModuleType = 'none' | 'nodes' | 'discovery' | 'logs' | 'eq' | 'themes' | 'intel';

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
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 lg:gap-8 z-40">
      {modules.map(nav => (
        <button
          key={nav.id}
          onClick={() => onModuleChange(nav.id as ModuleType)}
          className={`group flex flex-col items-center gap-2 transition-all ${
            activeModule === nav.id
              ? 'text-indigo-600 scale-110'
              : 'opacity-20 hover:opacity-100'
          }`}
        >
          <div
            className={`p-3 rounded-2xl transition-all ${
              activeModule === nav.id
                ? 'bg-indigo-600 text-white shadow-xl'
                : 'bg-black/10'
            }`}
          >
            {nav.icon}
          </div>
          <span className="text-[7px] font-black tracking-[0.2em]">{nav.label}</span>
        </button>
      ))}
    </div>
  );
};
