/**
 * App.tsx - REFACTORED VERSION
 * 
 * Главный компонент приложения AuraWave
 * Теперь использует модульную структуру с контекстами и компонентами
 * 
 * @description
 * AuraWave - это веб-приложение для потокового воспроизведения музыки с 3D визуализацией.
 * Приложение было рефакторено из монолитного файла в модульную архитектуру для лучшей
 * поддерживаемости и работы с AI-ассистентами.
 * 
 * @architecture
 * - Contexts: AudioContext, SettingsContext, MetadataContext для глобального состояния
 * - Hooks: useAudioPlayer, useStreamDiscovery, useSystemLogs для бизнес-логики
 * - Components: Модульные UI компоненты (Player, Panels, Modules, Background)
 * - Services: audioEngine, streamDiscovery, geminiService (не изменены)
 * 
 * @features
 * - 3D визуализация с вращающимися облаками тегов
 * - Поиск радиостанций через Radio Browser API
 * - AI-генерация метаданных через Gemini API
 * - Темы оформления (7 вариантов)
 * - Эквалайзер и аудио эффекты
 * - История воспроизведения
 * - Пользовательские ноды (станции)
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Cpu, List, Globe, Database, Palette, Diamond, X, Search, Activity, Radio, Monitor } from 'lucide-react';

// Контексты
import { AudioProvider } from './contexts/AudioContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { MetadataProvider } from './contexts/MetadataContext';

// Хуки
import { useSystemLogs } from './hooks/useSystemLogs';
import { useStreamDiscovery } from './hooks/useStreamDiscovery';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useSettings } from './contexts/SettingsContext';
import { useMetadata } from './contexts/MetadataContext';

// Компоненты
import { PlayerControls } from './components/Player/PlayerControls';
import { VolumeControl } from './components/Player/VolumeControl';
import { TrackInfo } from './components/Player/TrackInfo';
import { LeftPanel } from './components/Panels/LeftPanel';
import { RightPanel } from './components/Panels/RightPanel';
import { ModuleSwitcher, ModuleType } from './components/Panels/ModuleSwitcher';
import { ShardCloud } from './components/Background/ShardCloud';
import { ShardCloudThreeJS } from './components/Background/ShardCloudThreeJS';
import { DiscoveryModule } from './components/Modules/DiscoveryModule';
import { NodesModule } from './components/Modules/NodesModule';
import { ThemesModule } from './components/Modules/ThemesModule';
import { DisplayModule } from './components/Modules/DisplayModule';

// Сервисы и константы
import { audioEngine } from './services/audioEngine';
import { PROVIDERS, GENRES_BY_PROVIDER, GENRE_STREAMS, THEMES } from './constants';
import { Provider, CloudLayout, CustomNode } from './types';
import { DiscoveredStream } from './services/streamDiscovery';

// Основной компонент приложения с контекстами
const AppContent: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleType>('none');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [isTestingSignals, setIsTestingSignals] = useState(false);
  
  // 3D вращение
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [moduleRotation, setModuleRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [shardSource] = useState<'scan' | 'trace' | 'hyper'>('scan');

  // Используем хуки и контексты
  const { systemLogs, addLog } = useSystemLogs();
  const { settings, theme, updateSettings, updateDisplaySettings } = useSettings();
  const { metadata, statusMessage, updateMetadata, fetchAIMetadata } = useMetadata();
  
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    suggestions,
    setSuggestions,
    purgeBadSignals: originalPurge,
    instantSearch
  } = useStreamDiscovery({ isInitialized, onLog: addLog });

  const {
    audioState,
    isAudioLoading,
    handleTogglePlay,
    handleNext,
    handlePrev,
    setVolume
  } = useAudioPlayer({
    suggestions,
    isShuffleMode,
    onSearchQueryUpdate: setSearchQuery
  });

  // Анимация 3D вращения
  // Автовращение отключено - только ручное управление мышью

  // КЕШ позиций - чтобы объекты не прыгали при изменении списка
  const positionCacheRef = useRef<Map<string, { x: number; y: number; z: number; size: number }>>(new Map());
  
  // Текущая раскладка облака
  const currentLayout = settings.displaySettings?.cloudLayout || 'sphere';

  // Генерация облака тегов с кешированием позиций и разными раскладками
  const generateCloud = useCallback((items: any[], radius: number = 300) => {
    // Простой хеш функция для стабильных позиций
    const hashString = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; // Конвертируем в 32bit integer
      }
      return Math.abs(hash);
    };

    return items.map((item, i) => {
      // Получаем стабильный ключ от имени объекта
      const name = typeof item === 'string' ? item : (item.name || item.title || item.url || String(i));
      
      // Проверяем кеш - если позиция уже есть, используем её
      if (positionCacheRef.current.has(name)) {
        const cached = positionCacheRef.current.get(name)!;
        return {
          data: item,
          ...cached
        };
      }
      
      // Если нет в кеше - генерируем новую позицию
      const hash = hashString(name);
      const stableIndex = hash % 1000;
      const stableSize = 0.7 + (hash % 60) / 100; // От 0.7 до 1.3
      
      let position;
      
      // Разные типы раскладки
      switch (currentLayout) {
        case 'sphere': // Сфера
          const phi = Math.acos(-1 + (2 * stableIndex) / 1000);
          const theta = Math.sqrt(1000 * Math.PI) * phi;
          position = {
            x: radius * Math.cos(theta) * Math.sin(phi),
            y: radius * Math.sin(theta) * Math.sin(phi),
            z: radius * Math.cos(phi),
            size: stableSize
          };
          break;
          
        case 'spiral': // Спираль
          const angle = stableIndex * 0.1;
          const spiralRadius = (stableIndex / 1000) * radius;
          position = {
            x: spiralRadius * Math.cos(angle),
            y: (stableIndex / 1000) * radius * 2 - radius,
            z: spiralRadius * Math.sin(angle),
            size: stableSize
          };
          break;
          
        case 'cube': // Куб
          position = {
            x: ((hash % 3) - 1) * radius * 0.8,
            y: ((Math.floor(hash / 3) % 3) - 1) * radius * 0.8,
            z: ((Math.floor(hash / 9) % 3) - 1) * radius * 0.8,
            size: stableSize
          };
          break;
          
        case 'plane': // Плоскость
          const gridSize = Math.ceil(Math.sqrt(items.length));
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          position = {
            x: (col - gridSize / 2) * (radius * 0.3),
            y: (row - gridSize / 2) * (radius * 0.3),
            z: 0,
            size: stableSize
          };
          break;
          
        case 'cylinder': // Цилиндр
          const cylAngle = (stableIndex / 1000) * Math.PI * 2;
          position = {
            x: radius * Math.cos(cylAngle),
            y: ((stableIndex % 100) / 100) * radius * 2 - radius,
            z: radius * Math.sin(cylAngle),
            size: stableSize
          };
          break;
          
        default:
          position = { x: 0, y: 0, z: 0, size: stableSize };
      }
      
      // Сохраняем в кеш
      positionCacheRef.current.set(name, position);
      
      return {
        data: item,
        ...position
      };
    });
  }, [currentLayout]);

  // Теги для текущего потока
  const currentStreamShards = useMemo(() => {
    const rawTags = metadata?.description || '';
    const parts = rawTags.split(/[\s,]+/).filter(t => t.length > 3).map(t => t.replace(/[#.,]/g, '').toUpperCase());
    return Array.from(new Set([...parts, searchQuery.toUpperCase()])).slice(0, 15);
  }, [metadata, searchQuery]);

  // Фоновое облако - переключается в зависимости от активного модуля
  const mainCloudShards = useMemo(() => {
    // Если активен модуль - показываем его облако с ПОЛНЫМИ ОБЪЕКТАМИ
    if (activeModule === 'discovery') {
      // Если есть suggestions - показываем их, иначе пустое облако (без "симафора")
      if (suggestions.length > 0) {
        // Сохраняем полные объекты DiscoveredStream для доступа к favicon, bitrate, url
        return generateCloud(suggestions.slice(0, 40), 340);
      }
      // Пока нет результатов - показываем пустое облако или минимальное
      return generateCloud([searchQuery.toUpperCase() || 'SEARCH'].filter(Boolean), 340);
    } else if (activeModule === 'nodes') {
      // Для nodes - микс из customNodes и жанров/провайдеров
      const allNodes = [
        ...settings.customNodes,
        ...PROVIDERS,
        ...PROVIDERS.flatMap(p => GENRES_BY_PROVIDER[p.id as Provider] || [])
      ].slice(0, 45);
      return generateCloud(allNodes, 340);
    } else if (activeModule === 'themes') {
      // Для themes - полные объекты с name, colors, layout
      return generateCloud(THEMES, 340);
    } else if (activeModule === 'display') {
      // Для display - провайдеры визуализации
      const vizProviders = [
        { id: 'threejs-planets', name: 'Cosmic Planets' },
        { id: 'threejs-galaxy', name: 'Spiral Galaxy' },
        { id: 'threejs-nebula', name: 'Nebula Cloud' },
        { id: 'css3d-cloud', name: 'Classic Cloud' },
        { id: 'css3d-helix', name: 'DNA Helix' },
        { id: 'd3-force', name: 'Force Graph' }
      ];
      return generateCloud(vizProviders, 340);
    }
    
    // Дефолтное облако когда модуль не активен - чистый запуск (пустое)
    return generateCloud([], 340);
  }, [searchQuery, suggestions, systemLogs, shardSource, activeModule, settings.customNodes, isSearching]);

  // Облако для модулей
  const moduleCloudItems = useMemo(() => {
    switch (activeModule) {
      case 'discovery':
        return generateCloud(suggestions.slice(0, 40), 280);
      case 'nodes':
        const nodeList = [...settings.customNodes, ...PROVIDERS.flatMap(p => GENRES_BY_PROVIDER[p.id as Provider] || [])];
        return generateCloud(nodeList.slice(0, 45), 280);
      case 'themes':
        return generateCloud(THEMES, 240);
      case 'display':
        const vizProviders = [
          { id: 'threejs-planets', name: 'Cosmic Planets' },
          { id: 'threejs-galaxy', name: 'Spiral Galaxy' },
          { id: 'threejs-nebula', name: 'Nebula Cloud' },
          { id: 'css3d-cloud', name: 'Classic Cloud' },
          { id: 'css3d-helix', name: 'DNA Helix' },
          { id: 'd3-force', name: 'Force Graph' }
        ];
        return generateCloud(vizProviders, 240);
      case 'intel':
        const intelPool = ['LATENCY: 42ms', 'NODES: 12', 'UPTIME: 100%', 'ENCRYPTION: AES-256', 'SIGNAL: STABLE', ...systemLogs.map(l => l.msg)];
        return generateCloud(intelPool, 260);
      default:
        return [];
    }
  }, [activeModule, suggestions, settings.customNodes, systemLogs]);

  const purgeBadSignalsWrapper = async () => {
    setIsTestingSignals(true);
    await originalPurge();
    setIsTestingSignals(false);
  };

  const copyMetadata = () => {
    if (!metadata) return;
    navigator.clipboard.writeText(`${metadata.title} - ${metadata.artist}`);
    addLog('Metadata Linked', 'zap');
  };

  const toggleModule = (module: ModuleType) => {
    setActiveModule(prev => prev === module ? 'none' : module);
  };
  
  // Сброс позиций облака
  const handleResetPositions = () => {
    positionCacheRef.current.clear();
    localStorage.removeItem('aurawave_custom_positions');
    // Отправляем событие для ShardCloud
    window.dispatchEvent(new CustomEvent('resetCloudPositions'));
    addLog('Cloud positions reset', 'info');
  };
  
  // Смена раскладки облака
  const handleChangeLayout = () => {
    const layouts: CloudLayout[] = ['sphere', 'spiral', 'cube', 'plane', 'cylinder'];
    const currentIndex = layouts.indexOf(currentLayout);
    const nextLayout = layouts[(currentIndex + 1) % layouts.length];
    updateDisplaySettings({ cloudLayout: nextLayout });
    positionCacheRef.current.clear(); // Очищаем кеш при смене раскладки
    addLog(`Layout: ${nextLayout}`, 'info');
  };

  // Конфигурация модулей для переключателя
  const modules = [
    { id: 'discovery' as ModuleType, icon: <Globe size={20} />, label: 'SCAN' },
    { id: 'nodes' as ModuleType, icon: <Database size={20} />, label: 'NODES' },
    { id: 'themes' as ModuleType, icon: <Palette size={20} />, label: 'THEME' },
    { id: 'display' as ModuleType, icon: <Monitor size={20} />, label: 'DISPLAY' }
  ];

  // Обработчики для Left Panel
  const handleGenreClick = (url: string, name: string, provider: Provider, updateSearch: boolean) => {
    handleTogglePlay(url, name, provider, false, {}, updateSearch);
  };

  const getGenreUrl = (genre: string | any, provider: Provider | string) => {
    if (typeof genre === 'string') {
      return GENRE_STREAMS[genre];
    }
    return genre.url;
  };

  // Обработчики для модулей
  const handlePlayStream = (stream: DiscoveredStream) => {
    handleTogglePlay(stream.url, stream.name, Provider.RADIO_BROWSER, false, stream);
  };

  const handleNodeClick = (node: any) => {
    const isNodeStr = typeof node === 'string';
    if (isNodeStr) {
      setSearchQuery(node);
      setActiveModule('discovery');
    } else {
      handleTogglePlay(node.url, node.name, node.provider);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    updateSettings({ themeId });
  };
  
  // Обработчики для управления источниками
  const handleDeleteNode = (node: CustomNode) => {
    const updated = settings.customNodes.filter(n => n.name !== node.name || n.url !== node.url);
    updateSettings({ customNodes: updated });
    addLog(`Deleted: ${node.name}`, 'info');
  };
  
  const handleEditNode = (oldNode: CustomNode, newNode: CustomNode) => {
    const updated = settings.customNodes.map(n => 
      (n.name === oldNode.name && n.url === oldNode.url) ? newNode : n
    );
    updateSettings({ customNodes: updated });
    addLog(`Updated: ${oldNode.name} → ${newNode.name}`, 'info');
  };
  
  const handleAddNode = (node: CustomNode) => {
    const updated = [...settings.customNodes, node];
    updateSettings({ customNodes: updated });
    addLog(`Added: ${node.name}`, 'info');
  };

  // Экран инициализации
  if (!isInitialized) {
    return (
      <div 
        className="h-screen w-full flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-50 duration-700" 
        style={{ 
          background: theme.bg.includes('gradient') ? theme.bg : undefined,
          backgroundColor: theme.bg.includes('gradient') ? undefined : theme.bg, 
          color: theme.text 
        }}
      >
        <div 
          className="w-48 h-48 mb-12 flex items-center justify-center rounded-[4rem] text-white shadow-3xl animate-pulse"
          style={{ backgroundColor: theme.accent }}
        >
          <Cpu size={80} />
        </div>
        <h1 className="text-7xl font-black font-syncopate uppercase tracking-widest mb-12">AURAWAVE</h1>
        <button
          onClick={() => {
            audioEngine.init();
            setIsInitialized(true);
            addLog('Core Initialized', 'zap');
          }}
          className="px-16 py-8 rounded-[3rem] font-black text-3xl uppercase transition-all shadow-2xl hover:scale-105 active:scale-95"
          style={{ 
            backgroundColor: theme.accent,
            color: theme.isLight ? '#000' : '#fff'
          }}
        >
          BOOT_SYSTEM
        </button>
      </div>
    );
  }

  // Главный интерфейс
  const glassStyle = settings.display?.glassEffect ? {
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  } : {};

  const bgStyle = theme.bg.includes('gradient') 
    ? { background: theme.bg }
    : { backgroundColor: theme.bg };

  return (
    <div 
      className="h-screen w-full flex flex-col transition-all duration-700 overflow-hidden relative" 
      style={{ ...bgStyle, color: theme.text }}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header OS Bar */}
        <div 
          className="w-full h-16 border-b flex items-center z-50" 
          style={{ 
            ...glassStyle,
            borderColor: `${theme.text}11`,
            backgroundColor: settings.display?.glassEffect ? theme.surface : 'rgba(0,0,0,0.05)'
          }}
        >
          <button onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} className="h-full px-5 border-r hover:bg-black/10 transition-all" style={{ borderColor: `${theme.text}11` }}>
            <List size={18} />
          </button>
          <div className="flex-1 overflow-hidden">
            <div className="marquee-slow whitespace-nowrap pl-full">
              <span className="text-[10px] font-black uppercase font-syncopate tracking-[0.5em] opacity-10 mr-20">
                RELAY_SOURCE: {audioState.currentUrl} // CLUSTER: {searchQuery.toUpperCase()} // STATUS: {statusMessage}
              </span>
            </div>
          </div>
          <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="h-full px-5 border-l hover:bg-black/10 transition-all" style={{ borderColor: `${theme.text}11` }} title="Custom Streams">
            <Radio size={18} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Nav */}
          <LeftPanel
            isOpen={isLeftPanelOpen}
            providers={PROVIDERS}
            genresByProvider={GENRES_BY_PROVIDER}
            customNodes={settings.customNodes}
            currentGenre={audioState.currentGenre}
            onGenreClick={handleGenreClick}
            getGenreUrl={getGenreUrl}
            theme={theme}
            onDeleteNode={handleDeleteNode}
            onEditNode={handleEditNode}
          />

          {/* Stage */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Module Nav */}
            <ModuleSwitcher
              activeModule={activeModule}
              onModuleChange={toggleModule}
              modules={modules}
            />

            {/* Background 3D Shards - условно отображаем CSS или Three.js версию */}
            {settings.display?.use3DCosmicView ? (
              <ShardCloudThreeJS
                rotation={rotation}
                shards={mainCloudShards}
                onShardClick={(item) => {
                  console.log('🔥 Main Cloud Click - Module:', activeModule, 'Type:', typeof item, 'Data:', item);
                  
                  // item - это объект или строка в зависимости от модуля
                  if (activeModule === 'themes') {
                    // item - это объект Theme {id, name, colors, layout...}
                    if (typeof item === 'object' && item.id) {
                      console.log('✅ Applying theme:', item.id);
                      updateSettings({ themeId: item.id });
                    } else {
                      console.log('❌ Theme object invalid:', item);
                    }
                  } else if (activeModule === 'nodes') {
                    // item может быть: customNode {name, url, provider}, provider {id, name}, genre {name, url} или строка
                    if (typeof item === 'object') {
                      if ('url' in item && 'provider' in item) {
                        // Это customNode
                        handleTogglePlay(item.url, item.name, item.provider, false, {});
                      } else if ('id' in item) {
                        // Это provider объект - открываем поиск по его имени
                        setSearchQuery(item.name);
                        setActiveModule('discovery');
                      } else if ('url' in item) {
                        // Это genre объект с url
                        const genreName = item.name || 'Unknown';
                        handleTogglePlay(item.url, genreName, Provider.SOMAFM, false, {});
                      } else if (typeof item.name === 'string') {
                        // Объект только с name - ищем в GENRE_STREAMS
                        const genreUrl = GENRE_STREAMS[item.name];
                        if (genreUrl) {
                          handleTogglePlay(genreUrl, item.name, Provider.SOMAFM, false, {});
                        }
                      }
                    } else if (typeof item === 'string') {
                      // Строковый жанр - ищем в GENRE_STREAMS
                      const genreUrl = GENRE_STREAMS[item];
                      if (genreUrl) {
                        handleTogglePlay(genreUrl, item, Provider.SOMAFM, false, {});
                      }
                    }
                  } else if (activeModule === 'discovery') {
                    // item - это DiscoveredStream объект {name, url, favicon, bitrate...}
                    if (typeof item === 'object' && 'url' in item) {
                      handlePlayStream(item);
                    }
                  } else {
                    // Дефолтное облако - строки, открываем поиск
                    const searchTerm = typeof item === 'string' ? item : (item.name || '');
                    setSearchQuery(searchTerm);
                    setActiveModule('discovery');
                    // Немедленно запускаем поиск без ожидания debounce
                    instantSearch(searchTerm);
                  }
                }}
                isDragging={isDragging}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                theme={theme}
              />
            ) : (
              <ShardCloud
                rotation={rotation}
                shards={mainCloudShards}
                onShardClick={(item) => {
                  // item - это объект или строка в зависимости от модуля
                  if (activeModule === 'themes') {
                    // item - это объект Theme {id, name, colors, layout...}
                  if (typeof item === 'object' && item.id) {
                    updateSettings({ themeId: item.id });
                  }
                } else if (activeModule === 'display') {
                  // item - это провайдер визуализации {id, name}
                  if (typeof item === 'object' && item.id) {
                    console.log('✅ Switching visualization provider:', item.id);
                    updateDisplaySettings({ visualizationProvider: item.id });
                  }
                } else if (activeModule === 'nodes') {
                  // item может быть: customNode {name, url, provider}, provider {id, name}, genre {name, url} или строка
                  if (typeof item === 'object') {
                    if ('url' in item && 'provider' in item) {
                      // Это customNode
                      handleTogglePlay(item.url, item.name, item.provider, false, {});
                    } else if ('id' in item) {
                      // Это provider объект - открываем поиск по его имени
                      setSearchQuery(item.name);
                      setActiveModule('discovery');
                    } else if ('url' in item) {
                      // Это genre объект с url
                      const genreName = item.name || 'Unknown';
                      handleTogglePlay(item.url, genreName, Provider.SOMAFM, false, {});
                    } else if (typeof item.name === 'string') {
                      // Объект только с name - ищем в GENRE_STREAMS
                      const genreUrl = GENRE_STREAMS[item.name];
                      if (genreUrl) {
                        handleTogglePlay(genreUrl, item.name, Provider.SOMAFM, false, {});
                      }
                    }
                  } else if (typeof item === 'string') {
                    // Строковый жанр - ищем в GENRE_STREAMS
                    const genreUrl = GENRE_STREAMS[item];
                    if (genreUrl) {
                      handleTogglePlay(genreUrl, item, Provider.SOMAFM, false, {});
                    }
                  }
                } else if (activeModule === 'discovery') {
                  // item - это DiscoveredStream объект {name, url, favicon, bitrate...}
                  if (typeof item === 'object' && 'url' in item) {
                    handlePlayStream(item);
                  }
                } else {
                  // Дефолтное облако - строки, открываем поиск
                  const searchTerm = typeof item === 'string' ? item : (item.name || '');
                  setSearchQuery(searchTerm);
                  setActiveModule('discovery');
                  // Немедленно запускаем поиск без ожидания debounce
                  instantSearch(searchTerm);
                }
                }}
                isDragging={isDragging}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                theme={theme}
              />
            )}

            {/* Discovery поиск - показывается только для модуля discovery */}
            {activeModule === 'discovery' && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50">
                <div className="flex items-center bg-black/80 backdrop-blur-xl p-6 rounded-[2.5rem] border-2 border-indigo-600/30 shadow-2xl">
                  <Search size={24} className="opacity-40 mr-6 text-white" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="FREQUENCY_EXPLORATION..."
                    className="bg-transparent flex-1 text-xl font-black uppercase outline-none text-white placeholder:text-white/20"
                  />
                </div>
              </div>
            )}
            
            {/* Кнопка закрытия модуля */}
            {activeModule !== 'none' && (
              <button
                onClick={() => setActiveModule('none')}
                className="absolute top-6 right-6 z-50 p-3 rounded-full backdrop-blur-xl transition-all hover:scale-110"
                style={{
                  backgroundColor: theme.surface,
                  color: theme.text,
                  border: `2px solid ${theme.accent}40`
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Right Panel - Custom Streams */}
          <RightPanel
            isOpen={isRightPanelOpen}
            customNodes={settings.customNodes}
            currentGenre={audioState.currentGenre}
            onGenreClick={handleGenreClick}
            onEditNode={handleEditNode}
            onDeleteNode={handleDeleteNode}
            onAddNode={handleAddNode}
            theme={theme}
          />
        </div>

        {/* Master Footer Module */}
        <div className="h-28 border-t flex items-center justify-between px-10 bg-black/5 z-[300] backdrop-blur-3xl" style={{ borderColor: `${theme.text}11` }}>
          {/* Feed Metadata */}
          <TrackInfo metadata={metadata} onCopyMetadata={copyMetadata} />

          {/* Playback Hub */}
          <div className="flex-1 flex flex-col items-center gap-3">
            <PlayerControls
              isPlaying={audioState.isPlaying}
              isLoading={isAudioLoading}
              isShuffleMode={isShuffleMode}
              onTogglePlay={() => handleTogglePlay()}
              onNext={handleNext}
              onPrev={handlePrev}
              onToggleShuffle={() => setIsShuffleMode(!isShuffleMode)}
              onResetPositions={handleResetPositions}
              onChangeLayout={handleChangeLayout}
              currentLayout={currentLayout}
            />
            <div className="text-[7px] font-black uppercase opacity-5 tracking-[1em]">
              SYSTEM_STABLE // v2.7.0_CORE
            </div>
          </div>

          {/* Controls & Volume */}
          <div className="w-1/4 flex items-center justify-end gap-6">
            <VolumeControl volume={audioState.volume} onVolumeChange={setVolume} />
            <button
              onClick={() => toggleModule('discovery')}
              className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all border border-white/5"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Обертка с провайдерами контекстов
const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AudioProvider>
        <MetadataProvider>
          <AppContent />
        </MetadataProvider>
      </AudioProvider>
    </SettingsProvider>
  );
};

export default App;
