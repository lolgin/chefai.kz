/**
 * cosmicTypes.ts
 * 
 * Типы космических объектов для визуализации тегов
 */

export enum CosmicObjectType {
  // Звезды
  STAR = 'star',
  RED_GIANT = 'red-giant',
  WHITE_DWARF = 'white-dwarf',
  NEUTRON_STAR = 'neutron-star',
  
  // Планеты
  ROCKY_PLANET = 'rocky-planet',
  GAS_GIANT = 'gas-giant',
  ICE_GIANT = 'ice-giant',
  
  // Экзотика
  BLACK_HOLE = 'black-hole',
  MAGNETAR = 'magnetar',
  PULSAR = 'pulsar',
  QUASAR = 'quasar',
  
  // Туманности
  NEBULA = 'nebula',
  SUPERNOVA = 'supernova',
  
  // Малые объекты
  ASTEROID = 'asteroid',
  COMET = 'comet',
  MOON = 'moon'
}

export enum CloudFormation {
  SPHERE = 'sphere',           // Сфера (стандарт)
  SPIRAL_GALAXY = 'spiral',    // Спиральная галактика
  ELLIPTICAL = 'elliptical',   // Эллиптическая галактика
  NEBULA_CLOUD = 'nebula',     // Туманность
  SOLAR_SYSTEM = 'solar',      // Солнечная система
  CLUSTER = 'cluster',         // Звездное скопление
  RING = 'ring',               // Кольцо (как у Сатурна)
  HELIX = 'helix'              // Спираль ДНК
}

export interface CosmicObjectStyle {
  type: CosmicObjectType;
  color: string;
  glow: string;
  size: number;
  animation?: string;
}

// Генерация космического объекта на основе названия
export const generateCosmicObject = (name: string): CosmicObjectStyle => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const types = Object.values(CosmicObjectType);
  const type = types[hash % types.length];
  
  const styles: Record<CosmicObjectType, Partial<CosmicObjectStyle>> = {
    [CosmicObjectType.STAR]: {
      color: '#FFD700',
      glow: '#FFA500',
      animation: 'pulse'
    },
    [CosmicObjectType.RED_GIANT]: {
      color: '#FF4500',
      glow: '#FF6347',
      animation: 'pulse-slow'
    },
    [CosmicObjectType.WHITE_DWARF]: {
      color: '#E0FFFF',
      glow: '#B0E0E6',
      animation: 'shimmer'
    },
    [CosmicObjectType.NEUTRON_STAR]: {
      color: '#87CEEB',
      glow: '#4682B4',
      animation: 'pulse-fast'
    },
    [CosmicObjectType.ROCKY_PLANET]: {
      color: '#8B4513',
      glow: '#A0522D',
      animation: 'rotate'
    },
    [CosmicObjectType.GAS_GIANT]: {
      color: '#FFA07A',
      glow: '#FF7F50',
      animation: 'swirl'
    },
    [CosmicObjectType.ICE_GIANT]: {
      color: '#00CED1',
      glow: '#20B2AA',
      animation: 'shimmer'
    },
    [CosmicObjectType.BLACK_HOLE]: {
      color: '#000000',
      glow: '#9370DB',
      animation: 'vortex'
    },
    [CosmicObjectType.MAGNETAR]: {
      color: '#FF00FF',
      glow: '#FF1493',
      animation: 'magnetic-pulse'
    },
    [CosmicObjectType.PULSAR]: {
      color: '#00FFFF',
      glow: '#00BFFF',
      animation: 'pulse-beam'
    },
    [CosmicObjectType.QUASAR]: {
      color: '#FFD700',
      glow: '#FF00FF',
      animation: 'energy-burst'
    },
    [CosmicObjectType.NEBULA]: {
      color: '#FF69B4',
      glow: '#DA70D6',
      animation: 'nebula-flow'
    },
    [CosmicObjectType.SUPERNOVA]: {
      color: '#FFFFFF',
      glow: '#FFD700',
      animation: 'explosion'
    },
    [CosmicObjectType.ASTEROID]: {
      color: '#696969',
      glow: '#808080',
      animation: 'tumble'
    },
    [CosmicObjectType.COMET]: {
      color: '#F0F8FF',
      glow: '#87CEEB',
      animation: 'trail'
    },
    [CosmicObjectType.MOON]: {
      color: '#C0C0C0',
      glow: '#D3D3D3',
      animation: 'orbit'
    }
  };
  
  return {
    type,
    color: styles[type].color || '#FFFFFF',
    glow: styles[type].glow || '#CCCCCC',
    size: 1,
    animation: styles[type].animation
  };
};
