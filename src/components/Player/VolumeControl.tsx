/**
 * VolumeControl.tsx
 * 
 * Управление громкостью
 * Содержит:
 * - Иконки Volume2/VolumeX
 * - Слайдер громкости
 * - Визуализация уровня громкости
 */

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange
}) => {
  return (
    <div className="hidden md:flex items-center gap-4 w-32">
      <VolumeX size={14} className="opacity-20" />
      
      <div className="flex-1 h-1.5 bg-black/10 rounded-full relative overflow-hidden group shadow-inner">
        <div
          className="absolute h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
          style={{ width: `${volume * 100}%` }}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
      </div>
      
      <Volume2 size={14} className="opacity-20" />
    </div>
  );
};
