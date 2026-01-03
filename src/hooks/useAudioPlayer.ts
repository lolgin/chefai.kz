/**
 * useAudioPlayer.ts
 * 
 * Хук для управления аудио плеером
 * Содержит:
 * - Интеграцию с AudioContext
 * - Обработку событий воспроизведения
 * - Навигацию по истории
 * - Режим shuffle
 */

import { useAudio } from '../contexts/AudioContext';
import { useMetadata } from '../contexts/MetadataContext';
import { Provider } from '../types';
import { DiscoveredStream } from '../services/streamDiscovery';
import { PROVIDERS, GENRES_BY_PROVIDER } from '../constants';

interface UseAudioPlayerOptions {
  suggestions?: DiscoveredStream[];
  isShuffleMode?: boolean;
  onSearchQueryUpdate?: (query: string) => void;
}

export const useAudioPlayer = (options: UseAudioPlayerOptions = {}) => {
  const { suggestions = [], isShuffleMode = false, onSearchQueryUpdate } = options;
  const audio = useAudio();
  const metadata = useMetadata();

  const handleTogglePlay = async (
    urlOverride?: string,
    nameOverride?: string,
    providerOverride?: Provider,
    isNavigatingHistory: boolean = false,
    extraData?: Partial<DiscoveredStream>,
    updateSearch: boolean = false
  ) => {
    if (audio.audioState.isPlaying && !urlOverride) {
      audio.pause();
      metadata.setStatusMessage('IDLE');
      return;
    }

    if (updateSearch && nameOverride && onSearchQueryUpdate) {
      onSearchQueryUpdate(nameOverride);
    }

    metadata.setStatusMessage('LOCKING...');

    try {
      await audio.play(urlOverride, nameOverride, providerOverride, isNavigatingHistory, extraData, updateSearch);

      // Обновляем метаданные
      const targetName = nameOverride || audio.audioState.currentGenre;
      const targetProvider = providerOverride || audio.audioState.currentProvider;
      
      metadata.updateMetadata({
        title: String(targetName).toUpperCase(),
        artist: String(targetProvider),
        bpm: extraData?.bitrate || 128,
        mood: extraData?.codec || 'MPEG',
        energy: 0.8,
        description: extraData?.tags || 'Neural Flow Stabilized',
        bitrate: extraData?.bitrate,
        favicon: extraData?.favicon
      });

      // Загружаем AI метаданные для Gen-AI провайдера
      if (targetProvider === Provider.GENERATIVE_AI) {
        await metadata.fetchAIMetadata(String(targetName), String(targetProvider));
      }

      metadata.setStatusMessage('LOCKED');
    } catch (err) {
      metadata.setStatusMessage('ERROR');
      console.error('Neural Drop:', err);
    }
  };

  const handleNext = () => {
    if (isShuffleMode) {
      // Случайный выбор провайдера и жанра
      const p = PROVIDERS[Math.floor(Math.random() * (PROVIDERS.length - 1))];
      const gList = GENRES_BY_PROVIDER[p.id];
      const g = gList[Math.floor(Math.random() * gList.length)];
      handleTogglePlay(undefined, String(g), p.id as Provider);
      return;
    }

    // Навигация по найденным потокам
    const currentIdx = suggestions.findIndex(s => s.url === audio.audioState.currentUrl);
    if (currentIdx !== -1 && currentIdx < suggestions.length - 1) {
      const next = suggestions[currentIdx + 1];
      handleTogglePlay(next.url, next.name, Provider.RADIO_BROWSER, false, next);
    }
  };

  const handlePrev = () => {
    const currentIdx = suggestions.findIndex(s => s.url === audio.audioState.currentUrl);
    
    if (currentIdx > 0) {
      const prev = suggestions[currentIdx - 1];
      handleTogglePlay(prev.url, prev.name, Provider.RADIO_BROWSER, false, prev);
    } else if (audio.audioState.historyIndex > 0) {
      const prev = audio.audioState.sessionHistory[audio.audioState.historyIndex - 1];
      handleTogglePlay(prev.url, prev.name, prev.provider, true);
    }
  };

  return {
    audioState: audio.audioState,
    isAudioLoading: audio.isAudioLoading,
    handleTogglePlay,
    handleNext,
    handlePrev,
    setVolume: audio.setVolume
  };
};
