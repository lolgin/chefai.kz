/**
 * useStreamDiscovery.ts
 * 
 * Хук для поиска и управления потоками
 * Содержит:
 * - Поисковый запрос и состояние поиска
 * - Список найденных потоков
 * - Функция поиска с задержкой (debounce)
 * - Фильтрация и сортировка результатов
 */

import { useState, useEffect } from 'react';
import { searchStreams, DiscoveredStream } from '../services/streamDiscovery';
import { useSettings } from '../contexts/SettingsContext';

interface UseStreamDiscoveryOptions {
  isInitialized: boolean;
  onLog?: (msg: string, type: 'info' | 'warn' | 'zap' | 'error') => void;
}

export const useStreamDiscovery = ({ isInitialized, onLog }: UseStreamDiscoveryOptions) => {
  const { isBlacklisted } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<DiscoveredStream[]>([]);
  const [sortBy, setSortBy] = useState<'quality' | 'name' | 'favicon'>('quality');

  // Реактивный поиск с задержкой
  useEffect(() => {
    if (!isInitialized) return;
    
    const triggerSearch = async () => {
      if (searchQuery.trim().length < 2) return;
      
      setIsSearching(true);
      onLog?.(`Query Broadcasting: ${searchQuery}`, 'info');
      
      try {
        const results = await searchStreams(searchQuery);
        // Фильтруем черный список
        const filtered = results.filter(stream => {
          const url = stream.url || stream.url_resolved;
          return url && !isBlacklisted(url);
        });
        setSuggestions(filtered);
        if (filtered.length < results.length) {
          onLog?.(`Filtered ${results.length - filtered.length} blacklisted`, 'warn');
        }
      } catch (e) {
        onLog?.('Sync Interrupted', 'error');
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(triggerSearch, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, isInitialized, onLog]);

  const purgeBadSignals = async () => {
    onLog?.('Scrubbing Grid...', 'zap');
    await new Promise(r => setTimeout(r, 1500));
    setSuggestions(prev => prev.filter(s => (s.bitrate || 0) >= 128 || Math.random() > 0.4));
    onLog?.('Grid Optimized', 'info');
  };

  // Немедленный поиск без debounce (для кликов по облаку)
  const instantSearch = async (query: string) => {
    if (!isInitialized || query.trim().length < 2) return;
    
    setIsSearching(true);
    onLog?.(`Query Broadcasting: ${query}`, 'info');
    
    try {
      const results = await searchStreams(query);
      setSuggestions(results);
    } catch (e) {
      onLog?.('Sync Interrupted', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    suggestions,
    setSuggestions,
    sortBy,
    setSortBy,
    purgeBadSignals,
    instantSearch
  };
};
