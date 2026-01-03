/**
 * LogsModule.tsx
 * 
 * Модуль отображения системных логов
 * Содержит:
 * - Список логов с типами
 * - Фильтрация по типу
 */

import React from 'react';
import { SystemLog } from '../../hooks/useSystemLogs';

interface LogsModuleProps {
  systemLogs: SystemLog[];
}

export const LogsModule: React.FC<LogsModuleProps> = ({ systemLogs }) => {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[10px] space-y-2 p-4">
      {systemLogs.map((log, i) => (
        <div
          key={i}
          className="flex gap-2 animate-in slide-in-from-right-2 border-l-2 border-indigo-600/20 pl-2"
        >
          <span className="opacity-30">[{log.time}]</span>
          <span
            className={`uppercase font-bold ${
              log.type === 'warn'
                ? 'text-rose-500'
                : log.type === 'zap'
                ? 'text-indigo-600'
                : log.type === 'error'
                ? 'text-red-600'
                : ''
            }`}
          >
            {log.msg}
          </span>
        </div>
      ))}
    </div>
  );
};
