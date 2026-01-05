/**
 * modelMatcher.ts
 * 
 * Умный маппинг контекста тега → 3D модели
 * Анализирует название, жанр, провайдер и подбирает подходящую модель
 * Поддержка Gemini AI для интеллектуального подбора
 */

import { BUILT_IN_MODELS, ModelCategory } from '../constants/models';
import { getGeminiModelService } from './geminiModelService';

interface TagContext {
  name?: string;
  genre?: string;
  provider?: string;
  url?: string;
  tags?: string[];
  bitrate?: number;
  mood?: string;
  tempo?: string;
}

// Настройки AI подбора
let useAI = true; // Включить/выключить Gemini
let aiCache = new Map<string, string>(); // Кеш AI результатов

/**
 * Ключевые слова для категорий моделей
 */
const CATEGORY_KEYWORDS: Record<ModelCategory, string[]> = {
  [ModelCategory.GEOMETRIC]: ['minimal', 'basic', 'simple', 'clean', 'geometric', 'abstract'],
  [ModelCategory.SPACE]: ['space', 'cosmic', 'galaxy', 'star', 'planet', 'orbit', 'astro', 'nebula', 'void', 'universe'],
  [ModelCategory.ABSTRACT]: ['abstract', 'experimental', 'avant', 'ambient', 'ethereal', 'dream', 'psychedelic', 'trip'],
  [ModelCategory.TECH]: ['tech', 'techno', 'electro', 'cyber', 'digital', 'synth', 'electronic', 'machine', 'robot', 'circuit'],
  [ModelCategory.ORGANIC]: ['nature', 'organic', 'forest', 'ocean', 'wind', 'earth', 'natural'],
  [ModelCategory.NATURE]: ['mountain', 'rock', 'stone', 'tree', 'plant', 'flower', 'leaf'],
  [ModelCategory.ARCHITECTURE]: ['urban', 'city', 'building', 'structure', 'architecture'],
  [ModelCategory.AVATAR]: ['human', 'person', 'avatar', 'character', 'face']
};

/**
 * Специфичные маппинги: ключевое слово → ID модели
 */
const SPECIFIC_MAPPINGS: Record<string, string> = {
  // Space/Cosmic
  'space': 'planet_basic',
  'cosmic': 'planet_basic',
  'orbit': 'satellite',
  'astro': 'asteroid',
  'nebula': 'helix',
  
  // Tech
  'techno': 'gear',
  'electro': 'circuit',
  'synth': 'chip',
  'cyber': 'circuit',
  'digital': 'chip',
  
  // Abstract
  'ambient': 'helix',
  'chill': 'torus',
  'relax': 'torus',
  'dream': 'mobius',
  'psychedelic': 'torus_knot',
  'trip': 'crystal',
  
  // Geometric
  'minimal': 'cube',
  'clean': 'sphere',
  'basic': 'sphere',
  
  // Жанры SomaFM
  'groovesalad': 'torus',
  'dronezone': 'helix',
  'defconradio': 'chip',
  'lush': 'crystal',
  'secretagent': 'gear',
  'spacestation': 'satellite',
  'thistle': 'torus_knot',
  'beatblender': 'gear',
  'bootliquor': 'cylinder',
  'deepspaceone': 'planet_basic',
  'doomed': 'asteroid',
  'dubstep': 'octahedron',
  'folkfwd': 'cone',
  'illstreet': 'dodecahedron',
  'indiepop': 'icosahedron',
  'metaldetector': 'gear',
  'missioncontrol': 'satellite',
  'poptron': 'torus_knot',
  'reggae': 'helix',
  'scanner': 'circuit',
  'sonicuniverse': 'planet_basic',
  'suburbsofgoa': 'crystal',
  'thetrip': 'mobius',
  'u80s': 'cube',
  'bagel': 'torus'
};

/**
 * Провайдеры → дефолтные модели
 */
const PROVIDER_DEFAULTS: Record<string, string> = {
  'somafm': 'torus',
  'nightride': 'satellite',
  'generative-ai': 'crystal',
  'radioparadise': 'planet_basic',
  'custom': 'sphere'
};

/**
 * Анализирует контекст тега и возвращает подходящую модель
 * Использует Gemini AI если доступна, иначе fallback к правилам
 */
export async function matchModelToContext(context: TagContext | string): Promise<string> {
  // Если передана строка - оборачиваем в объект
  const ctx: TagContext = typeof context === 'string' 
    ? { name: context } 
    : context;
  
  console.log('🔍 CONTEXT INSPECTION:', {
    name: ctx.name,
    genre: ctx.genre,
    provider: ctx.provider,
    tags: ctx.tags,
    useAI,
    cacheSize: aiCache.size
  });
  
  // Пробуем использовать Gemini AI
  if (useAI) {
    const gemini = getGeminiModelService();
    console.log('🤖 Gemini service available:', !!gemini);
    
    if (gemini) {
      const cacheKey = JSON.stringify(ctx);
      
      // Проверяем кеш
      if (aiCache.has(cacheKey)) {
        const cached = aiCache.get(cacheKey)!;
        console.log('💾 Using cached model:', cached);
        return cached;
      }
      
      try {
        console.log('🚀 Requesting AI model selection...');
        const selection = await gemini.selectModel({
          context: {
            tagName: ctx.name,
            genre: ctx.genre,
            mood: ctx.mood,
            tempo: ctx.tempo,
            provider: ctx.provider,
            tags: ctx.tags
          }
        });
        
        const modelUrl = selection.modelUrl;
        aiCache.set(cacheKey, modelUrl);
        console.log(`✅ AI selected model: ${modelUrl}`);
        console.log(`💡 Reasoning: ${selection.reasoning}`);
        return modelUrl;
      } catch (error) {
        console.warn('⚠️ AI model selection failed, falling back to rules:', error);
      }
    } else {
      console.log('⏭️ Gemini not available, using rule-based matching');
    }
  } else {
    console.log('⏸️ AI disabled, using rule-based matching');
  }
  
  // Fallback к rule-based подбору
  return matchModelByRules(ctx);
}

/**
 * Rule-based подбор модели (fallback)
 */
function matchModelByRules(ctx: TagContext): string {
  // Собираем весь текст для анализа
  const textToAnalyze = [
    ctx.name,
    ctx.genre,
    ctx.provider,
    ...(ctx.tags || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  
  // 1. Проверяем специфичные маппинги (высший приоритет)
  for (const [keyword, modelId] of Object.entries(SPECIFIC_MAPPINGS)) {
    if (textToAnalyze.includes(keyword)) {
      console.log(`🎯 Model match (specific): "${keyword}" → ${modelId}`);
      return `primitive://${modelId}`;
    }
  }
  
  // 2. Проверяем категории
  const categoryScores: Record<ModelCategory, number> = {
    [ModelCategory.GEOMETRIC]: 0,
    [ModelCategory.SPACE]: 0,
    [ModelCategory.ABSTRACT]: 0,
    [ModelCategory.TECH]: 0,
    [ModelCategory.ORGANIC]: 0,
    [ModelCategory.NATURE]: 0,
    [ModelCategory.ARCHITECTURE]: 0,
    [ModelCategory.AVATAR]: 0
  };
  
  // Подсчитываем совпадения по категориям
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    keywords.forEach(keyword => {
      if (textToAnalyze.includes(keyword)) {
        categoryScores[category as ModelCategory]++;
      }
    });
  }
  
  // Находим категорию с максимальным скором
  const maxScore = Math.max(...Object.values(categoryScores));
  if (maxScore > 0) {
    const winningCategory = Object.entries(categoryScores)
      .find(([_, score]) => score === maxScore)?.[0] as ModelCategory;
    
    // Выбираем случайную модель из категории
    const categoryModels = BUILT_IN_MODELS.filter(m => m.category === winningCategory);
    if (categoryModels.length > 0) {
      const randomModel = categoryModels[Math.floor(Math.random() * categoryModels.length)];
      console.log(`🎯 Model match (category): ${winningCategory} → ${randomModel.id}`);
      return randomModel.url;
    }
  }
  
  // 3. Проверяем провайдер
  if (ctx.provider) {
    const providerLower = ctx.provider.toLowerCase();
    const defaultModel = PROVIDER_DEFAULTS[providerLower];
    if (defaultModel) {
      console.log(`🎯 Model match (provider): ${ctx.provider} → ${defaultModel}`);
      return `primitive://${defaultModel}`;
    }
  }
  
  // 4. Дефолт - сфера
  console.log('🎯 Model match (default): sphere');
  return 'primitive://sphere';
}

/**
 * Кеш загруженных моделей (для оптимизации)
 */
const modelCache = new Map<string, string>();

/**
 * Получить URL модели с кешированием (синхронная версия для совместимости)
 */
export function getCachedModelUrl(context: TagContext | string): string {
  const cacheKey = typeof context === 'string' 
    ? context 
    : JSON.stringify(context);
  
  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey)!;
  }
  
  // Для синхронного использования - используем только rule-based
  const ctx: TagContext = typeof context === 'string' 
    ? { name: context } 
    : context;
  
  const url = matchModelByRules(ctx);
  modelCache.set(cacheKey, url);
  return url;
}

/**
 * Асинхронная версия с поддержкой AI
 */
export async function getCachedModelUrlAsync(context: TagContext | string): Promise<string> {
  const cacheKey = typeof context === 'string' 
    ? context 
    : JSON.stringify(context);
  
  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey)!;
  }
  
  const url = await matchModelToContext(context);
  modelCache.set(cacheKey, url);
  return url;
}

/**
 * Включить/выключить AI подбор
 */
export function setAIEnabled(enabled: boolean) {
  useAI = enabled;
  console.log(`🤖 AI model selection: ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Очистить кеш моделей
 */
export function clearModelCache() {
  modelCache.clear();
  aiCache.clear();
  console.log('🗑️ Model cache cleared');
}
