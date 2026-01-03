/**
 * EQModule.tsx
 * 
 * Модуль эквалайзера (заглушка)
 * В полной версии содержал бы:
 * - 10 полос частот
 * - Preamp
 * - Stereo Width
 */

import React from 'react';
import { Sliders } from 'lucide-react';

interface EQModuleProps {
  // Пока оставляем пустым - EQ логика остается в App.tsx
}

export const EQModule: React.FC<EQModuleProps> = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center opacity-40">
        <Sliders size={48} className="mx-auto mb-4" />
        <p className="text-sm font-black uppercase">EQ Module</p>
        <p className="text-xs">Coming Soon</p>
      </div>
    </div>
  );
};
