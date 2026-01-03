
import { Genre, Provider, ThemeScheme, LayoutType } from './types';

export const PROVIDERS = [
  { id: Provider.GENERATIVE_AI, name: 'Neural Synth', color: '#6366f1' },
  { id: Provider.FOCUS_MODE, name: 'Neural Focus', color: '#06b6d4' },
  { id: Provider.SOMAFM, name: 'SomaFM Network', color: '#0ea5e9' },
  { id: Provider.NIGHTRIDE, name: 'Nightride FM', color: '#f43f5e' },
  { id: Provider.BASS_DRIVE, name: 'Bass & Beats', color: '#8b5cf6' },
  { id: Provider.CUSTOM, name: 'User Relays', color: '#f59e0b' }
];

export const THEMES: ThemeScheme[] = [
  {
    id: 'frost',
    name: 'Clean Frost',
    bg: '#f8f9ff',
    surface: 'rgba(255, 255, 255, 0.7)',
    text: '#1e1b4b',
    accent: '#4f46e5',
    secondary: '#818cf8',
    isLight: true,
    layout: 'MONOLITH',
    fontScale: 1.2,
    blur: '24px'
  },
  {
    id: 'neon-overdrive',
    name: 'Neon Overdrive',
    bg: '#020205',
    surface: 'rgba(255, 0, 128, 0.05)',
    text: '#ff007f',
    accent: '#00f2ff',
    secondary: '#7000ff',
    isLight: false,
    layout: 'COCKPIT',
    fontScale: 1.1,
    blur: '12px'
  },
    {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    bg: '🔷#1a1f3a',
    surface: '🔷rgba(32, 42, 68, 0.85)',
    text: '🔷#e8f0ff',
    accent: '🔷#4d7cff',
    secondary: '🔷#2d4a9e',
    isLight: false,
    layout: 'MONOLITH',
    fontSize: 1.0,
    blur: '18px'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    bg: '🟣#2d1b4e',
    surface: '🟣rgba(58, 35, 96, 0.8)',
    text: '🟣#f5e6ff',
    accent: '🟣#a855f7',
    secondary: '🟣#7c3aed',
    isLight: false,
    layout: 'COCKPIT',
    fontSize: 1.1,
    blur: '20px'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    bg: '🟢#1a3a2e',
    surface: '🟢rgba(28, 69, 54, 0.85)',
    text: '🟢#e0f2e9',
    accent: '🟢#10b981',
    secondary: '🟢#059669',
    isLight: false,
    layout: 'MONOLITH',
    fontSize: 1.0,
    blur: '16px'
  },
  {
    id: 'toxic-acid',
    name: 'Acid Matrix',
    bg: '#050a05',
    surface: 'rgba(0, 255, 65, 0.05)',
    text: '#00ff41',
    accent: '#ccff00',
    secondary: '#003b00',
    isLight: false,
    layout: 'DATAVIEW',
    fontScale: 1.0,
    blur: '8px'
  },
  {
    id: 'starship',
    name: 'Starship HUD',
    bg: '#05070a',
    surface: 'rgba(249, 115, 22, 0.08)',
    text: '#f97316',
    accent: '#fbbf24',
    secondary: '#b45309',
    isLight: false,
    layout: 'COCKPIT',
    fontScale: 1.1,
    blur: '10px'
  },
  {
    id: 'obsidian-gold',
    name: 'Luxury Void',
    bg: '#000000',
    surface: 'rgba(212, 175, 55, 0.05)',
    text: '#d4af37',
    accent: '#ffffff',
    secondary: '#1a1a1a',
    isLight: false,
    layout: 'CONTROL_PANEL',
    fontScale: 1.1,
    blur: '20px'
  },
  {
    id: 'deepsea',
    name: 'Abyssal Depth',
    bg: '#000814',
    surface: 'rgba(0, 53, 102, 0.1)',
    text: '#00b4d8',
    accent: '#90e0ef',
    secondary: '#0077b6',
    isLight: false,
    layout: 'GHOST',
    fontScale: 1.05,
    blur: '30px'
  },
  {
    id: 'biopunk',
    name: 'Biopunk Core',
    bg: '#0a0d0a',
    surface: 'rgba(34, 197, 94, 0.08)',
    text: '#4ade80',
    accent: '#d8b4fe',
    secondary: '#166534',
    isLight: false,
    layout: 'CONTROL_PANEL',
    fontScale: 1.15,
    blur: '15px'
      },
      // === WINAMP-STYLE SKINS COLLECTION ===
        // Classic Themes
          {
                id: 'midnight-blue',
                    name: '🌙 Midnight Blue',
                        bg: '#0a0e27',
                            surface: 'rgba(30, 58, 138, 0.1)',
                                text: '#60a5fa',
                                    accent: '#3b82f6',
                                        secondary: '#1e3a8a',
                                            isLight: false,
                                                layout: 'MONOLITH',
                                                    fontScale: 1.1,
                                                        blur: '18px'
                                                          },
  }
    // Royal Purple
  {
    id: 'royal-purple',
    name: '👑 Royal Purple',
    bg: '#1a0a2e',
    surface: 'rgba(124, 58, 237, 0.1)',
    text: '#c084fc',
    accent: '#9333ea',
    secondary: '#6b21a8',
    isLight: false,
    layout: 'CONTROL_PANEL',
    fontScale: 1.15,
    blur: '16px'
  },
    // Forest Green
  {
    id: 'forest-green',
    name: '🌲 Forest Green',
    bg: '#0a1f0a',
    surface: 'rgba(34, 197, 94, 0.08)',
    text: '#4ade80',
    accent: '#22c55e',
    secondary: '#166534',
    isLight: false,
    layout: 'DATAVIEW',
    fontScale: 1.1,
    blur: '14px'
  },
  // Cherry Red
  {
    id: 'cherry-red',
    name: '🍒 Cherry Red',
    bg: '#2d0a0a',
    surface: 'rgba(239, 68, 68, 0.1)',
    text: '#fca5a5',
    accent: '#ef4444',
    secondary: '#991b1b',
    isLight: false,
    layout: 'COCKPIT',
    fontScale: 1.2,
    blur: '12px'
  },
  // Ocean Teal
  {
    id: 'ocean-teal',
    name: '🌊 Ocean Teal',
    bg: '#051923',
    surface: 'rgba(20, 184, 166, 0.08)',
    text: '#5eead4',
    accent: '#14b8a6',
    secondary: '#0f766e',
    isLight: false,
    layout: 'GHOST',
    fontScale: 1.05,
    blur: '20px'
  },
    // Sunset Orange
  {
    id: 'sunset-orange',
    name: '🌅 Sunset Orange',
    bg: '#2d1810',
    surface: 'rgba(249, 115, 22, 0.1)',
    text: '#fdba74',
    accent: '#f97316',
    secondary: '#9a3412',
    isLight: false,
    layout: 'MONOLITH',
    fontScale: 1.15,
    blur: '16px'
  },
  // === Futuristic Themes ===
  // Crystal Ice
  {
    id: 'crystal-ice',
    name: '💎 Crystal Ice',
    bg: '#0c1222',
    surface: 'rgba(56, 189, 248, 0.08)',
    text: '#7dd3fc',
    accent: '#38bdf8',
    secondary: '#0c4a6e',
    isLight: false,
    layout: 'COCKPIT',
    fontScale: 1.1,
    blur: '22px'
  },
  // Plasma Fire
  {
    id: 'plasma-fire',
    name: '🔥 Plasma Fire',
    bg: '#1a0b0b',
    surface: 'rgba(251, 146, 60, 0.1)',
    text: '#fecaca',
    accent: '#fb923c',
    secondary: '#7c2d12',
    isLight: false,
    layout: 'DATAVIEW',
    fontScale: 1.15,
    blur: '10px'
  },
    // === Retro Themes ===
  // Winamp Classic
  {
    id: 'winamp-classic',
    name: '🎵 Winamp Classic',
    bg: '#000814',
    surface: 'rgba(0, 212, 255, 0.12)',
    text: '#00d4ff',
    accent: '#00ff00',
    secondary: '#003566',
    isLight: false,
    layout: 'CONTROL_PANEL',
    fontScale: 1.0,
    blur: '8px'
  },
  // Windows 95
  {
    id: 'windows-95',
    name: '💾 Windows 95',
    bg: '#008080',
    surface: 'rgba(192, 192, 192, 0.15)',
    text: '#ffffff',
    accent: '#000080',
    secondary: '#c0c0c0',
    isLight: false,
    layout: 'MONOLITH',
    fontScale: 1.0,
    blur: '0px'
  },
  // Vapor Wave
  {
    id: 'vapor-wave',
    name: '🌴 Vapor Wave',
    bg: '#120d31',
    surface: 'rgba(255, 113, 206, 0.08)',
    text: '#ff71ce',
    accent: '#01cdfe',
    secondary: '#05ffa1',
    isLight: false,
    layout: 'GHOST',
    fontScale: 1.15,
    blur: '18px'
  },
  // Golden Hour
  {
    id: 'golden-hour',
    name: '✨ Golden Hour',
    bg: '#1f1810',
    surface: 'rgba(251, 191, 36, 0.08)',
    text: '#fde047',
    accent: '#fbbf24',
    secondary: '#92400e',
    isLight: false,
    layout: 'CONTROL_PANEL',
    fontScale: 1.1,
    blur: '16px'
  },
  // === NEW WINAMP-STYLE THEMES ===
  // Neon Pink
  {
    id: 'neon-pink',
    name: '💗 Neon Pink',
    bg: '#2d0a1f',
    surface: 'rgba(236, 72, 153, 0.12)',
    text: '#f9a8d4',
    accent: '#ec4899',
    secondary: '#9f1239',
    isLight: false,
    layout: 'COCKPIT',
    fontScale: 1.2,
    blur: '14px'
  },
  // Electric Blue
  {
    id: 'electric-blue',
    name: '⚡ Electric Blue',
    bg: '#0a0f2d',
    surface: 'rgba(59, 130, 246, 0.1)',
    text: '#93c5fd',
    accent: '#3b82f6',
    secondary: '#1e3a8a',
    isLight: false,
    layout: 'DATAVIEW',
    fontScale: 1.15,
    blur: '18px'
  },
  // Cyber Green
  {
    id: 'cyber-green',
    name: '🟢 Cyber Green',
    bg: '#0a1f0a',
    surface: 'rgba(34, 197, 94, 0.1)',
    text: '#86efac',
    accent: '#22c55e',
    secondary: '#14532d',
    isLight: false,
    layout: 'MONOLITH',
    fontScale: 1.1,
    blur: '16px'
  },
  // Hot Orange
  {
    id: 'hot-orange',
    name: '🔥 Hot Orange',
    bg: '#2d1400',
    surface: 'rgba(249, 115, 22, 0.12)',
    text: '#fed7aa',
    accent: '#f97316',
    secondary: '#9a3412',
    isLight: false,
    layout: 'CONTROL_PANEL',
    fontScale: 1.25,
    blur: '12px'
  },
  // Deep Purple
  {
    id: 'deep-purple',
    name: '🟣 Deep Purple',
    bg: '#1f0a2e',
    surface: 'rgba(147, 51, 234, 0.1)',
    text: '#d8b4fe',
    accent: '#9333ea',
    secondary: '#581c87',
    isLight: false,
    layout: 'GHOST',
    fontScale: 1.15,
    blur: '20px'
  }
];

export const GENRES_BY_PROVIDER: Record<Provider | string, (Genre | string)[]> = {
  [Provider.GENERATIVE_AI]: [
    Genre.AI_DREAM, Genre.AI_ATMOSPHERE, Genre.AI_GLITCH, Genre.AMBIENT, Genre.LOFI, Genre.SYSTEM_DRONE, 
    'Neural Flow', 'Zenith AI', 'Recursive Echo', 'Silicon Pulse', 'Synaptic Drift', 'Data Cloud'
  ],
  [Provider.FOCUS_MODE]: [
    Genre.CODE_FLOW, Genre.HACKER_IDM, Genre.TERMINAL_BEATS, Genre.FOCUS_AMBIENT, 
    'Kernel Panic', 'Cyber Protocol', 'DEF CON Radio'
  ],
  [Provider.SOMAFM]: [
    Genre.GROOVE_SALAD, Genre.DRONE_ZONE, Genre.DEF_CON, Genre.CLIQHOP, Genre.SPACE_STATION, Genre.LUSH, 
    Genre.VAPORWAVES, Genre.SECRET_AGENT, 'Digitalis', 'Indie Pop Rocks!', 'Suburbs of Goa', 'Beat Blender'
  ],
  [Provider.NIGHTRIDE]: [
    Genre.NR_NIGHTRIDE, Genre.NR_CYBERPUNK, Genre.NR_SYNTHWAVE, Genre.NR_DARKSYNTH, Genre.NR_HORROR, 
    'Vapor-City', 'Electro', 'Chillsynth'
  ],
  [Provider.BASS_DRIVE]: [
    Genre.DRUM_BASS, Genre.LIQUID, Genre.DUB_STEP, Genre.TECHNO, 'Hardline', 'Bassdrive', 'DnB Radio'
  ],
  [Provider.CUSTOM]: []
};

export const GENRE_STREAMS: Record<string, string> = {
  [Genre.DEF_CON]: 'https://ice1.somafm.com/defcon-128-mp3',
  [Genre.CODE_FLOW]: 'https://ice2.somafm.com/groovesalad-128-mp3',
  [Genre.HACKER_IDM]: 'https://ice1.somafm.com/cliqhop-128-mp3',
  [Genre.SYSTEM_DRONE]: 'https://ice2.somafm.com/dronezone-128-mp3',
  [Genre.FOCUS_AMBIENT]: 'https://ice1.somafm.com/deepspaceone-128-mp3',
  [Genre.GROOVE_SALAD]: 'https://ice2.somafm.com/groovesalad-128-mp3',
  [Genre.DRONE_ZONE]: 'https://ice4.somafm.com/dronezone-128-mp3',
  [Genre.CLIQHOP]: 'https://ice6.somafm.com/cliqhop-128-mp3',
  [Genre.SPACE_STATION]: 'https://ice1.somafm.com/spacestation-128-mp3',
  [Genre.LUSH]: 'https://ice1.somafm.com/lush-128-mp3',
  [Genre.VAPORWAVES]: 'https://ice2.somafm.com/vaporwaves-128-mp3',
  [Genre.SECRET_AGENT]: 'https://ice1.somafm.com/secretagent-128-mp3',
  [Genre.NR_NIGHTRIDE]: 'https://stream.nightride.fm/nightride.mp3',
  [Genre.NR_CYBERPUNK]: 'https://stream.nightride.fm/cyberpunk.mp3',
  [Genre.NR_SYNTHWAVE]: 'https://stream.nightride.fm/synthwave.mp3',
  [Genre.NR_DARKSYNTH]: 'https://stream.nightride.fm/darksynth.mp3',
  [Genre.NR_HORROR]: 'https://stream.nightride.fm/horror.mp3',
  [Genre.AMBIENT]: 'https://ice2.somafm.com/dronezone-128-mp3',
  [Genre.LOFI]: 'https://ice1.somafm.com/lofi-128-mp3',
  [Genre.DRUM_BASS]: 'https://ice1.somafm.com/drumndirty-128-mp3',
  [Genre.LIQUID]: 'https://ice2.somafm.com/groovesalad-128-mp3',
  [Genre.DUB_STEP]: 'https://ice1.somafm.com/beatblender-128-mp3',
  [Genre.TECHNO]: 'https://ice1.somafm.com/missioncontrol-128-mp3',
  [Genre.AI_ATMOSPHERE]: 'https://ice6.somafm.com/deepspaceone-128-mp3',
  [Genre.AI_GLITCH]: 'https://ice4.somafm.com/cliqhop-128-mp3',
  [Genre.AI_DREAM]: 'https://ice2.somafm.com/synphaera-128-mp3'
};
