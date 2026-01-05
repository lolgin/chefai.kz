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
import { Cpu, List, Globe, Database, Palette, Diamond, X, Search, Activity, Radio, Monitor, Type, Maximize, Sparkles, Layers, Eye, Orbit, ChevronDown } from 'lucide-react';

// Контексты
import { AudioProvider } from './contexts/AudioContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { MetadataProvider } from './contexts/MetadataContext';
import { LayoutProvider } from './contexts/LayoutContext';

// Хуки
import { useSystemLogs } from './hooks/useSystemLogs';
import { useStreamDiscovery } from './hooks/useStreamDiscovery';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useSettings } from './contexts/SettingsContext';
import { useMetadata } from './contexts/MetadataContext';
import { useLayout } from './contexts/LayoutContext';

// Компоненты
import { PlayerControls } from './components/Player/PlayerControls';
import { VolumeControl } from './components/Player/VolumeControl';
import { TrackInfo } from './components/Player/TrackInfo';
import { LeftPanel } from './components/Panels/LeftPanel';
import { ModuleSwitcher, ModuleType } from './components/Panels/ModuleSwitcher';
import { DraggableElement } from './components/UI/DraggableElement';
import { ShardCloud } from './components/Background/ShardCloud';
import { ShardCloudThreeJS } from './components/Background/ShardCloudThreeJS';
import { DiscoveryModule } from './components/Modules/DiscoveryModule';
import { NodesModule } from './components/Modules/NodesModule';
import { ThemesModule } from './components/Modules/ThemesModule';
import { ModelsModule } from './components/Modules/ModelsModule';
import { EngineModule } from './components/Modules/EngineModule';

// Сервисы и константы
import { audioEngine } from './services/audioEngine';
import { PROVIDERS, GENRES_BY_PROVIDER, GENRE_STREAMS, THEMES } from './constants';
import { BUILT_IN_MODELS } from './constants/models';
import { Provider, CloudLayout, CustomNode } from './types';
import { DiscoveredStream } from './services/streamDiscovery';
import { getAllVisualizationProviders, VisualizationProvider } from './services/visualizationProviders';
import { RenderEngine, RENDER_ENGINES } from './constants/renderEngines';
import { TagContextMenu } from './components/UI/TagContextMenu';

// Основной компонент приложения с контекстами
const AppContent: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleType>('none');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [isTestingSignals, setIsTestingSignals] = useState(false);
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const [showStreamIcons, setShowStreamIcons] = useState(true);
  
  // Контекстное меню для тегов
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    item: any;
  }>({ visible: false, position: { x: 0, y: 0 }, item: null });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Диалог редактирования
  const [editDialog, setEditDialog] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    item: any;
    name: string;
    url: string;
  }>({ visible: false, position: { x: 0, y: 0 }, item: null, name: '', url: '' });
  
  // 3D вращение
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [moduleRotation, setModuleRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [shardSource] = useState<'scan' | 'trace' | 'hyper'>('scan');

  // Resize панели
  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(250, Math.min(600, e.clientX));
      setLeftPanelWidth(newWidth);
    }
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);
  
  // Глобальный обработчик долгого нажатия для всех тегов
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let currentItem: any = null;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      // Проверяем что это тег облака
      if (target.classList.contains('shard-label') || target.closest('.shard-label')) {
        const labelEl = target.classList.contains('shard-label') ? target : target.closest('.shard-label') as HTMLElement;
        
        // Получаем данные элемента из data-атрибута
        const dataStr = labelEl?.getAttribute('data-item');
        if (dataStr) {
          try {
            currentItem = JSON.parse(dataStr);
            
            timer = setTimeout(() => {
              if (currentItem) {
                handleTagLongPress(currentItem, e);
              }
            }, 2000); // 2 секунды
          } catch (err) {
            console.error('Failed to parse item data:', err);
          }
        }
      }
    };

    const handlePointerUp = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      currentItem = null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Если мышь двигается - отменяем долгое нажатие
      if (timer && currentItem) {
        clearTimeout(timer);
        timer = null;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
    document.addEventListener('pointermove', handlePointerMove);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [activeModule]);

  // Используем хуки и контексты
  const { systemLogs, addLog } = useSystemLogs();
  const { settings, theme, updateSettings, updateDisplaySettings, addToBlacklist, removeFromBlacklist, isBlacklisted } = useSettings();
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

  // Закрытие панели движков при клике вне её
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Проверяем, что клик не по кнопке движка и не по самой панели
      if (isEngineDropdownOpen && 
          !target.closest('[data-engine-panel]') && 
          !target.closest('[data-engine-button]')) {
        setIsEngineDropdownOpen(false);
      }
    };
    
    if (isEngineDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEngineDropdownOpen]);

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
          
        case 'plane': // Плоскость - используем хеш вместо индекса!
          const gridSize = Math.ceil(Math.sqrt(1000)); // Фиксированный размер сетки
          const row = Math.floor(stableIndex / gridSize);
          const col = stableIndex % gridSize;
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

  // КОНСТАНТЫ как в Themes - не пересоздаются НИКОГДА!
  const discoveryItems = useMemo(() => {
    return suggestions.length > 0 
      ? suggestions.slice(0, 40)
      : [searchQuery.toUpperCase() || 'SEARCH'];
  }, [suggestions, searchQuery]);

  const nodesItems = useMemo(() => {
    return [
      ...settings.customNodes,
      ...PROVIDERS,
      ...PROVIDERS.flatMap(p => GENRES_BY_PROVIDER[p.id as Provider] || [])
    ].slice(0, 45);
  }, [settings.customNodes]);

  const modelsItems = useMemo(() => {
    return BUILT_IN_MODELS;
  }, []); // Константа, не зависит от изменений
  
  const themesItems = THEMES; // Прямая константа

  // Фоновое облако - переключается в зависимости от активного модуля
  const mainCloudShards = useMemo(() => {
    // Если активен модуль - показываем его облако с ПОЛНЫМИ ОБЪЕКТАМИ
    if (activeModule === 'discovery') {
      return generateCloud(discoveryItems, 340);
    } else if (activeModule === 'nodes') {
      return generateCloud(nodesItems, 340);
    } else if (activeModule === 'themes') {
      // THEMES - константа, не требует мемоизации
      return generateCloud(themesItems, 340);
    } else if (activeModule === 'models') {
      return generateCloud(modelsItems, 340);
    } else if (activeModule === 'streams') {
      // Для streams показываем все потоки из провайдеров + custom nodes
      const allStreams: any[] = [];
      PROVIDERS.forEach(provider => {
        const genres = GENRES_BY_PROVIDER[provider.id] || [];
        genres.forEach(genre => {
          allStreams.push({
            name: genre,
            url: GENRE_STREAMS[genre],
            provider: provider.id,
            providerName: provider.name
          });
        });
      });
      // Добавляем custom nodes
      settings.customNodes.forEach(node => {
        allStreams.push(node);
      });
      return generateCloud(allStreams, 340);
    } else if (activeModule === 'engine') {
      // Для engine показываем список движков (только доступные)
      const availableEngines = RENDER_ENGINES.filter(e => 
        e.id === RenderEngine.CSS3D || e.id === RenderEngine.THREEJS
      );
      return generateCloud(availableEngines, 340);
    }
    
    // Дефолтное облако когда модуль не активен - чистый запуск (пустое)
    return generateCloud([], 340);
  }, [activeModule, discoveryItems, nodesItems, themesItems, generateCloud, modelsItems, settings.customNodes]);

  // Облако для модулей (используем те же стабильные массивы)
  const moduleCloudItems = useMemo(() => {
    switch (activeModule) {
      case 'discovery':
        return generateCloud(discoveryItems, 280);
      case 'nodes':
        return generateCloud(nodesItems, 280);
      case 'themes':
        return generateCloud(themesItems, 240);
      case 'models':
        return generateCloud(modelsItems, 280);
      case 'intel':
        const intelPool = ['LATENCY: 42ms', 'NODES: 12', 'UPTIME: 100%', 'ENCRYPTION: AES-256', 'SIGNAL: STABLE', ...systemLogs.map(l => l.msg)];
        return generateCloud(intelPool, 260);
      default:
        return [];
    }
  }, [activeModule, discoveryItems, nodesItems, systemLogs, generateCloud]);

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
  
  // Обработчики контекстного меню для тегов
  const handleTagLongPress = (item: any, event: MouseEvent | TouchEvent) => {
    const x = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const y = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    setContextMenu({
      visible: true,
      position: { x, y },
      item
    });
  };

  const handleSaveToStreams = (item: any) => {
    // Сохраняем элемент в custom nodes
    const newNode: CustomNode = {
      id: `custom_${Date.now()}`,
      name: item.name || item.title || String(item.id || 'Unknown'),
      url: item.url || item.streamUrl || item.url_resolved || '',
      provider: Provider.CUSTOM
    };
    
    if (!newNode.url) {
      addLog('Error: No URL found', 'error');
      return;
    }
    
    const updatedNodes = [...settings.customNodes, newNode];
    updateSettings({ customNodes: updatedNodes });
    addLog(`Saved: ${newNode.name}`, 'info');
  };

  const handleEditItem = (item: any) => {
    // Открываем диалог редактирования
    setEditDialog({
      visible: true,
      position: contextMenu.position,
      item: item,
      name: item.name || item.title || '',
      url: item.url || item.streamUrl || item.url_resolved || ''
    });
    setContextMenu({ visible: false, position: { x: 0, y: 0 }, item: null });
  };
  
  const handleSaveEdit = () => {
    if (!editDialog.item) return;
    
    // Обновляем или создаем custom node
    const updatedNode: CustomNode = {
      id: editDialog.item.id || `custom_${Date.now()}`,
      name: editDialog.name,
      url: editDialog.url,
      provider: Provider.CUSTOM
    };
    
    const existingIndex = settings.customNodes.findIndex(n => n.id === updatedNode.id);
    let updatedNodes;
    
    if (existingIndex >= 0) {
      // Обновляем существующий
      updatedNodes = [...settings.customNodes];
      updatedNodes[existingIndex] = updatedNode;
    } else {
      // Добавляем новый
      updatedNodes = [...settings.customNodes, updatedNode];
    }
    
    updateSettings({ customNodes: updatedNodes });
    addLog(`Updated: ${updatedNode.name}`, 'info');
    setEditDialog({ visible: false, position: { x: 0, y: 0 }, item: null, name: '', url: '' });
  };

  const handleDeleteItem = (item: any) => {
    const itemName = item.name || item.title || 'этот поток';
    if (confirm(`Удалить "${itemName}"?`)) {
      // Для customNodes удаляем по id
      if (item.id) {
        const updatedNodes = settings.customNodes.filter(n => n.id !== item.id);
        updateSettings({ customNodes: updatedNodes });
        addLog(`Deleted: ${itemName}`, 'info');
      } else {
        // Для потоков без id удаляем по URL (добавляем в blacklist)
        const url = item.url || item.streamUrl || item.url_resolved;
        if (url) {
          addToBlacklist(url, 'user_ban');
          addLog(`Banned: ${itemName}`, 'warning');
        }
      }
    }
  };

  const handleCopyItem = (item: any) => {
    const text = item.url || item.streamUrl || item.url_resolved || item.name || JSON.stringify(item, null, 2);
    navigator.clipboard.writeText(text);
    addLog('Copied', 'info');
  };
  
  const handleToggleIcon = (item: any) => {
    setShowStreamIcons(prev => !prev);
    addLog(showStreamIcons ? 'Icons hidden' : 'Icons shown', 'info');
  };
  
  const handleToggleLabels = () => {
    const newValue = !settings.display?.show3DLabels;
    updateDisplaySettings({ show3DLabels: newValue });
    addLog(newValue ? '3D labels shown' : '3D labels hidden', 'info');
  };
  
  const handleToggleLimitLength = () => {
    const newValue = !settings.display?.limitTagLength;
    updateDisplaySettings({ limitTagLength: newValue });
    addLog(newValue ? 'Short names' : 'Full names', 'info');
  };
  
  const handleBanStream = (item: any) => {
    const url = item.url || item.streamUrl || item.url_resolved;
    if (url) {
      addToBlacklist(url, 'user_ban');
      addLog(`Banned: ${item.name || url}`, 'warning');
    }
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
    { id: 'streams' as ModuleType, icon: <List size={20} strokeWidth={1.5} />, label: 'STREAMS' },
    { id: 'discovery' as ModuleType, icon: <Globe size={20} strokeWidth={1.5} />, label: 'SCAN' },
    { id: 'nodes' as ModuleType, icon: <Database size={20} strokeWidth={1.5} />, label: 'NODES' },
    { id: 'themes' as ModuleType, icon: <Palette size={20} strokeWidth={1.5} />, label: 'THEME' },
    { id: 'models' as ModuleType, icon: <Layers size={20} strokeWidth={1.5} />, label: 'MODELS' },
    { id: 'engine' as ModuleType, icon: <Cpu size={20} strokeWidth={1.5} />, label: 'ENGINE' }
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
        
        {/* Stage - полный экран с облаком и панелями поверх */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Module Nav */}
            <ModuleSwitcher
              activeModule={activeModule}
              onModuleChange={toggleModule}
              modules={modules}
            />

            {/* Background 3D Shards - выбор движка рендеринга */}
            {(() => {
              // Если визуализация отключена - не показываем облако
              const visualizationEnabled = settings.displaySettings?.visualizationEnabled ?? true;
              if (!visualizationEnabled) {
                return null;
              }
              
              const currentEngine = settings.display?.renderEngine || RenderEngine.THREEJS;
              
              // CSS 3D движок (легковесный)
              if (currentEngine === RenderEngine.CSS3D) {
                return (
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
                    } else if (activeModule === 'models') {
                      // item - это объект Model3D {id, name, url, category...}
                      if (typeof item === 'object' && item.id) {
                        updateDisplaySettings({ tagModel: item.id });
                        addLog(`Model: ${item.name}`, 'info');
                      }
                    } else if (activeModule === 'display') {
                      // item - это провайдер визуализации {id, name}
                      if (typeof item === 'object' && item.id) {
                        console.log('✅ Switching visualization provider:', item.id);
                        updateDisplaySettings({ visualizationProvider: item.id });
                      }
                    } else if (activeModule === 'streams') {
                      // item - это поток {name, url, provider, providerName}
                      if (typeof item === 'object' && item.url && item.provider) {
                        handleTogglePlay(item.url, item.name, item.provider, false, {});
                        // НЕ закрываем модуль, чтобы облако оставалось видимым
                      }
                    } else if (activeModule === 'engine') {
                      // item - это движок {id, name, icon, performance}
                      if (typeof item === 'object' && item.id) {
                        updateSettings({ display: { ...settings.display, renderEngine: item.id } });
                        addLog(`Engine: ${item.name}`, 'info');
                        // НЕ закрываем модуль
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
                    fontSize={settings.displaySettings?.fontSize || 'lg'}
                    showIcons={showStreamIcons}
                  />
                );
              }
              
              // Three.js движок (стандартный WebGL)
              return (
              <ShardCloudThreeJS
                rotation={rotation}
                shards={mainCloudShards}
                use3DModels={true}
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
                  } else if (activeModule === 'models') {
                    // item - это объект Model3D {id, name, url, category...}
                    if (typeof item === 'object' && item.id) {
                      console.log('✅ Applying 3D model:', item.id);
                      updateDisplaySettings({ tagModel: item.id });
                      addLog(`Model: ${item.name}`, 'info');
                    }
                  } else if (activeModule === 'streams') {
                    // item - это поток {name, url, provider, providerName}
                    if (typeof item === 'object' && item.url && item.provider) {
                      handleTogglePlay(item.url, item.name, item.provider, false, {});
                      // НЕ закрываем модуль
                    }
                  } else if (activeModule === 'engine') {
                    // item - это движок {id, name, icon, performance}
                    if (typeof item === 'object' && item.id) {
                      updateSettings({ display: { ...settings.display, renderEngine: item.id } });
                      addLog(`Engine: ${item.name}`, 'info');
                      // НЕ закрываем модуль
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
              );
            })()}

            
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

          {/* LeftPanel убрана - потоки показываются в облаке тегов */}
        </div>

        {/* Master Footer Module - стеклянная прозрачная панель */}
        <div className="h-16 md:h-20 border-t flex items-center justify-between px-4 md:px-8 bg-black/5 backdrop-blur-2xl z-[300]" style={{ borderColor: `${theme.text}08` }}>
          {/* Feed Metadata */}
          <TrackInfo metadata={metadata} onCopyMetadata={copyMetadata} />
          
          {/* Compact Search - упрощенный, без лишних кнопок */}
          <div className="flex items-center gap-2">
            {/* Compact Search Input - упрощенный */}
            <div className="relative hidden md:block">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-32 px-3 py-1.5 pr-8 text-xs rounded-full bg-black/5 backdrop-blur-xl border transition-all focus:w-48 focus:bg-black/10 outline-none"
                style={{ 
                  borderColor: activeModule === 'discovery' ? theme.accent : `${theme.text}10`,
                  color: theme.text
                }}
              />
              <Search 
                size={14} 
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none"
                style={{ color: theme.text }}
              />
            </div>
          </div>

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

          {/* Controls & Volume - минималистичные */}
          <div className="flex-shrink-0 flex items-center justify-end gap-2 md:gap-3">
            <VolumeControl volume={audioState.volume} onVolumeChange={setVolume} />
            <button
              onClick={() => toggleModule('discovery')}
              className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
            >
              <Search size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Контекстное меню для всех тегов */}
      <TagContextMenu
        isVisible={contextMenu.visible}
        position={contextMenu.position}
        item={contextMenu.item}
        moduleType={activeModule}
        onSave={handleSaveToStreams}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        onCopy={handleCopyItem}
        onToggleIcon={handleToggleIcon}
        onToggleLabels={handleToggleLabels}
        onToggleLimitLength={handleToggleLimitLength}
        onBan={handleBanStream}
        onClose={() => setContextMenu({ visible: false, position: { x: 0, y: 0 }, item: null })}
        theme={theme}
        showIcons={showStreamIcons}
        show3DLabels={settings.display?.show3DLabels !== false}
        limitTagLength={settings.display?.limitTagLength !== false}
      />
      
      {/* Диалог редактирования */}
      {editDialog.visible && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/50"
            onClick={() => setEditDialog({ visible: false, position: { x: 0, y: 0 }, item: null, name: '', url: '' })}
          />
          <div
            className="fixed z-[9999] bg-black/90 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 p-4 min-w-[300px]"
            style={{
              left: `${Math.min(editDialog.position.x, window.innerWidth - 320)}px`,
              top: `${Math.min(editDialog.position.y, window.innerHeight - 200)}px`,
              color: theme.text
            }}
          >
            <div className="space-y-3">
              <div className="text-sm font-bold uppercase opacity-70">Редактировать</div>
              <input
                type="text"
                value={editDialog.name}
                onChange={(e) => setEditDialog(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Название"
                className="w-full px-3 py-2 text-sm rounded bg-black/30 border border-white/10 outline-none"
                style={{ color: theme.text }}
              />
              <input
                type="text"
                value={editDialog.url}
                onChange={(e) => setEditDialog(prev => ({ ...prev, url: e.target.value }))}
                placeholder="URL потока"
                className="w-full px-3 py-2 text-sm rounded bg-black/30 border border-white/10 outline-none"
                style={{ color: theme.text }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-3 py-2 rounded bg-green-500/20 hover:bg-green-500/30 transition-all text-xs font-medium"
                  style={{ color: theme.text }}
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditDialog({ visible: false, position: { x: 0, y: 0 }, item: null, name: '', url: '' })}
                  className="flex-1 px-3 py-2 rounded bg-red-500/20 hover:bg-red-500/30 transition-all text-xs font-medium"
                  style={{ color: theme.text }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Обертка с провайдерами контекстов
const App: React.FC = () => {
  return (
    <LayoutProvider>
      <SettingsProvider>
        <AudioProvider>
          <MetadataProvider>
            <AppContent />
          </MetadataProvider>
        </AudioProvider>
      </SettingsProvider>
    </LayoutProvider>
  );
};

export default App;
