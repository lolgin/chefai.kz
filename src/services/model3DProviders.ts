/**
 * 3D Model Providers Service
 * Fetches 3D models (.glb/.gltf) from various APIs based on tags
 */

export interface Model3D {
  id: string;
  name: string;
  url: string; // Direct link to .glb/.gltf file
  thumbnailUrl?: string;
  provider: Model3DProvider;
  license?: string;
  author?: string;
}

export enum Model3DProvider {
  SKETCHFAB = 'sketchfab',
  POLY_PIZZA = 'poly-pizza',
  TURBOSQUID_FREE = 'turbosquid-free',
  FALLBACK = 'fallback' // Default geometric shapes
}

/**
 * Base provider interface
 */
interface IModel3DProvider {
  name: string;
  search(query: string, limit?: number): Promise<Model3D[]>;
}

/**
 * Sketchfab API Provider (free models only)
 */
class SketchfabProvider implements IModel3DProvider {
  name = 'Sketchfab';
  private apiUrl = 'https://api.sketchfab.com/v3/models';

  async search(query: string, limit = 5): Promise<Model3D[]> {
    try {
      // Search for downloadable free models
      const params = new URLSearchParams({
        q: query,
        downloadable: 'true',
        license: 'cc-by', // Creative Commons
        count: limit.toString()
      });

      const response = await fetch(`${this.apiUrl}?${params}`);
      if (!response.ok) return [];

      const data = await response.json();
      
      return data.results?.map((item: any) => ({
        id: item.uid,
        name: item.name,
        url: `https://sketchfab.com/models/${item.uid}/download`, // Download endpoint
        thumbnailUrl: item.thumbnails?.images?.[0]?.url,
        provider: Model3DProvider.SKETCHFAB,
        license: item.license?.label,
        author: item.user?.displayName
      })) || [];
    } catch (error) {
      console.warn('Sketchfab search failed:', error);
      return [];
    }
  }
}

/**
 * Poly Pizza Provider (Google Poly alternative, free models)
 */
class PolyPizzaProvider implements IModel3DProvider {
  name = 'Poly Pizza';
  private apiUrl = 'https://poly.pizza/api/v1/models';

  async search(query: string, limit = 5): Promise<Model3D[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });

      const response = await fetch(`${this.apiUrl}?${params}`);
      if (!response.ok) return [];

      const data = await response.json();
      
      return data.models?.map((item: any) => ({
        id: item.id,
        name: item.title,
        url: item.formats?.find((f: any) => f.format === 'GLTF2')?.url || item.url,
        thumbnailUrl: item.thumbnail,
        provider: Model3DProvider.POLY_PIZZA,
        license: 'CC-BY',
        author: item.author
      })) || [];
    } catch (error) {
      console.warn('Poly Pizza search failed:', error);
      return [];
    }
  }
}

/**
 * Fallback provider - generates geometric primitives
 */
class FallbackProvider implements IModel3DProvider {
  name = 'Fallback';

  async search(query: string, limit = 5): Promise<Model3D[]> {
    // Map keywords to geometric shapes
    const shapes: Record<string, string> = {
      rock: 'sphere',
      jazz: 'torus',
      classical: 'cone',
      electronic: 'box',
      pop: 'cylinder',
      default: 'sphere'
    };

    const shape = shapes[query.toLowerCase()] || shapes.default;

    return [{
      id: `fallback-${shape}`,
      name: `${query} (Geometric)`,
      url: `primitive://${shape}`, // Special protocol for Three.js primitives
      provider: Model3DProvider.FALLBACK
    }];
  }
}

/**
 * Tag to 3D Model Mapper
 */
export class Model3DMapper {
  private providers: IModel3DProvider[];
  private cache: Map<string, Model3D[]> = new Map();

  constructor() {
    this.providers = [
      new PolyPizzaProvider(),   // Try free API first
      new SketchfabProvider(),   // Then Sketchfab
      new FallbackProvider()     // Always works
    ];
  }

  /**
   * Search all providers for a tag keyword
   */
  async findModelsForTag(tag: string): Promise<Model3D[]> {
    // Check cache first
    if (this.cache.has(tag)) {
      return this.cache.get(tag)!;
    }

    const results: Model3D[] = [];

    // Try providers in order
    for (const provider of this.providers) {
      try {
        const models = await provider.search(tag, 3);
        results.push(...models);
        
        // If we got real models (not fallback), cache and return
        if (models.length > 0 && models[0].provider !== Model3DProvider.FALLBACK) {
          this.cache.set(tag, results);
          return results;
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
      }
    }

    // Cache even if only fallback
    this.cache.set(tag, results);
    return results;
  }

  /**
   * Get single best model for a tag
   */
  async getBestModelForTag(tag: string): Promise<Model3D | null> {
    const models = await this.findModelsForTag(tag);
    return models[0] || null;
  }

  /**
   * Preload models for multiple tags
   */
  async preloadTags(tags: string[]): Promise<void> {
    await Promise.all(tags.map(tag => this.findModelsForTag(tag)));
  }
}

// Singleton instance
export const model3DMapper = new Model3DMapper();
