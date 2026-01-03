/**
 * AudioContext.tsx
 * 
 * Контекст для управления состоянием аудио плеера
 * Содержит:
 * - Состояние воспроизведения (playing/paused)
 * - Громкость и mute
 * - Текущий поток
 * - История воспроизведения
 * - Методы управления (play, pause, stop, setVolume)
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AudioState, Provider, Genre, PlayHistoryItem } from '../types';
import { GENRE_STREAMS } from '../constants';
import { audioEngine } from '../services/audioEngine';

interface AudioContextType {
  audioState: AudioState;
  isAudioLoading: boolean;
  currentStream: string | null;
  
  // Методы управления воспроизведением
  play: (
    url?: string,
    name?: string,
    provider?: Provider,
    isNavigatingHistory?: boolean,
    extraData?: any,
    updateSearch?: boolean
  ) => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  skipNext: (suggestions?: any[], isShuffleMode?: boolean) => void;
  skipPrev: (suggestions?: any[]) => void;
  togglePlay: (
    urlOverride?: string,
    nameOverride?: string,
    providerOverride?: Provider,
    isNavigatingHistory?: boolean,
    extraData?: any,
    updateSearch?: boolean
  ) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    volume: 0.7,
    currentGenre: Genre.AI_DREAM,
    currentProvider: Provider.GENERATIVE_AI,
    currentUrl: GENRE_STREAMS[Genre.AI_DREAM] || '',
    sessionHistory: [],
    historyIndex: -1
  });

  const play = async (
    urlOverride?: string,
    nameOverride?: string,
    providerOverride?: Provider,
    isNavigatingHistory: boolean = false,
    extraData?: any,
    updateSearch: boolean = false
  ) => {
    setIsAudioLoading(true);
    
    const targetName = nameOverride || audioState.currentGenre;
    const targetProvider = providerOverride || audioState.currentProvider;
    const url = urlOverride || GENRE_STREAMS[targetName as string];

    if (!url) {
      setIsAudioLoading(false);
      return;
    }

    try {
      await audioEngine.start(url);
      setAudioState(p => {
        let nextHist = [...p.sessionHistory];
        let nextIdx = p.historyIndex;
        
        if (!isNavigatingHistory) {
          nextHist = nextHist.slice(0, p.historyIndex + 1).slice(-49);
          nextHist.push({
            name: String(targetName),
            url,
            provider: targetProvider,
            timestamp: Date.now(),
            favicon: extraData?.favicon
          });
          nextIdx = nextHist.length - 1;
        }
        
        return {
          ...p,
          isPlaying: true,
          currentGenre: targetName,
          currentProvider: targetProvider,
          currentUrl: url,
          sessionHistory: nextHist,
          historyIndex: nextIdx
        };
      });
    } catch (err) {
      console.error('Playback error:', err);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const pause = () => {
    audioEngine.stop();
    setAudioState(p => ({ ...p, isPlaying: false }));
  };

  const stop = () => {
    audioEngine.stop();
    setAudioState(p => ({ ...p, isPlaying: false }));
  };

  const setVolume = (volume: number) => {
    setAudioState(p => ({ ...p, volume }));
    audioEngine.setVolume(volume);
  };

  const togglePlay = async (
    urlOverride?: string,
    nameOverride?: string,
    providerOverride?: Provider,
    isNavigatingHistory: boolean = false,
    extraData?: any,
    updateSearch: boolean = false
  ) => {
    if (audioState.isPlaying && !urlOverride) {
      pause();
      return;
    }
    
    await play(urlOverride, nameOverride, providerOverride, isNavigatingHistory, extraData, updateSearch);
  };

  const skipNext = (suggestions: any[] = [], isShuffleMode: boolean = false) => {
    // Logic will be implemented by the hook
  };

  const skipPrev = (suggestions: any[] = []) => {
    // Logic will be implemented by the hook
  };

  const value: AudioContextType = {
    audioState,
    isAudioLoading,
    currentStream: audioState.currentUrl,
    play,
    pause,
    stop,
    setVolume,
    skipNext,
    skipPrev,
    togglePlay
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};
