/**
 * EQModule.tsx
 * 
 * Модуль эквалайзера (заглушка)
 * В полной версии содержал бы:
 * - 10 полос частот
 * - Preamp
 * - Stereo Width
 */

import React, { useMemo } from 'react';
import { Sliders, Sparkles } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useIconSize } from '../../hocs/withDisplaySettings';
import { generateRandomColor } from '../../utils/colorUtils';

interface EQModuleProps {
  // Пока оставляем пустым - EQ логика остается в App.tsx
}

export const EQModule: React.FC<EQModuleProps> = () => {
  const { settings, theme } = useSettings();
  const iconSize = useIconSize();
  
  const moduleColor = useMemo(() => 
    settings.display?.randomColors ? generateRandomColor() : theme.accent,
  [settings.display?.randomColors, theme.accent]);
  
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center" style={{ color: moduleColor }}>
        <Sliders size={iconSize * 2} className="mx-auto mb-6" />
        <p className="text-2xl font-black uppercase mb-2">EQ Module</p>
        <p className="text-lg">Coming Soon</p>
        <button
          className="mt-8 flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase mx-auto"
          style={{
            backgroundColor: moduleColor,
            color: theme.isLight ? '#000' : '#fff'
          }}
        >
          <Sparkles size={iconSize} />
          Случайный Preset
        </button>
      </div>
    </div>
  );
};
