/**
 * models.ts
 * 
 * Константы для 3D моделей из разных агрегаторов
 * Агрегаторы: Sketchfab, Poly Haven, Ready Player Me, Mixamo
 */

export interface Model3D {
  id: string;
  name: string;
  url: string; // URL к GLB/GLTF файлу
  thumbnail?: string;
  provider: ModelProvider;
  category: ModelCategory;
  scale?: number; // Масштаб по умолчанию
  license?: string;
}

export enum ModelProvider {
  SKETCHFAB = 'sketchfab',
  POLY_HAVEN = 'polyhaven',
  READY_PLAYER_ME = 'rpm',
  MIXAMO = 'mixamo',
  CUSTOM = 'custom'
}

export enum ModelCategory {
  GEOMETRIC = 'geometric', // Геометрические примитивы
  ORGANIC = 'organic', // Органика (растения, животные)
  TECH = 'tech', // Технологии (роботы, механизмы)
  ABSTRACT = 'abstract', // Абстрактные формы
  ARCHITECTURE = 'architecture', // Архитектура
  AVATAR = 'avatar', // Аватары/персонажи
  NATURE = 'nature', // Природа (камни, деревья)
  SPACE = 'space' // Космос (планеты, спутники)
}

/**
 * Встроенные 3D модели (легковесные, примитивы)
 * Начнем с геометрических форм - они быстро загружаются
 */
export const BUILT_IN_MODELS: Model3D[] = [
  // === GEOMETRIC (Геометрия) ===
  {
    id: 'cube',
    name: 'Cube',
    url: 'primitive://cube',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  {
    id: 'sphere',
    name: 'Sphere',
    url: 'primitive://sphere',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  {
    id: 'torus',
    name: 'Torus',
    url: 'primitive://torus',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  {
    id: 'octahedron',
    name: 'Octahedron',
    url: 'primitive://octahedron',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  {
    id: 'dodecahedron',
    name: 'Dodecahedron',
    url: 'primitive://dodecahedron',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  {
    id: 'icosahedron',
    name: 'Icosahedron',
    url: 'primitive://icosahedron',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  {
    id: 'tetrahedron',
    name: 'Tetrahedron',
    url: 'primitive://tetrahedron',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  {
    id: 'cone',
    name: 'Cone',
    url: 'primitive://cone',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  {
    id: 'cylinder',
    name: 'Cylinder',
    url: 'primitive://cylinder',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  {
    id: 'torus_knot',
    name: 'Torus Knot',
    url: 'primitive://torusknot',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.GEOMETRIC,
    scale: 1.0
  },
  
  // === ABSTRACT (Абстрактные формы) ===
  {
    id: 'crystal',
    name: 'Crystal',
    url: 'primitive://crystal',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.ABSTRACT,
    scale: 1.2
  },
  {
    id: 'helix',
    name: 'Helix',
    url: 'primitive://helix',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.ABSTRACT,
    scale: 1.0
  },
  {
    id: 'mobius',
    name: 'Möbius Strip',
    url: 'primitive://mobius',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.ABSTRACT,
    scale: 1.0
  },
  
  // === SPACE (Космос) ===
  {
    id: 'planet_basic',
    name: 'Planet',
    url: 'primitive://planet',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.SPACE,
    scale: 1.5
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'primitive://satellite',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.SPACE,
    scale: 1.0
  },
  {
    id: 'asteroid',
    name: 'Asteroid',
    url: 'primitive://asteroid',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.SPACE,
    scale: 0.8
  },
  
  // === TECH (Технологии) ===
  {
    id: 'chip',
    name: 'Chip',
    url: 'primitive://chip',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.TECH,
    scale: 1.0
  },
  {
    id: 'circuit',
    name: 'Circuit',
    url: 'primitive://circuit',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.TECH,
    scale: 1.0
  },
  {
    id: 'gear',
    name: 'Gear',
    url: 'primitive://gear',
    provider: ModelProvider.CUSTOM,
    category: ModelCategory.TECH,
    scale: 1.0
  }
];

/**
 * Категории для фильтрации
 */
export const MODEL_CATEGORIES = [
  { id: ModelCategory.GEOMETRIC, name: 'Geometric', icon: '📐' },
  { id: ModelCategory.ABSTRACT, name: 'Abstract', icon: '🌀' },
  { id: ModelCategory.SPACE, name: 'Space', icon: '🪐' },
  { id: ModelCategory.TECH, name: 'Tech', icon: '⚙️' },
  { id: ModelCategory.ORGANIC, name: 'Organic', icon: '🌿' },
  { id: ModelCategory.NATURE, name: 'Nature', icon: '🏔️' },
  { id: ModelCategory.ARCHITECTURE, name: 'Architecture', icon: '🏛️' },
  { id: ModelCategory.AVATAR, name: 'Avatar', icon: '👤' }
];

/**
 * Провайдеры 3D моделей (для будущего расширения)
 */
export const MODEL_PROVIDERS = [
  { id: ModelProvider.CUSTOM, name: 'Built-in', url: '' },
  { id: ModelProvider.SKETCHFAB, name: 'Sketchfab', url: 'https://sketchfab.com' },
  { id: ModelProvider.POLY_HAVEN, name: 'Poly Haven', url: 'https://polyhaven.com' },
  { id: ModelProvider.READY_PLAYER_ME, name: 'Ready Player Me', url: 'https://readyplayer.me' },
  { id: ModelProvider.MIXAMO, name: 'Mixamo', url: 'https://mixamo.com' }
];
