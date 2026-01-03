/**
 * LeftPanel.tsx
 * 
 * Левая боковая панель навигации
 * Содержит:
 * - Список провайдеров (SomaFM, Nightride, etc)
 * - Список жанров/станций каждого провайдера
 * - Анимация открытия/закрытия
 */

import React from 'react';
import { Hexagon } from 'lucide-react';
import { Provider, CustomNode } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import { useIconSize } from '../../hocs/withDisplaySettings';

interface LeftPanelProps {
  isOpen: boolean;
  providers: Array<{ id: Provider | string; name: string; color: string }>;
  genresByProvider: Record<string, (string | any)[]>;
  customNodes: CustomNode[];
  currentGenre: string | any;
  onGenreClick: (url: string, name: string, provider: Provider, updateSearch: boolean) => void;
  getGenreUrl: (genre: string | any, provider: Provider | string) => string | undefined;
  theme: { text: string };
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  isOpen,
  providers,
  genresByProvider,
  customNodes,
  currentGenre,
  onGenreClick,
  getGenreUrl,
}) => {
  const { theme } = useSettings();
  const iconSize = useIconSize();
  
  return (
    <div
      className="hidden lg:flex transition-all duration-500 border-r bg-black/5 flex-col overflow-hidden"
      style={{ borderColor: `${theme.text}11`, width: isOpen ? '320px' : '0' }}
    >
      <div className="p-6 w-80 h-full overflow-y-auto no-scrollbar space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3"
            style={{ color: theme.text, fontSize: iconSize }}>
          <Hexagon size={iconSize * 1.5} /> NEURAL_CORE
        </h3>
        
        {providers.map(p => {
          const genres = p.id === Provider.CUSTOM
            ? customNodes
            : genresByProvider[p.id] || [];
          
          return (
            <div key={p.id} className="space-y-2">
              <div className="text-xs font-black uppercase opacity-30 mb-2 px-3 tracking-wider"
                   style={{ fontSize: iconSize * 0.7 }}>
                {p.name}
              </div>
              
              {genres.slice(0, 15).map((g: any) => {
                const name = typeof g === 'string' ? g : g.name;
                const url = typeof g === 'string' ? getGenreUrl(name, p.id) : g.url;
                
                return (
                  <button
                    key={name}
                    onClick={() => url && onGenreClick(url, name, p.id as Provider, true)}
                    className="w-full text-left px-4 py-3 rounded-xl font-black uppercase transition-all shadow-md hover:scale-105"
                    style={{
                      backgroundColor: currentGenre === name ? theme.accent : theme.surface,
                      color: currentGenre === name ? (theme.isLight ? '#000' : '#fff') : theme.text,
                      opacity: currentGenre === name ? 1 : 0.7,
                      fontSize: iconSize * 0.75,
                      borderWidth: currentGenre === name ? '2px' : '1px',
                      borderColor: currentGenre === name ? theme.accent : `${theme.text}11`
                    }}
                    onMouseEnter={e => currentGenre !== name && (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => currentGenre !== name && (e.currentTarget.style.opacity = '0.7')}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
