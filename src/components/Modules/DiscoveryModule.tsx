/**
 * DiscoveryModule.tsx
 * 
 * Модуль поиска радиостанций
 * Содержит:
 * - Поле поиска
 * - 3D облако найденных станций
 * - Фильтрация и оптимизация
 */

import React from 'react';
import { Search, ShieldCheck, Loader2, RadioTower } from 'lucide-react';
import { DiscoveredStream } from '../../services/streamDiscovery';
import { Provider } from '../../types';

interface DiscoveryModuleProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isSearching: boolean;
  isTestingSignals: boolean;
  onPurgeSignals: () => void;
  currentStreamShards: string[];
  suggestions: DiscoveredStream[];
  onPlayStream: (stream: DiscoveredStream) => void;
  currentUrl: string;
  moduleRotation: { x: number; y: number };
  moduleCloudItems: any[];
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  selectedTags?: string[];
  onToggleTag?: (tag: string) => void;
}

export const DiscoveryModule: React.FC<DiscoveryModuleProps> = ({
  searchQuery,
  onSearchQueryChange,
  isSearching,
  isTestingSignals,
  onPurgeSignals,
  currentStreamShards,
  suggestions,
  onPlayStream,
  currentUrl,
  moduleRotation,
  moduleCloudItems,
  isDragging,
  onDragStart,
  onDragEnd,
  selectedTags = [],
  onToggleTag
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Поисковая панель */}
      <div className="space-y-6 flex-shrink-0">
        <div className="flex items-center bg-black/5 p-6 rounded-[2.5rem] border-2 border-transparent focus-within:border-indigo-600 transition-all shadow-inner group relative">
          <Search size={24} className="opacity-20 mr-6" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchQueryChange(e.target.value)}
            placeholder="FREQUENCY_EXPLORATION..."
            className="bg-transparent flex-1 text-xl font-black uppercase outline-none"
          />
          <button
            onClick={onPurgeSignals}
            className={`p-4 rounded-2xl transition-all shadow-xl ${
              isTestingSignals
                ? 'bg-indigo-600 text-white animate-pulse'
                : 'bg-indigo-600/10 text-indigo-600'
            }`}
          >
            {isTestingSignals ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShieldCheck size={18} />
            )}
          </button>
        </div>

        {/* Теги-фильтры */}
        <div className="flex flex-wrap gap-2 px-4">
          {currentStreamShards.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag ? onToggleTag(tag) : onSearchQueryChange(tag)}
                className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-indigo-600/5 border-indigo-600/10 hover:bg-indigo-600/20'
                }`}
              >
                # {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Облако результатов */}
      <div
        className="flex-1 relative cursor-move overflow-hidden bg-black/5 rounded-[4rem] border border-white/5 shadow-inner mt-6"
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
      >
        <div className="scene-3d w-full h-full">
          <div
            className="cloud-3d"
            style={{
              transform: `rotateX(${moduleRotation.x}deg) rotateY(${moduleRotation.y}deg)`
            }}
          >
            {moduleCloudItems.map((shard, i) => {
              const isActive = currentUrl === shard.data.url;
              
              return (
                <div
                  key={i}
                  className="shard-item pointer-events-auto"
                  style={{
                    transform: `translate3d(${shard.x}px, ${shard.y}px, ${shard.z}px) rotateY(${-moduleRotation.y}deg) rotateX(${-moduleRotation.x}deg)`
                  }}
                >
                  <div
                    className={`flex flex-col items-center gap-2 group p-4 rounded-3xl transition-all ${
                      isActive ? 'bg-indigo-600 text-white' : 'hover:scale-110'
                    }`}
                    onClick={() => onPlayStream(shard.data)}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center overflow-hidden">
                      {shard.data.favicon ? (
                        <img
                          src={shard.data.favicon}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <RadioTower size={24} />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase max-w-[120px] truncate">
                      {shard.data.name}
                    </span>
                    {shard.data.bitrate && (
                      <span className="text-[7px] opacity-40">{shard.data.bitrate}K</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
