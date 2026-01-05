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

interface UseStreamDiscoveryOptions {
  isInitialized: boolean;
  onLog?: (msg: string, type: 'info' | 'warn' | 'zap' | 'error') => void;
  blacklistedUrls?: string[];
}

export const useStreamDiscovery = ({ isInitialized, onLog, blacklistedUrls = [] }: UseStreamDiscoveryOptions) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<DiscoveredStream[]>([]);
  const [sortBy, setSortBy] = useState<'quality' | 'name' | 'favicon'>('quality');
  const [searchCache] = useState<Map<string, DiscoveredStream[]>>(new Map());

  // Реактивный поиск с задержкой
  useEffect(() => {
    if (!isInitialized) return;
    
    const triggerSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      
      setIsSearching(true);
      
      // Разбиваем на слова
      const words = searchQuery.split(' ').filter(w => w.trim().length >= 2);
      
      if (words.length === 0) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }
      
      onLog?.(`Query Broadcasting: ${words.join(', ')}`, 'info');
      
      try {
        const allResults: DiscoveredStream[] = [];
        const seenUrls = new Set<string>();
        
        // Ищем каждое слово отдельно
        for (const word of words) {
          let results: DiscoveredStream[];
          
          // Проверяем кеш
          if (searchCache.has(word)) {
            results = searchCache.get(word)!;
            onLog?.(`Cache hit: ${word}`, 'info');
          } else {
            results = await searchStreams(word);
            // Кешируем (макс 50 запросов)
            if (searchCache.size >= 50) {
              const firstKey = searchCache.keys().next().value;
              searchCache.delete(firstKey);
            }
            searchCache.set(word, results);
          }
          
          // Добавляем с дедупликацией
          for (const stream of results) {
            const url = stream.url || stream.streamUrl || stream.url_resolved || '';
            if (!seenUrls.has(url) && !blacklistedUrls.includes(url)) {
              seenUrls.add(url);
              allResults.push(stream);
            }
          }
        }
        
        setSuggestions(allResults);
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
