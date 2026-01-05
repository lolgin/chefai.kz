/**
 * geminiModelService.ts
 * 
 * Gemini AI для умного подбора и настройки 3D моделей
 * Gemini может менять параметры, выбирать провайдеры, настраивать всё
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelCategory, ModelProvider } from '../constants/models';
import { modelAggregatorManager } from './modelAggregators';

interface ModelSelectionRequest {
  context: {
    tagName?: string;
    genre?: string;
    mood?: string;
    tempo?: string;
    provider?: string;
    tags?: string[];
  };
  preferences?: {
    preferredProviders?: ModelProvider[];
    maxPolyCount?: number;
    animated?: boolean;
    style?: 'realistic' | 'low-poly' | 'stylized' | 'abstract';
    colorScheme?: string;
  };
}

interface ModelSelectionResponse {
  modelId: string;
  modelUrl: string;
  provider: ModelProvider;
  category: ModelCategory;
  reasoning: string;
  parameters: {
    scale?: number;
    rotation?: { x: number; y: number; z: number };
    color?: string;
    material?: string;
    animation?: string;
  };
  fallbackModels?: string[];
}

interface GeminiSettings {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  enableSearch?: boolean;
  enableAggregators?: boolean;
  preferredProviders?: ModelProvider[];
}

/**
 * Gemini AI сервис для работы с моделями
 */
export class GeminiModelService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private settings: GeminiSettings = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
    enableSearch: true,
    enableAggregators: true,
    preferredProviders: [ModelProvider.CUSTOM, ModelProvider.POLY_HAVEN]
  };
  
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.initModel();
  }
  
  private initModel() {
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: this.settings.temperature,
        topK: this.settings.topK,
        topP: this.settings.topP,
        maxOutputTokens: this.settings.maxOutputTokens,
        responseMimeType: 'application/json'
      }
    });
  }
  
  /**
   * Обновить настройки Gemini
   */
  updateSettings(newSettings: Partial<GeminiSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.initModel(); // Пересоздаем модель с новыми настройками
    console.log('🤖 Gemini settings updated:', this.settings);
  }
  
  /**
   * Получить текущие настройки
   */
  getSettings(): GeminiSettings {
    return { ...this.settings };
  }
  
  /**
   * Умный подбор модели на основе контекста
   */
  async selectModel(request: ModelSelectionRequest): Promise<ModelSelectionResponse> {
    const prompt = this.buildPrompt(request);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Парсим JSON ответ
      const selection = JSON.parse(text);
      
      // Если включены агрегаторы - ищем модель
      if (this.settings.enableAggregators && selection.searchQuery) {
        const models = await this.searchModels(selection.searchQuery, request.preferences);
        if (models.length > 0) {
          selection.modelUrl = models[0].url;
          selection.provider = models[0].provider;
        }
      }
      
      console.log('🎯 Gemini model selection:', selection);
      return selection;
      
    } catch (error) {
      console.error('Gemini model selection error:', error);
      
      // Fallback к примитивам
      return {
        modelId: 'sphere',
        modelUrl: 'primitive://sphere',
        provider: ModelProvider.CUSTOM,
        category: ModelCategory.GEOMETRIC,
        reasoning: 'Fallback to default sphere due to AI error',
        parameters: { scale: 1.0 },
        fallbackModels: ['cube', 'torus']
      };
    }
  }
  
  /**
   * Построить промпт для Gemini
   */
  private buildPrompt(request: ModelSelectionRequest): string {
    return `You are an AI assistant specialized in selecting 3D models for music visualization.

Context:
- Tag name: ${request.context.tagName || 'Unknown'}
- Genre: ${request.context.genre || 'Unknown'}
- Mood: ${request.context.mood || 'Unknown'}
- Provider: ${request.context.provider || 'Unknown'}
- Tags: ${request.context.tags?.join(', ') || 'None'}

Available Model Categories:
- GEOMETRIC: Basic shapes (cube, sphere, torus, dodecahedron, icosahedron)
- SPACE: Cosmic objects (planet, satellite, asteroid)
- ABSTRACT: Abstract forms (crystal, helix, möbius strip, torus knot)
- TECH: Technology (gear, circuit, chip)
- NATURE: Natural objects (rocks, trees)
- ORGANIC: Organic forms

Available Providers:
${this.settings.preferredProviders?.join(', ') || 'ALL'}

User Preferences:
- Style: ${request.preferences?.style || 'any'}
- Animated: ${request.preferences?.animated || false}
- Max Poly Count: ${request.preferences?.maxPolyCount || 'unlimited'}
- Color Scheme: ${request.preferences?.colorScheme || 'auto'}

Task: Select the most appropriate 3D model and configure it.

Response format (JSON):
{
  "modelId": "string (e.g., 'planet_basic', 'crystal', 'gear')",
  "modelUrl": "string (e.g., 'primitive://planet', or external URL)",
  "provider": "string (CUSTOM, SKETCHFAB, POLY_HAVEN)",
  "category": "string (GEOMETRIC, SPACE, etc.)",
  "reasoning": "string (why this model was chosen)",
  "searchQuery": "string (optional: query for external aggregators)",
  "parameters": {
    "scale": number (0.5-2.0),
    "rotation": {"x": number, "y": number, "z": number},
    "color": "string (hex color)",
    "material": "string (e.g., 'metallic', 'glossy', 'matte')",
    "animation": "string (e.g., 'rotate', 'pulse', 'none')"
  },
  "fallbackModels": ["string", "string"] (alternative model IDs)
}

Rules:
1. Match the model to the music genre/mood
2. Space/cosmic music → SPACE category models
3. Techno/electronic → TECH category models
4. Ambient/chill → ABSTRACT smooth shapes
5. Rock/metal → GEOMETRIC sharp shapes
6. Prioritize providers in order: ${this.settings.preferredProviders?.join(' > ') || 'CUSTOM > POLY_HAVEN'}
7. If searching external aggregators, provide searchQuery
8. Always provide fallback models

Respond with valid JSON only.`;
  }
  
  /**
   * Поиск моделей через агрегаторы
   */
  private async searchModels(query: string, preferences?: ModelSelectionRequest['preferences']) {
    if (!this.settings.enableAggregators) return [];
    
    try {
      const results = await modelAggregatorManager.searchAll({
        query,
        limit: 5,
        maxPolyCount: preferences?.maxPolyCount,
        animated: preferences?.animated,
        license: 'free'
      });
      
      return results;
    } catch (error) {
      console.error('Model search error:', error);
      return [];
    }
  }
  
  /**
   * Запросить у Gemini настройку параметров
   */
  async adjustParameters(
    currentModel: string,
    adjustmentRequest: string
  ): Promise<any> {
    const prompt = `Current 3D model: ${currentModel}

User request: "${adjustmentRequest}"

Available parameters to adjust:
- scale (0.5 - 2.0)
- rotation (x, y, z in degrees)
- color (hex color code)
- material (metallic, glossy, matte, emissive)
- animation (rotate, pulse, bounce, none)

Respond with JSON containing ONLY the parameters that should be changed:
{
  "scale": number,
  "rotation": {"x": number, "y": number, "z": number},
  "color": "string",
  "material": "string",
  "animation": "string",
  "reasoning": "string (explain why these adjustments)"
}

Examples:
- "make it bigger" → {"scale": 1.5}
- "rotate it" → {"animation": "rotate"}
- "make it red" → {"color": "#ff0000"}
- "metallic look" → {"material": "metallic"}

Respond with valid JSON only.`;
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Parameter adjustment error:', error);
      return { reasoning: 'Error adjusting parameters' };
    }
  }
  
  /**
   * Пакетный подбор моделей для множества тегов
   */
  async batchSelectModels(
    tags: Array<{ name: string; genre?: string; provider?: string }>
  ): Promise<Map<string, ModelSelectionResponse>> {
    const results = new Map<string, ModelSelectionResponse>();
    
    // Обрабатываем по 5 тегов за раз для оптимизации
    const batchSize = 5;
    for (let i = 0; i < tags.length; i += batchSize) {
      const batch = tags.slice(i, i + batchSize);
      
      const promises = batch.map(tag =>
        this.selectModel({
          context: {
            tagName: tag.name,
            genre: tag.genre,
            provider: tag.provider
          }
        })
      );
      
      const batchResults = await Promise.all(promises);
      
      batch.forEach((tag, index) => {
        results.set(tag.name, batchResults[index]);
      });
    }
    
    return results;
  }
}

// Singleton instance (ленивая инициализация)
let geminiModelService: GeminiModelService | null = null;

export function getGeminiModelService(): GeminiModelService | null {
  if (!geminiModelService) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('🔍 Checking Gemini API key:', apiKey ? `${apiKey.slice(0, 10)}...` : 'NOT FOUND');
    
    if (apiKey) {
      try {
        geminiModelService = new GeminiModelService(apiKey);
        console.log('🤖 Gemini Model Service initialized successfully');
        console.log('📊 Settings:', geminiModelService.getSettings());
      } catch (error) {
        console.error('❌ Failed to initialize Gemini Model Service:', error);
      }
    } else {
      console.warn('⚠️ Gemini API key not found - AI model selection disabled');
      console.warn('💡 Set VITE_GEMINI_API_KEY in .env.local file');
    }
  }
  return geminiModelService;
}

export function resetGeminiModelService() {
  geminiModelService = null;
}
