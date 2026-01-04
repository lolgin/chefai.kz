/**
 * cosmicModelProviders.ts
 * 
 * Универсальная система для работы с несколькими провайдерами 3D моделей
 * Поддерживает: Poly Haven, Sketchfab, NASA, Procedural Generation
 */

export enum CosmicObjectType {
  STAR = 'star',
  PLANET = 'planet',
  GAS_GIANT = 'gas_giant',
  ICE_PLANET = 'ice_planet',
  ROCKY_PLANET = 'rocky_planet',
  MOON = 'moon',
  ASTEROID = 'asteroid',
  COMET = 'comet',
  BLACK_HOLE = 'black_hole',
  NEUTRON_STAR = 'neutron_star',
  NEBULA = 'nebula',
  GALAXY = 'galaxy'
}

export interface CosmicModel {
  id: string;
  name: string;
  type: CosmicObjectType;
  provider: ModelProvider;
  modelUrl?: string; // URL к GLTF/GLB модели
  textureUrl?: string; // URL к текстуре
  proceduralConfig?: ProceduralConfig; // Для процедурной генерации
  size: number; // Размер в байтах или относительный размер
  metadata?: {
    color?: string;
    rings?: boolean;
    atmosphere?: boolean;
    glow?: number;
  };
}

export enum ModelProvider {
  POLY_HAVEN = 'poly_haven',
  SKETCHFAB = 'sketchfab',
  NASA = 'nasa',
  PROCEDURAL = 'procedural'
}

export interface ProceduralConfig {
  baseColor: string;
  noiseScale: number;
  atmosphereColor?: string;
  cloudDensity?: number;
  craterDensity?: number;
  rings?: {
    innerRadius: number;
    outerRadius: number;
    color: string;
  };
}

/**
 * Poly Haven Provider
 * API: https://api.polyhaven.com/
 */
class PolyHavenProvider {
  private baseUrl = 'https://api.polyhaven.com';
  private assetCache = new Map<string, CosmicModel>();

  async search(query: string, type: CosmicObjectType): Promise<CosmicModel[]> {
    try {
      // Poly Haven использует категории, маппим типы
      const category = this.mapTypeToCategory(type);
      const response = await fetch(`${this.baseUrl}/assets?type=hdri&category=${category}`);
      const data = await response.json();
      
      return Object.entries(data).slice(0, 10).map(([id, asset]: any) => ({
        id: `polyhaven_${id}`,
        name: asset.name || id,
        type,
        provider: ModelProvider.POLY_HAVEN,
        textureUrl: `https://dl.polyhaven.org/file/ph-assets/Textures/png/2k/${id}_2k.png`,
        size: 500000, // ~500KB
        metadata: {}
      }));
    } catch (error) {
      console.warn('Poly Haven search failed:', error);
      return [];
    }
  }

  private mapTypeToCategory(type: CosmicObjectType): string {
    const mapping: Record<string, string> = {
      [CosmicObjectType.STAR]: 'skies',
      [CosmicObjectType.PLANET]: 'outdoor',
      [CosmicObjectType.NEBULA]: 'skies',
      [CosmicObjectType.ASTEROID]: 'outdoor'
    };
    return mapping[type] || 'outdoor';
  }
}

/**
 * Sketchfab Provider
 * API: https://docs.sketchfab.com/data-api/v3/index.html
 */
class SketchfabProvider {
  private apiKey = 'YOUR_API_KEY'; // Можно получить бесплатно
  private baseUrl = 'https://api.sketchfab.com/v3';

  async search(query: string, type: CosmicObjectType): Promise<CosmicModel[]> {
    try {
      const searchQuery = `${query} ${type} planet space`;
      const response = await fetch(
        `${this.baseUrl}/search?type=models&q=${encodeURIComponent(searchQuery)}&downloadable=true&license=CC-BY-4.0`,
        {
          headers: { 'Authorization': `Token ${this.apiKey}` }
        }
      );
      const data = await response.json();
      
      return data.results.slice(0, 10).map((item: any) => ({
        id: `sketchfab_${item.uid}`,
        name: item.name,
        type,
        provider: ModelProvider.SKETCHFAB,
        modelUrl: item.downloadUrl || item.viewerUrl,
        size: item.faceCount * 100, // Приблизительный размер
        metadata: {}
      }));
    } catch (error) {
      console.warn('Sketchfab search failed:', error);
      return [];
    }
  }
}

/**
 * NASA 3D Resources Provider
 * Страница: https://nasa3d.arc.nasa.gov/
 */
class NASAProvider {
  private baseUrl = 'https://nasa3d.arc.nasa.gov/api';
  private models: Record<string, CosmicModel> = {
    earth: {
      id: 'nasa_earth',
      name: 'Earth',
      type: CosmicObjectType.PLANET,
      provider: ModelProvider.NASA,
      textureUrl: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57752/land_ocean_ice_cloud_2048.jpg',
      size: 2000000,
      metadata: { color: '#0066cc', atmosphere: true }
    },
    mars: {
      id: 'nasa_mars',
      name: 'Mars',
      type: CosmicObjectType.ROCKY_PLANET,
      provider: ModelProvider.NASA,
      textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
      size: 1500000,
      metadata: { color: '#cd5c5c' }
    },
    jupiter: {
      id: 'nasa_jupiter',
      name: 'Jupiter',
      type: CosmicObjectType.GAS_GIANT,
      provider: ModelProvider.NASA,
      textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
      size: 2500000,
      metadata: { color: '#daa520' }
    },
    moon: {
      id: 'nasa_moon',
      name: 'Moon',
      type: CosmicObjectType.MOON,
      provider: ModelProvider.NASA,
      textureUrl: 'https://www.solarsystemscope.com/textures/download/2k_moon.jpg',
      size: 1000000,
      metadata: { color: '#808080' }
    }
  };

  async search(query: string, type: CosmicObjectType): Promise<CosmicModel[]> {
    // NASA имеет фиксированный набор моделей
    return Object.values(this.models).filter(m => m.type === type);
  }

  getModel(name: string): CosmicModel | undefined {
    return this.models[name.toLowerCase()];
  }
}

/**
 * Procedural Generation Provider
 * Генерирует конфигурацию для процедурной генерации через Three.js
 */
class ProceduralProvider {
  async search(query: string, type: CosmicObjectType): Promise<CosmicModel[]> {
    const config = this.generateConfig(query, type);
    return [{
      id: `procedural_${query}_${type}`,
      name: query,
      type,
      provider: ModelProvider.PROCEDURAL,
      proceduralConfig: config,
      size: 0, // Генерируется на лету, нет загрузки
      metadata: {
        color: config.baseColor,
        glow: type === CosmicObjectType.STAR ? 1 : 0
      }
    }];
  }

  private generateConfig(name: string, type: CosmicObjectType): ProceduralConfig {
    // Генерируем уникальную конфигурацию на основе хеша имени
    const hash = this.hashString(name);
    const hue = hash % 360;
    const saturation = 50 + (hash % 50);
    const lightness = 40 + (hash % 30);

    const config: ProceduralConfig = {
      baseColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      noiseScale: 0.5 + (hash % 100) / 200,
    };

    // Специфичные настройки для разных типов
    switch (type) {
      case CosmicObjectType.GAS_GIANT:
        config.atmosphereColor = `hsl(${hue}, 70%, 60%)`;
        config.cloudDensity = 0.7;
        if (hash % 3 === 0) {
          config.rings = {
            innerRadius: 1.5,
            outerRadius: 2.5,
            color: `hsl(${hue + 30}, 40%, 50%)`
          };
        }
        break;
      case CosmicObjectType.ROCKY_PLANET:
        config.craterDensity = 0.3 + (hash % 100) / 300;
        break;
      case CosmicObjectType.ICE_PLANET:
        config.baseColor = `hsl(${180 + (hash % 60)}, 60%, 80%)`;
        config.atmosphereColor = `hsl(${180 + (hash % 60)}, 40%, 90%)`;
        break;
      case CosmicObjectType.STAR:
        const starType = hash % 5;
        const starColors = ['#ffeb3b', '#ff5722', '#03a9f4', '#f44336', '#e1f5fe'];
        config.baseColor = starColors[starType];
        break;
    }

    return config;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

/**
 * Unified Cosmic Model Manager
 * Управляет всеми провайдерами и обеспечивает fallback
 */
export class CosmicModelManager {
  private providers = {
    [ModelProvider.POLY_HAVEN]: new PolyHavenProvider(),
    [ModelProvider.SKETCHFAB]: new SketchfabProvider(),
    [ModelProvider.NASA]: new NASAProvider(),
    [ModelProvider.PROCEDURAL]: new ProceduralProvider()
  };

  private cache = new Map<string, CosmicModel>();
  private preferredProviders: ModelProvider[] = [
    ModelProvider.PROCEDURAL, // Самый быстрый, без загрузки
    ModelProvider.NASA,        // Качественные реальные текстуры
    ModelProvider.POLY_HAVEN,  // Хорошие текстуры
    ModelProvider.SKETCHFAB    // Много моделей, но медленнее
  ];

  /**
   * Получить модель с fallback на другие провайдеры
   */
  async getModel(name: string, type: CosmicObjectType): Promise<CosmicModel> {
    const cacheKey = `${name}_${type}`;
    
    // Проверяем кэш
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Пробуем провайдеры по порядку
    for (const providerType of this.preferredProviders) {
      try {
        const provider = this.providers[providerType];
        const results = await provider.search(name, type);
        
        if (results.length > 0) {
          const model = results[0];
          this.cache.set(cacheKey, model);
          return model;
        }
      } catch (error) {
        console.warn(`Provider ${providerType} failed:`, error);
        continue;
      }
    }

    // Fallback на процедурную генерацию если всё failed
    const procedural = await this.providers[ModelProvider.PROCEDURAL].search(name, type);
    return procedural[0];
  }

  /**
   * Получить модели от всех провайдеров для выбора
   */
  async getAllVariants(name: string, type: CosmicObjectType): Promise<CosmicModel[]> {
    const results = await Promise.allSettled(
      Object.values(this.providers).map(provider => provider.search(name, type))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<CosmicModel[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
  }

  /**
   * Определить тип объекта по имени станции/жанра
   */
  inferType(name: string, genre?: string): CosmicObjectType {
    const lowerName = name.toLowerCase();
    const lowerGenre = (genre || '').toLowerCase();

    // Звезды для популярных/известных станций
    if (lowerName.includes('fm') || lowerName.includes('radio')) {
      return CosmicObjectType.STAR;
    }

    // Жанровый маппинг
    const genreMapping: Record<string, CosmicObjectType> = {
      'electronic': CosmicObjectType.GAS_GIANT,
      'ambient': CosmicObjectType.NEBULA,
      'rock': CosmicObjectType.ROCKY_PLANET,
      'jazz': CosmicObjectType.ICE_PLANET,
      'classical': CosmicObjectType.MOON,
      'metal': CosmicObjectType.ASTEROID,
      'pop': CosmicObjectType.PLANET,
      'techno': CosmicObjectType.BLACK_HOLE
    };

    for (const [key, type] of Object.entries(genreMapping)) {
      if (lowerGenre.includes(key) || lowerName.includes(key)) {
        return type;
      }
    }

    // По умолчанию - планета
    return CosmicObjectType.PLANET;
  }
}

// Singleton instance
export const cosmicModelManager = new CosmicModelManager();
