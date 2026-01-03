/**
 * useSystemLogs.ts
 * 
 * Хук для управления системными логами
 * Содержит:
 * - Массив логов с типами (info, warn, zap, error)
 * - Функция добавления лога
 * - Функция очистки логов
 * - Автоматическое ограничение количества логов (50)
 */

import { useState } from 'react';

export interface SystemLog {
  msg: string;
  time: string;
  type: 'info' | 'warn' | 'zap' | 'error';
}

export const useSystemLogs = () => {
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'zap' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setSystemLogs(prev => [{ msg, time, type }, ...prev].slice(0, 50));
  };

  const clearLogs = () => {
    setSystemLogs([]);
  };

  return {
    systemLogs,
    addLog,
    clearLogs
  };
};
