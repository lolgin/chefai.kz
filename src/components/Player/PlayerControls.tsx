/**
 * PlayerControls.tsx
 * 
 * Кнопки управления плеером
 * Содержит:
 * - Play/Pause кнопка
 * - Skip Forward/Back
 * - Shuffle режим
 */

import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Loader2, RefreshCw } from 'lucide-react';
import { IconButton } from '../UI/IconButton';
import { CloudLayout } from '../../types';

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  isShuffleMode: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onResetPositions?: () => void;
  onChangeLayout?: () => void;
  currentLayout?: CloudLayout;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLoading,
  isShuffleMode,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onResetPositions,
  onChangeLayout,
  currentLayout = 'sphere'
}) => {
  const layoutIcons: Record<CloudLayout, string> = {
    sphere: '🌐',
    spiral: '🌀',
    cube: '📦',
    plane: '⬜',
    cylinder: '🥫'
  };

  return (
    <div className="flex items-center gap-8 lg:gap-14">
      <IconButton
        icon={<SkipBack size={28} />}
        onClick={onPrev}
        title="Previous"
      />
      
      <button
        onClick={onTogglePlay}
        className="w-16 h-16 rounded-[2.2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-white/20"
      >
        {isLoading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={30} fill="currentColor" />
        ) : (
          <Play size={30} fill="currentColor" className="ml-1" />
        )}
      </button>
      
      <IconButton
        icon={<SkipForward size={28} />}
        onClick={onNext}
        title="Next"
      />
      
      <button
        onClick={onToggleShuffle}
        className={`p-3 rounded-xl transition-all ${
          isShuffleMode
            ? 'bg-indigo-600 text-white shadow-xl'
            : 'opacity-20 hover:opacity-100'
        }`}
      >
        <Shuffle size={20} />
      </button>
      
      {onResetPositions && (
        <button
          onClick={onResetPositions}
          className="p-3 rounded-xl transition-all opacity-20 hover:opacity-100"
          title="Reset Cloud Positions"
        >
          <RefreshCw size={20} />
        </button>
      )}
      
      {onChangeLayout && (
        <button
          onClick={onChangeLayout}
          className="p-3 rounded-xl transition-all opacity-20 hover:opacity-100"
          title={`Layout: ${currentLayout}`}
        >
          <span className="text-xl">{layoutIcons[currentLayout]}</span>
        </button>
      )}
    </div>
  );
};
