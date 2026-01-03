/**
 * App.tsx - REFACTORED VERSION
 * 
 * Главный компонент приложения AuraWave
 * Теперь использует модульную структуру с контекстами и компонентами
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, List, Terminal, Globe, Database, Sliders, Palette, Monitor, Diamond, X, Activity, Search } from 'lucide-react';

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
import { DiscoveryModule } from './components/Modules/DiscoveryModule';
import { NodesModule } from './components/Modules/NodesModule';
import { ThemesModule } from './components/Modules/ThemesModule';
import { LogsModule } from './components/Modules/LogsModule';
import { EQModule } from './components/Modules/EQModule';

// Сервисы и константы
import { audioEngine } from './services/audioEngine';
import { PROVIDERS, GENRES_BY_PROVIDER, GENRE_STREAMS, THEMES } from './constants';
import { Provider } from './types';
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
  const { settings, theme, updateSettings } = useSettings();
  const { metadata, statusMessage, updateMetadata, fetchAIMetadata } = useMetadata();
  
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    suggestions,
    setSuggestions,
    purgeBadSignals: originalPurge
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
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      if (!isDragging) {
        setRotation(prev => ({ x: prev.x + 0.04, y: prev.y + 0.06 }));
        setModuleRotation(prev => ({ x: prev.x + 0.02, y: prev.y + 0.03 }));
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isDragging]);

  // Генерация облака тегов
  const generateCloud = (items: any[], radius: number = 300) => {
    return items.map((item, i) => {
      const phi = Math.acos(-1 + (2 * i) / items.length);
      const theta = Math.sqrt(items.length * Math.PI) * phi;
      return {
        data: item,
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        size: 0.7 + Math.random() * 0.6
      };
    });
  };

  // Теги для текущего потока
  const currentStreamShards = useMemo(() => {
    const rawTags = metadata?.description || '';
    const parts = rawTags.split(/[\s,]+/).filter(t => t.length > 3).map(t => t.replace(/[#.,]/g, '').toUpperCase());
    return Array.from(new Set([...parts, searchQuery.toUpperCase()])).slice(0, 15);
  }, [metadata, searchQuery]);

  // Фоновое облако
  const mainCloudShards = useMemo(() => {
    const parts = new Set<string>();
    if (shardSource === 'scan') {
      searchQuery.split(/[\s\-_,.]+/).forEach(p => { if (p.length > 3) parts.add(p.toUpperCase()); });
      suggestions.slice(0, 30).forEach(s => s.tags?.split(/[\s,]+/).forEach(t => { if (t.length > 3 && t.length < 15) parts.add(t.toUpperCase()); }));
    } else if (shardSource === 'trace') {
      systemLogs.forEach(l => l.msg.split(' ').forEach(w => { if (w.length > 4 && /^[A-Z_]+$/.test(w)) parts.add(w.toUpperCase()); }));
    } else {
      ['NEURAL', 'QUANTUM', 'CYBER', 'VOID', 'ECHO', 'SYNTH', 'ISOLATE', 'GHOST', 'VECTOR', 'RECURSIVE', 'SOMA', 'MATRIX'].forEach(p => parts.add(p));
    }
    const tags = Array.from(parts).slice(0, 50);
    return generateCloud(tags, 340);
  }, [searchQuery, suggestions, systemLogs, shardSource]);

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

  // Конфигурация модулей для переключателя
  const modules = [
    { id: 'discovery' as ModuleType, icon: <Globe size={20} />, label: 'SCAN' },
    { id: 'nodes' as ModuleType, icon: <Database size={20} />, label: 'NODES' },
    { id: 'eq' as ModuleType, icon: <Sliders size={20} />, label: 'EQ' },
    { id: 'themes' as ModuleType, icon: <Palette size={20} />, label: 'THEME' },
    { id: 'intel' as ModuleType, icon: <Monitor size={20} />, label: 'INTEL' }
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

  // Экран инициализации
  if (!isInitialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-50 duration-700" style={{ backgroundColor: theme.bg, color: theme.text }}>
        <div className="w-40 h-40 mb-10 flex items-center justify-center rounded-[4rem] bg-indigo-600 text-white shadow-3xl animate-pulse">
          <Cpu size={64} />
        </div>
        <h1 className="text-6xl font-black font-syncopate uppercase tracking-widest mb-10">AURAWAVE</h1>
        <button
          onClick={() => {
            audioEngine.init();
            setIsInitialized(true);
            addLog('Core Initialized', 'zap');
          }}
          className="px-14 py-7 rounded-[3rem] bg-indigo-600 text-white font-black text-2xl uppercase transition-all shadow-2xl hover:scale-105 active:scale-95"
        >
          BOOT_SYSTEM
        </button>
      </div>
    );
  }

  // Главный интерфейс
  return (
    <div className="h-screen w-full flex flex-col transition-all duration-700 overflow-hidden relative" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header OS Bar */}
        <div className="w-full h-14 border-b flex items-center bg-black/5 z-50 backdrop-blur-md" style={{ borderColor: `${theme.text}11` }}>
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
          <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="h-full px-5 border-l hover:bg-black/10 transition-all" style={{ borderColor: `${theme.text}11` }}>
            <Terminal size={18} />
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
          />

          {/* Stage */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Module Nav */}
            <ModuleSwitcher
              activeModule={activeModule}
              onModuleChange={toggleModule}
              modules={modules}
            />

            {/* Background 3D Shards */}
            <ShardCloud
              rotation={rotation}
              shards={mainCloudShards}
              onShardClick={(tag) => {
                setSearchQuery(tag);
                setActiveModule('discovery');
              }}
              isDragging={isDragging}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              theme={theme}
            />

            {/* Neural Module Overlay */}
            {activeModule !== 'none' && (
              <div className="absolute inset-4 lg:inset-10 z-[200] rounded-[3rem] bg-white dark:bg-[#08090f] border-4 shadow-3xl p-6 lg:p-12 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300" style={{ borderColor: `${theme.text}22`, backdropFilter: `blur(${theme.blur})` }}>
                <div className="flex justify-between items-center mb-8 border-b pb-6" style={{ borderColor: `${theme.text}11` }}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl">
                      <Diamond size={20} />
                    </div>
                    <h2 className="text-xl font-black uppercase font-syncopate text-indigo-600 tracking-tighter">
                      {activeModule.toUpperCase()}
                    </h2>
                  </div>
                  <button onClick={() => toggleModule('none')} className="p-3 hover:bg-black/5 rounded-full transition-all hover:rotate-90">
                    <X size={24} />
                  </button>
                </div>

                {/* Отображение соответствующего модуля */}
                {activeModule === 'discovery' && (
                  <DiscoveryModule
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    isSearching={isSearching}
                    isTestingSignals={isTestingSignals}
                    onPurgeSignals={purgeBadSignalsWrapper}
                    currentStreamShards={currentStreamShards}
                    suggestions={suggestions}
                    onPlayStream={handlePlayStream}
                    currentUrl={audioState.currentUrl}
                    moduleRotation={moduleRotation}
                    moduleCloudItems={moduleCloudItems}
                    isDragging={isDragging}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                  />
                )}

                {activeModule === 'nodes' && (
                  <NodesModule
                    moduleRotation={moduleRotation}
                    moduleCloudItems={moduleCloudItems}
                    onNodeClick={handleNodeClick}
                    isDragging={isDragging}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                  />
                )}

                {activeModule === 'themes' && (
                  <ThemesModule
                    currentThemeId={settings.themeId}
                    moduleRotation={moduleRotation}
                    moduleCloudItems={moduleCloudItems}
                    onThemeSelect={handleThemeSelect}
                    isDragging={isDragging}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                  />
                )}

                {activeModule === 'intel' && (
                  <LogsModule systemLogs={systemLogs} />
                )}

                {activeModule === 'eq' && <EQModule />}
              </div>
            )}
          </div>

          {/* Logs Drawer */}
          <RightPanel
            isOpen={isRightPanelOpen}
            systemLogs={systemLogs}
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
