/**
 * renderEngines.ts
 * 
 * Константы для 3D движков рендеринга
 * Добавляем разные движки для визуализации облака тегов
 */

export enum RenderEngine {
  CSS3D = 'css3d',           // CSS 3D transforms (легковесный)
  THREEJS = 'threejs',       // Three.js WebGL (стандартный)
  BABYLONJS = 'babylonjs',   // Babylon.js (мощный)
  AFRAME = 'aframe',         // A-Frame (WebVR/AR)
  PLAYCANVAS = 'playcanvas'  // PlayCanvas (игровой движок)
}

export interface RenderEngineInfo {
  id: RenderEngine;
  name: string;
  description: string;
  icon: string;
  performance: 'light' | 'medium' | 'heavy';
  features: string[];
  requiresLibrary?: string; // npm package если нужен
  supportsVR?: boolean;
  supportsPhysics?: boolean;
}

/**
 * Доступные движки рендеринга
 */
export const RENDER_ENGINES: RenderEngineInfo[] = [
  {
    id: RenderEngine.CSS3D,
    name: 'CSS 3D',
    description: 'Легковесная визуализация на CSS transforms',
    icon: '📐',
    performance: 'light',
    features: ['Fast', 'No WebGL', 'Simple'],
    supportsVR: false,
    supportsPhysics: false
  },
  {
    id: RenderEngine.THREEJS,
    name: 'Three.js',
    description: 'Популярный WebGL движок для 3D',
    icon: '🪐',
    performance: 'medium',
    features: ['WebGL', 'Shaders', 'Post-processing'],
    requiresLibrary: 'three',
    supportsVR: true,
    supportsPhysics: false
  },
  {
    id: RenderEngine.BABYLONJS,
    name: 'Babylon.js',
    description: 'Мощный движок с физикой и PBR',
    icon: '🎮',
    performance: 'heavy',
    features: ['PBR Materials', 'Physics', 'Particles', 'Advanced Lighting'],
    requiresLibrary: '@babylonjs/core',
    supportsVR: true,
    supportsPhysics: true
  },
  {
    id: RenderEngine.AFRAME,
    name: 'A-Frame',
    description: 'WebVR фреймворк на базе Three.js',
    icon: '🥽',
    performance: 'medium',
    features: ['VR Ready', 'AR Support', 'Entity-Component'],
    requiresLibrary: 'aframe',
    supportsVR: true,
    supportsPhysics: true
  },
  {
    id: RenderEngine.PLAYCANVAS,
    name: 'PlayCanvas',
    description: 'Игровой движок для WebGL',
    icon: '🎯',
    performance: 'heavy',
    features: ['Game Engine', 'Visual Editor', 'Optimized'],
    requiresLibrary: 'playcanvas',
    supportsVR: false,
    supportsPhysics: true
  }
];

/**
 * Получить инфо о движке по ID
 */
export function getRenderEngineInfo(engineId: RenderEngine): RenderEngineInfo | undefined {
  return RENDER_ENGINES.find(e => e.id === engineId);
}

/**
 * Получить все движки по производительности
 */
export function getEnginesByPerformance(perf: 'light' | 'medium' | 'heavy'): RenderEngineInfo[] {
  return RENDER_ENGINES.filter(e => e.performance === perf);
}
