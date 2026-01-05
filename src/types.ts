
export enum Provider {
  SOMAFM = 'SomaFM Network',
  NIGHTRIDE = 'Nightride FM',
  FOCUS_MODE = 'Neural Focus',
  GENERATIVE_AI = 'Gen-AI Synth',
  BASS_DRIVE = 'Bass & Beats',
  CUSTOM = 'User Nodes',
  RADIO_BROWSER = 'Global Discovery'
}

export enum Genre {
  GROOVE_SALAD = 'Groove Salad',
  DRONE_ZONE = 'Drone Zone',
  DEF_CON = 'DEF CON Radio',
  CLIQHOP = 'Cliqhop IDM',
  SPACE_STATION = 'Space Station Soma',
  LUSH = 'Lush',
  VAPORWAVES = 'Vaporwaves',
  SECRET_AGENT = 'Secret Agent',
  NR_NIGHTRIDE = 'Nightride Main',
  NR_CYBERPUNK = 'Cyberpunk FM',
  NR_SYNTHWAVE = 'Pure Synthwave',
  NR_DARKSYNTH = 'Darksynth Core',
  NR_HORROR = 'Horror Synth',
  CODE_FLOW = 'Neural Coding',
  HACKER_IDM = 'Hacker IDM',
  FOCUS_AMBIENT = 'Deep Focus',
  TERMINAL_BEATS = 'Terminal Beats',
  SYSTEM_DRONE = 'System Drone',
  AI_ATMOSPHERE = 'Neural Atmosphere',
  AI_GLITCH = 'Recursive Glitch',
  AI_DREAM = 'Latent Space Dream',
  TECHNO = 'Techno Logic',
  AMBIENT = 'Pure Ambient',
  LOFI = 'Lofi Echoes',
  DRUM_BASS = 'D&B Core',
  LIQUID = 'Liquid Flow',
  DUB_STEP = 'Dubstep'
}

export interface TrackMetadata {
  title: string;
  artist: string;
  bpm: number;
  mood: string;
  energy: number;
  description: string;
  bitrate?: number;
  codec?: string;
  country?: string;
  language?: string;
  favicon?: string;
  lastCheck?: string;
  ping?: number;
  quality?: 'HIGH' | 'STABLE' | 'LOW';
}

export interface PlayHistoryItem {
  name: string;
  url: string;
  provider: Provider;
  timestamp: number;
  favicon?: string;
}

export interface FavoriteNode {
  name: string;
  url: string;
  provider: Provider;
  favicon?: string;
  tags?: string[];
}

export interface CustomNode {
  id: string;
  name: string;
  url: string;
  provider: Provider;
  tags?: string[];
  bitrate?: number;
}

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  currentGenre: Genre | string;
  currentProvider: Provider;
  currentUrl: string;
  sessionHistory: PlayHistoryItem[];
  historyIndex: number;
}

export type EQBand = '32' | '64' | '125' | '250' | '500' | '1k' | '2k' | '4k' | '8k' | '16k';

export interface EqualizerSettings {
  bands: Record<EQBand, number>;
  preamp: number;
  stereoWidth: number;
  limiterEnabled: boolean;
  eqBandCount: 10;
}

export type LayoutType = 'MONOLITH' | 'COCKPIT' | 'DATAVIEW' | 'CONTROL_PANEL' | 'GHOST';

export interface ThemeScheme {
  id: string;
  name: string;
  bg: string;
  surface: string;
  text: string;
  accent: string;
  secondary: string;
  isLight: boolean;
  layout: LayoutType;
  fontScale: number;
  blur: string;
  glass?: boolean; // Стеклянный эффект
  borderRadius?: string; // Радиус скругления
  shadowIntensity?: number; // Интенсивность теней
}

export type CloudLayout = 'sphere' | 'spiral' | 'cube' | 'plane' | 'cylinder';

export interface CloudSettings {
  viewMode: 'cloud' | 'grid' | 'list' | 'web'; // Режим отображения
  cloudScale: number; // 0.5 - 2.0
  rotationSpeed: number; // 0 - 5
  showConnections: boolean; // Связи между элементами
  connectionStyle: 'lines' | 'threads' | 'glow' | 'none';
  sortBy: 'name' | 'popularity' | 'recent' | 'random';
  filterTags: string[];
}

export interface DisplaySettings {
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  iconSize: 'sm' | 'md' | 'lg' | 'xl';
  compactMode: boolean;
  glassEffect: boolean;
  randomColors: boolean; // Случайные цвета для элементов
  animationSpeed: 'slow' | 'normal' | 'fast';
  borderStyle: 'none' | 'solid' | 'gradient' | 'glow';
  spacing: 'tight' | 'normal' | 'relaxed';
  use3DCosmicView?: boolean; // DEPRECATED: Переключение между CSS 3D и Three.js (использовать renderEngine вместо)
  renderEngine?: string; // ID движка рендеринга (из RenderEngine enum)
  cloudLayout?: CloudLayout; // Тип раскладки облака
  cloudSettings?: CloudSettings; // Настройки облака тегов
  visualizationProvider?: string; // Провайдер визуализации (из VisualizationProvider enum)
  visualizationEnabled?: boolean; // Включена ли визуализация (по умолчанию true)
  tagModel?: string; // ID 3D модели для тегов (из models.ts)
  show3DLabels?: boolean; // Показывать текстовые метки на 3D планетах
  limitTagLength?: boolean; // Ограничивать длину названий до 3 слов
  maxTagWords?: number; // Максимальное количество слов в названии (по умолчанию 3)
  colorSeed?: number; // Seed для генерации случайных цветов (0-360)
}

export interface ModuleCustomization {
  moduleId: string;
  customColor?: string;
  opacity?: number;
  blur?: number;
  scale?: number;
  visible?: boolean;
}

export interface BlacklistedStream {
  url: string;
  reason?: 'low_bitrate' | 'not_working' | 'irrelevant' | 'user_ban';
  timestamp: number;
}

export interface SearchCacheEntry {
  query: string;
  results: RadioStation[];
  timestamp: number;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultsCount?: number;
}

export interface AppSettings {
  themeId: string;
  equalizer: EqualizerSettings;
  customNodes: CustomNode[];
  favorites: FavoriteNode[];
  blacklist: string[]; // Legacy: simple URLs
  blacklistedStreams?: BlacklistedStream[]; // New: URLs with reasons
  searchCache?: SearchCacheEntry[]; // Кеш результатов поиска
  searchHistory?: SearchHistoryItem[]; // История поисков
  display?: DisplaySettings;
  moduleCustomizations?: ModuleCustomization[];
}

export type VisualizerTheme = 'cyberpunk' | 'retro' | 'minimalist' | 'default';
