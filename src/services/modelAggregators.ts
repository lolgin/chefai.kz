/**
 * modelAggregators.ts
 * 
 * Агрегаторы 3D моделей из внешних источников
 * Sketchfab, Poly Haven, TurboSquid, CGTrader и др.
 */

import { Model3D, ModelProvider, ModelCategory } from '../constants/models';

interface AggregatorConfig {
  id: ModelProvider;
  name: string;
  apiUrl?: string;
  apiKey?: string;
  enabled: boolean;
  searchParams?: Record<string, any>;
}

interface SearchOptions {
  query: string;
  category?: ModelCategory;
  limit?: number;
  maxPolyCount?: number;
  animated?: boolean;
  rigged?: boolean;
  pbr?: boolean; // PBR materials
  license?: 'free' | 'commercial' | 'any';
}

/**
 * Базовый класс агрегатора
 */
abstract class ModelAggregator {
  constructor(protected config: AggregatorConfig) {}
  
  abstract search(options: SearchOptions): Promise<Model3D[]>;
  abstract getModel(id: string): Promise<Model3D>;
  
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

/**
 * Sketchfab API Aggregator
 * https://docs.sketchfab.com/data-api/v3/index.html
 */
class SketchfabAggregator extends ModelAggregator {
  private readonly BASE_URL = 'https://api.sketchfab.com/v3';
  
  async search(options: SearchOptions): Promise<Model3D[]> {
    if (!this.config.apiKey) {
      console.warn('Sketchfab API key not configured');
      return [];
    }
    
    try {
      const params = new URLSearchParams({
        q: options.query,
        type: 'models',
        downloadable: options.license === 'free' ? 'true' : 'false',
        count: String(options.limit || 10),
        animated: String(options.animated || false),
        rigged: String(options.rigged || false)
      });
      
      const response = await fetch(`${this.BASE_URL}/search?${params}`, {
        headers: {
          'Authorization': `Token ${this.config.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Sketchfab API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.results.map((item: any) => ({
        id: item.uid,
        name: item.name,
        url: item.viewerUrl, // URL для встраивания
        thumbnail: item.thumbnails?.images?.[0]?.url,
        provider: ModelProvider.SKETCHFAB,
        category: this.mapCategory(item.categories?.[0]?.name),
        scale: 1.0,
        license: item.license?.label
      }));
    } catch (error) {
      console.error('Sketchfab search error:', error);
      return [];
    }
  }
  
  async getModel(id: string): Promise<Model3D> {
    const response = await fetch(`${this.BASE_URL}/models/${id}`, {
      headers: {
        'Authorization': `Token ${this.config.apiKey}`
      }
    });
    
    const data = await response.json();
    
    return {
      id: data.uid,
      name: data.name,
      url: data.viewerUrl,
      thumbnail: data.thumbnails?.images?.[0]?.url,
      provider: ModelProvider.SKETCHFAB,
      category: this.mapCategory(data.categories?.[0]?.name),
      scale: 1.0,
      license: data.license?.label
    };
  }
  
  private mapCategory(categoryName?: string): ModelCategory {
    if (!categoryName) return ModelCategory.GEOMETRIC;
    
    const lower = categoryName.toLowerCase();
    if (lower.includes('space') || lower.includes('planet')) return ModelCategory.SPACE;
    if (lower.includes('tech') || lower.includes('robot')) return ModelCategory.TECH;
    if (lower.includes('nature') || lower.includes('plant')) return ModelCategory.NATURE;
    if (lower.includes('abstract')) return ModelCategory.ABSTRACT;
    
    return ModelCategory.GEOMETRIC;
  }
}

/**
 * Poly Haven API Aggregator
 * https://polyhaven.com/
 */
class PolyHavenAggregator extends ModelAggregator {
  private readonly BASE_URL = 'https://api.polyhaven.com';
  
  async search(options: SearchOptions): Promise<Model3D[]> {
    try {
      // Poly Haven использует простой JSON API
      const response = await fetch(`${this.BASE_URL}/assets?type=models`);
      
      if (!response.ok) {
        throw new Error(`Poly Haven API error: ${response.status}`);
      }
      
      const data = await response.json();
      const models: Model3D[] = [];
      
      // Фильтруем по запросу
      const query = options.query.toLowerCase();
      
      for (const [id, modelData] of Object.entries(data)) {
        const model = modelData as any;
        const name = model.name || id;
        
        if (name.toLowerCase().includes(query)) {
          models.push({
            id,
            name,
            url: `https://polyhaven.com/a/${id}`, // Ссылка на страницу модели
            thumbnail: `https://cdn.polyhaven.com/asset_img/thumbs/${id}.png?height=200`,
            provider: ModelProvider.POLY_HAVEN,
            category: ModelCategory.NATURE,
            scale: 1.0,
            license: 'CC0 (Public Domain)'
          });
          
          if (models.length >= (options.limit || 10)) break;
        }
      }
      
      return models;
    } catch (error) {
      console.error('Poly Haven search error:', error);
      return [];
    }
  }
  
  async getModel(id: string): Promise<Model3D> {
    const response = await fetch(`${this.BASE_URL}/assets/${id}`);
    const data = await response.json();
    
    return {
      id,
      name: data.name || id,
      url: `https://polyhaven.com/a/${id}`,
      thumbnail: `https://cdn.polyhaven.com/asset_img/thumbs/${id}.png?height=200`,
      provider: ModelProvider.POLY_HAVEN,
      category: ModelCategory.NATURE,
      scale: 1.0,
      license: 'CC0 (Public Domain)'
    };
  }
}

/**
 * Custom Models Aggregator (локальные/пользовательские модели)
 */
class CustomModelsAggregator extends ModelAggregator {
  private customModels: Model3D[] = [];
  
  async search(options: SearchOptions): Promise<Model3D[]> {
    const query = options.query.toLowerCase();
    return this.customModels.filter(m => 
      m.name.toLowerCase().includes(query)
    ).slice(0, options.limit || 10);
  }
  
  async getModel(id: string): Promise<Model3D> {
    const model = this.customModels.find(m => m.id === id);
    if (!model) throw new Error(`Custom model not found: ${id}`);
    return model;
  }
  
  addCustomModel(model: Model3D) {
    this.customModels.push(model);
  }
  
  removeCustomModel(id: string) {
    this.customModels = this.customModels.filter(m => m.id !== id);
  }
}

/**
 * Менеджер всех агрегаторов
 */
export class ModelAggregatorManager {
  private aggregators: Map<ModelProvider, ModelAggregator> = new Map();
  
  constructor() {
    this.initAggregators();
  }
  
  private initAggregators() {
    // Sketchfab
    this.aggregators.set(
      ModelProvider.SKETCHFAB,
      new SketchfabAggregator({
        id: ModelProvider.SKETCHFAB,
        name: 'Sketchfab',
        apiUrl: 'https://api.sketchfab.com/v3',
        apiKey: process.env.SKETCHFAB_API_KEY,
        enabled: !!process.env.SKETCHFAB_API_KEY
      })
    );
    
    // Poly Haven
    this.aggregators.set(
      ModelProvider.POLY_HAVEN,
      new PolyHavenAggregator({
        id: ModelProvider.POLY_HAVEN,
        name: 'Poly Haven',
        apiUrl: 'https://api.polyhaven.com',
        enabled: true // Не требует API ключа
      })
    );
    
    // Custom Models
    this.aggregators.set(
      ModelProvider.CUSTOM,
      new CustomModelsAggregator({
        id: ModelProvider.CUSTOM,
        name: 'Custom Models',
        enabled: true
      })
    );
  }
  
  /**
   * Поиск моделей во всех включенных агрегаторах
   */
  async searchAll(options: SearchOptions): Promise<Model3D[]> {
    const results: Model3D[] = [];
    
    const searches = Array.from(this.aggregators.values())
      .filter(agg => agg.isEnabled())
      .map(agg => agg.search(options).catch(err => {
        console.error('Aggregator search error:', err);
        return [];
      }));
    
    const allResults = await Promise.all(searches);
    
    for (const result of allResults) {
      results.push(...result);
    }
    
    return results;
  }
  
  /**
   * Поиск в конкретном агрегаторе
   */
  async search(provider: ModelProvider, options: SearchOptions): Promise<Model3D[]> {
    const aggregator = this.aggregators.get(provider);
    if (!aggregator || !aggregator.isEnabled()) {
      console.warn(`Aggregator ${provider} not available`);
      return [];
    }
    
    return aggregator.search(options);
  }
  
  /**
   * Получить конкретную модель
   */
  async getModel(provider: ModelProvider, id: string): Promise<Model3D | null> {
    const aggregator = this.aggregators.get(provider);
    if (!aggregator) return null;
    
    try {
      return await aggregator.getModel(id);
    } catch (error) {
      console.error('Get model error:', error);
      return null;
    }
  }
  
  /**
   * Добавить пользовательскую модель
   */
  addCustomModel(model: Model3D) {
    const customAgg = this.aggregators.get(ModelProvider.CUSTOM) as CustomModelsAggregator;
    if (customAgg) {
      customAgg.addCustomModel(model);
    }
  }
}

// Singleton экземпляр
export const modelAggregatorManager = new ModelAggregatorManager();
