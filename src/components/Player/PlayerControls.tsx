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
        icon={<SkipBack size={18} />}
        onClick={onPrev}
        title="Previous"
      />
      
      <button
        onClick={onTogglePlay}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all border border-white/20"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={16} fill="currentColor" />
        ) : (
          <Play size={16} fill="currentColor" className="ml-0.5" />
        )}
      </button>
      
      <IconButton
        icon={<SkipForward size={18} />}
        onClick={onNext}
        title="Next"
      />
      
      <button
        onClick={onToggleShuffle}
        className={`p-2 rounded-lg transition-all backdrop-blur-xl ${
          isShuffleMode
            ? 'bg-white/20 text-white border border-white/30'
            : 'bg-white/5 text-white/30 hover:text-white/50 border border-white/10'
        }`}
        title="Shuffle"
      >
        <Shuffle size={16} />
      </button>
      
      {onResetPositions && (
        <button
          onClick={onResetPositions}
          className="p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 transition-all opacity-30 hover:opacity-100"
          title="Reset Cloud Positions"
        >
          <RefreshCw size={16} />
        </button>
      )}
      
      {onChangeLayout && (
        <button
          onClick={onChangeLayout}
          className="p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 transition-all opacity-30 hover:opacity-100"
          title={`Layout: ${currentLayout}`}
        >
          <span className="text-base">{layoutIcons[currentLayout]}</span>
        </button>
      )}
    </div>
  );
};
