/**
 * visualizationProviders.ts
 * 
 * Универсальная система провайдеров визуализации для тегов/станций
 * Модульная архитектура - легко добавлять новые типы визуализации
 * 
 * АРХИТЕКТУРА:
 * - Каждый провайдер = отдельный модуль с собственной логикой
 * - Провайдер отвечает за layout, рендеринг, интерактивность
 * - Легко расширяемая система через registry паттерн
 */

import { CloudFormation, CosmicObjectType } from '../types/cosmicTypes';

// ============================================
// ТИПЫ ПРОВАЙДЕРОВ ВИЗУАЛИЗАЦИИ
// ============================================

export enum VisualizationProvider {
  // Three.js 3D визуализации
  THREEJS_PLANETS = 'threejs-planets',     // Планеты как в Solar System
  THREEJS_GALAXY = 'threejs-galaxy',       // Галактика с звездами
  THREEJS_NEBULA = 'threejs-nebula',       // Туманность с частицами
  THREEJS_GRID = 'threejs-grid',           // 3D сетка
  
  // CSS 3D визуализации
  CSS3D_CLOUD = 'css3d-cloud',             // Облако тегов (текущее)
  CSS3D_SPHERE = 'css3d-sphere',           // Сфера
  CSS3D_HELIX = 'css3d-helix',             // Спираль ДНК
  
  // 2D визуализации
  D3_FORCE = 'd3-force',                   // Force-directed graph
  D3_TREE = 'd3-tree',                     // Иерархическое дерево
  D3_SUNBURST = 'd3-sunburst',             // Sunburst diagram
  
  // Списки/сетки
  GRID_LIST = 'grid-list',                 // Простая сетка
  MASONRY = 'masonry',                     // Masonry layout
  CAROUSEL = 'carousel'                    // Карусель
}

// ============================================
// БАЗОВЫЕ ИНТЕРФЕЙСЫ
// ============================================

export interface VisualizationItem {
  id: string;
  name: string;
  provider?: string;
  favicon?: string;
  tags?: string[];
  bitrate?: number;
  votes?: number;
  [key: string]: any;
}

export interface LayoutPosition {
  x: number;
  y: number;
  z: number;
  rotation?: { x: number; y: number; z: number };
  scale?: number;
}

export interface VisualizationConfig {
  // Общие настройки
  itemCount: number;
  containerSize: { width: number; height: number; depth: number };
  
  // Специфичные для типа
  formation?: CloudFormation;
  objectType?: CosmicObjectType;
  density?: number;
  spread?: number;
  
  // Интерактивность
  allowRotation?: boolean;
  allowZoom?: boolean;
  clickable?: boolean;
  
  // Визуальные эффекты
  showConnections?: boolean;
  connectionStyle?: 'lines' | 'particles' | 'glow';
  glow?: boolean;
  particles?: boolean;
}

// ============================================
// ПРОВАЙДЕР ВИЗУАЛИЗАЦИИ (ИНТЕРФЕЙС)
// ============================================

export interface IVisualizationProvider {
  readonly id: VisualizationProvider;
  readonly name: string;
  readonly description: string;
  readonly category: 'threejs' | 'css3d' | 'd3' | '2d';
  readonly supportsRotation: boolean;
  readonly supportsZoom: boolean;
  
  /**
   * Генерирует позиции для элементов
   */
  calculateLayout(
    items: VisualizationItem[],
    config: VisualizationConfig
  ): Map<string, LayoutPosition>;
  
  /**
   * Возвращает компонент для рендеринга (если нужен специфичный)
   */
  getComponent?(): React.ComponentType<any>;
  
  /**
   * Дополнительная конфигурация по умолчанию
   */
  getDefaultConfig(): Partial<VisualizationConfig>;
}

// ============================================
// ПРОВАЙДЕР: THREE.JS PLANETS (ТЕКУЩИЙ)
// ============================================

export class ThreeJSPlanetsProvider implements IVisualizationProvider {
  readonly id = VisualizationProvider.THREEJS_PLANETS;
  readonly name = 'Cosmic Planets';
  readonly description = 'Планеты вращающиеся вокруг центральной звезды';
  readonly category = 'threejs' as const;
  readonly supportsRotation = true;
  readonly supportsZoom = true;
  
  calculateLayout(items: VisualizationItem[], config: VisualizationConfig): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    const radius = 400;
    const layers = Math.ceil(Math.sqrt(items.length));
    
    items.forEach((item, index) => {
      const layer = Math.floor(index / 12);
      const angleInLayer = (index % 12) * (Math.PI * 2 / 12);
      const layerRadius = radius + layer * 150;
      
      positions.set(item.id, {
        x: Math.cos(angleInLayer) * layerRadius,
        y: (Math.random() - 0.5) * 200,
        z: Math.sin(angleInLayer) * layerRadius,
        scale: 1 + Math.random() * 0.5
      });
    });
    
    return positions;
  }
  
  getDefaultConfig(): Partial<VisualizationConfig> {
    return {
      formation: CloudFormation.SOLAR_SYSTEM,
      objectType: CosmicObjectType.ROCKY_PLANET,
      allowRotation: true,
      allowZoom: true,
      glow: true,
      showConnections: false
    };
  }
}

// ============================================
// ПРОВАЙДЕР: THREE.JS GALAXY
// ============================================

export class ThreeJSGalaxyProvider implements IVisualizationProvider {
  readonly id = VisualizationProvider.THREEJS_GALAXY;
  readonly name = 'Spiral Galaxy';
  readonly description = 'Спиральная галактика со звездами';
  readonly category = 'threejs' as const;
  readonly supportsRotation = true;
  readonly supportsZoom = true;
  
  calculateLayout(items: VisualizationItem[], config: VisualizationConfig): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    const arms = 3; // Количество рукавов галактики
    const spread = 500;
    
    items.forEach((item, index) => {
      const armIndex = index % arms;
      const distanceFromCenter = (index / items.length) * spread;
      const angle = (index / items.length) * Math.PI * 8 + (armIndex * Math.PI * 2 / arms);
      
      positions.set(item.id, {
        x: Math.cos(angle) * distanceFromCenter,
        y: (Math.random() - 0.5) * 50 * (distanceFromCenter / spread),
        z: Math.sin(angle) * distanceFromCenter,
        scale: 0.5 + Math.random() * 0.5
      });
    });
    
    return positions;
  }
  
  getDefaultConfig(): Partial<VisualizationConfig> {
    return {
      formation: CloudFormation.SPIRAL_GALAXY,
      objectType: CosmicObjectType.STAR,
      allowRotation: true,
      glow: true,
      particles: true
    };
  }
}

// ============================================
// ПРОВАЙДЕР: THREE.JS NEBULA
// ============================================

export class ThreeJSNebulaProvider implements IVisualizationProvider {
  readonly id = VisualizationProvider.THREEJS_NEBULA;
  readonly name = 'Nebula Cloud';
  readonly description = 'Туманность с частицами';
  readonly category = 'threejs' as const;
  readonly supportsRotation = true;
  readonly supportsZoom = true;
  
  calculateLayout(items: VisualizationItem[], config: VisualizationConfig): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    const spread = 600;
    
    items.forEach((item, index) => {
      // Gaussian distribution для эффекта туманности
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = spread * Math.pow(Math.random(), 0.5); // Концентрация в центре
      
      positions.set(item.id, {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        scale: 0.3 + Math.random() * 0.7
      });
    });
    
    return positions;
  }
  
  getDefaultConfig(): Partial<VisualizationConfig> {
    return {
      formation: CloudFormation.NEBULA_CLOUD,
      objectType: CosmicObjectType.NEBULA,
      allowRotation: true,
      glow: true,
      particles: true,
      density: 1.5
    };
  }
}

// ============================================
// ПРОВАЙДЕР: CSS3D HELIX
// ============================================

export class CSS3DHelixProvider implements IVisualizationProvider {
  readonly id = VisualizationProvider.CSS3D_HELIX;
  readonly name = 'DNA Helix';
  readonly description = 'Спираль ДНК с двойной спиралью';
  readonly category = 'css3d' as const;
  readonly supportsRotation = true;
  readonly supportsZoom = true;
  
  calculateLayout(items: VisualizationItem[], config: VisualizationConfig): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    const radius = 200;
    const height = 800;
    const turns = 3; // Количество витков
    
    items.forEach((item, index) => {
      const t = index / items.length;
      const angle = t * Math.PI * 2 * turns;
      
      // Двойная спираль - четные на одну, нечетные на другую
      const helix = index % 2 === 0 ? 0 : Math.PI;
      
      positions.set(item.id, {
        x: Math.cos(angle + helix) * radius,
        y: t * height - height / 2,
        z: Math.sin(angle + helix) * radius,
        scale: 1.0,
        rotation: {
          x: 0,
          y: angle,
          z: 0
        }
      });
    });
    
    return positions;
  }
  
  getDefaultConfig(): Partial<VisualizationConfig> {
    return {
      formation: CloudFormation.HELIX,
      allowRotation: true,
      clickable: true,
      glow: false
    };
  }
}

// ============================================
// ПРОВАЙДЕР: CSS3D CLOUD (ТЕКУЩИЙ)
// ============================================

export class CSS3DCloudProvider implements IVisualizationProvider {
  readonly id = VisualizationProvider.CSS3D_CLOUD;
  readonly name = 'Classic Tag Cloud';
  readonly description = 'Классическое 3D облако тегов на CSS';
  readonly category = 'css3d' as const;
  readonly supportsRotation = true;
  readonly supportsZoom = true;
  
  calculateLayout(items: VisualizationItem[], config: VisualizationConfig): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    const radius = 400;
    
    items.forEach((item, index) => {
      const phi = Math.acos(-1 + (2 * index) / items.length);
      const theta = Math.sqrt(items.length * Math.PI) * phi;
      
      positions.set(item.id, {
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        scale: 1
      });
    });
    
    return positions;
  }
  
  getDefaultConfig(): Partial<VisualizationConfig> {
    return {
      formation: CloudFormation.SPHERE,
      allowRotation: true,
      clickable: true
    };
  }
}

// ============================================
// ПРОВАЙДЕР: D3 FORCE GRAPH
// ============================================

export class D3ForceProvider implements IVisualizationProvider {
  readonly id = VisualizationProvider.D3_FORCE;
  readonly name = 'Force Graph';
  readonly description = 'Граф связей между станциями';
  readonly category = 'd3' as const;
  readonly supportsRotation = false;
  readonly supportsZoom = true;
  
  calculateLayout(items: VisualizationItem[], config: VisualizationConfig): Map<string, LayoutPosition> {
    // Упрощенная симуляция force-directed
    const positions = new Map<string, LayoutPosition>();
    const spread = 400;
    
    items.forEach((item, index) => {
      positions.set(item.id, {
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: 0 // 2D граф
      });
    });
    
    return positions;
  }
  
  getDefaultConfig(): Partial<VisualizationConfig> {
    return {
      showConnections: true,
      connectionStyle: 'lines',
      clickable: true
    };
  }
}

// ============================================
// REGISTRY ПРОВАЙДЕРОВ
// ============================================

class VisualizationRegistry {
  private providers = new Map<VisualizationProvider, IVisualizationProvider>();
  
  constructor() {
    // Регистрация всех провайдеров
    this.register(new ThreeJSPlanetsProvider());
    this.register(new ThreeJSGalaxyProvider());
    this.register(new ThreeJSNebulaProvider());
    this.register(new CSS3DCloudProvider());
    this.register(new CSS3DHelixProvider());
    this.register(new D3ForceProvider());
  }
  
  register(provider: IVisualizationProvider): void {
    this.providers.set(provider.id, provider);
  }
  
  get(id: VisualizationProvider): IVisualizationProvider | undefined {
    return this.providers.get(id);
  }
  
  getAll(): IVisualizationProvider[] {
    return Array.from(this.providers.values());
  }
  
  getAllByCategory(category: 'threejs' | 'css3d' | 'd3' | '2d'): IVisualizationProvider[] {
    return this.getAll().filter(p => p.category === category);
  }
}

// Singleton instance
export const visualizationRegistry = new VisualizationRegistry();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Получить провайдер по ID
 */
export function getVisualizationProvider(id: VisualizationProvider): IVisualizationProvider {
  const provider = visualizationRegistry.get(id);
  if (!provider) {
    console.warn(`Provider ${id} not found, falling back to THREEJS_PLANETS`);
    return visualizationRegistry.get(VisualizationProvider.THREEJS_PLANETS)!;
  }
  return provider;
}

/**
 * Получить все доступные провайдеры
 */
export function getAllVisualizationProviders(): IVisualizationProvider[] {
  return visualizationRegistry.getAll();
}

/**
 * Сгенерировать layout для items с использованием провайдера
 */
export function generateVisualizationLayout(
  providerId: VisualizationProvider,
  items: VisualizationItem[],
  customConfig?: Partial<VisualizationConfig>
): Map<string, LayoutPosition> {
  const provider = getVisualizationProvider(providerId);
  const defaultConfig = provider.getDefaultConfig();
  
  const config: VisualizationConfig = {
    itemCount: items.length,
    containerSize: { width: 1920, height: 1080, depth: 1000 },
    ...defaultConfig,
    ...customConfig
  };
  
  return provider.calculateLayout(items, config);
}
