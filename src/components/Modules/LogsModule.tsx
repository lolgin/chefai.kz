/**
 * LogsModule.tsx
 * 
 * Модуль отображения системных логов с крупными элементами
 */

import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { SystemLog } from '../../hooks/useSystemLogs';
import { useSettings } from '../../contexts/SettingsContext';
import { useIconSize } from '../../hocs/withDisplaySettings';
import { generateRandomColor } from '../../utils/colorUtils';

interface LogsModuleProps {
  systemLogs: SystemLog[];
}

export const LogsModule: React.FC<LogsModuleProps> = ({ systemLogs }) => {
  const { settings, theme } = useSettings();
  const iconSize = useIconSize();
  
  const moduleColor = useMemo(() => 
    settings.display?.randomColors ? generateRandomColor() : theme.accent,
  [settings.display?.randomColors, theme.accent]);
  
  const fontSize = settings.display?.fontSize === 'xs' ? 'text-xs' :
                   settings.display?.fontSize === 'sm' ? 'text-sm' :
                   settings.display?.fontSize === 'md' ? 'text-base' :
                   settings.display?.fontSize === 'lg' ? 'text-lg' :
                   settings.display?.fontSize === 'xl' ? 'text-xl' : 'text-2xl';
  
  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex justify-center mb-6">
        <button
          className="flex items-center gap-3 px-8 py-5 rounded-3xl font-black uppercase transition-all shadow-xl"
          style={{
            backgroundColor: moduleColor,
            color: theme.isLight ? '#000' : '#fff'
          }}
        >
          <Sparkles size={iconSize} />
          Live Monitoring
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar font-mono space-y-4">
        {systemLogs.map((log, i) => (
          <div
            key={i}
            className={`flex gap-4 animate-in slide-in-from-right-2 border-l-4 pl-6 py-4 rounded-r-2xl ${fontSize}`}
            style={{
              borderColor: log.type === 'warn' ? '#f43f5e' :
                          log.type === 'zap' ? moduleColor :
                          log.type === 'error' ? '#dc2626' : `${theme.accent}40`,
              backgroundColor: theme.surface
            }}
          >
            <span className="opacity-50 font-bold">[{log.time}]</span>
            <span
              className="uppercase font-black"
              style={{
                color: log.type === 'warn' ? '#f43f5e' :
                      log.type === 'zap' ? moduleColor :
                      log.type === 'error' ? '#dc2626' : theme.text
              }}
            >
              {log.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
