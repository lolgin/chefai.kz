/**
 * RightPanel.tsx
 * 
 * Правая боковая панель (логи)
 * Содержит:
 * - Системные логи
 * - Анимация открытия/закрытия
 */

import React from 'react';
import { Fingerprint } from 'lucide-react';
import { SystemLog } from '../../hooks/useSystemLogs';

interface RightPanelProps {
  isOpen: boolean;
  systemLogs: SystemLog[];
  theme: { text: string };
}

export const RightPanel: React.FC<RightPanelProps> = ({
  isOpen,
  systemLogs,
  theme
}) => {
  return (
    <div
      className="hidden lg:flex transition-all duration-500 border-l bg-black/5 flex-col overflow-hidden"
      style={{ borderColor: `${theme.text}11`, width: isOpen ? '280px' : '0' }}
    >
      <div className="p-8 w-70 h-full overflow-y-auto no-scrollbar font-mono text-[8px] space-y-4 opacity-40">
        <h3 className="text-xs font-black font-rajdhani uppercase mb-4 opacity-100 flex items-center gap-2"
            style={{ color: theme.text }}>
          <Fingerprint size={12} /> CORE_TRACE
        </h3>
        
        {systemLogs.map((l, i) => (
          <div
            key={i}
            className="flex gap-2 animate-in slide-in-from-right-2 border-l-2 pl-2"
            style={{ borderColor: `${theme.accent}20` }}
          >
            <span className="opacity-30">[{l.time}]</span>
            <span
              className="uppercase font-bold"
              style={{
                color: l.type === 'warn'
                  ? '#f43f5e'
                  : l.type === 'zap'
                  ? theme.accent
                  : theme.text
              }}
            >
              {l.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
