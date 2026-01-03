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
  theme
}) => {
  return (
    <div
      className="hidden lg:flex transition-all duration-500 border-r bg-black/5 flex-col overflow-hidden"
      style={{ borderColor: `${theme.text}11`, width: isOpen ? '280px' : '0' }}
    >
      <div className="p-6 w-80 h-full overflow-y-auto no-scrollbar space-y-6">
        <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
          <Hexagon size={12} /> NEURAL_CORE
        </h3>
        
        {providers.map(p => {
          const genres = p.id === Provider.CUSTOM
            ? customNodes
            : genresByProvider[p.id] || [];
          
          return (
            <div key={p.id} className="space-y-1">
              <div className="text-[7px] font-black uppercase opacity-20 mb-1.5 px-3 tracking-tighter">
                {p.name}
              </div>
              
              {genres.slice(0, 15).map((g: any) => {
                const name = typeof g === 'string' ? g : g.name;
                const url = typeof g === 'string' ? getGenreUrl(name, p.id) : g.url;
                
                return (
                  <button
                    key={name}
                    onClick={() => url && onGenreClick(url, name, p.id as Provider, true)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                      currentGenre === name
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'hover:bg-black/10 opacity-60'
                    }`}
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
