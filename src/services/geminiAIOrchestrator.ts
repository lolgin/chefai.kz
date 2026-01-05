/**
 * geminiAIOrchestrator.ts
 * 
 * Мощный AI оркестратор с Gemini
 * Умеет управлять всеми параметрами системы через естественный язык
 */

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface AIModelRequest {
  tagContext: string; // Название тега, жанр, провайдер
  query?: string; // Пользовательский запрос
  preferences?: {
    category?: string; // geometric, space, tech, etc
    style?: string; // minimal, complex, organic
    mood?: string; // calm, energetic, dark
  };
}

export interface AIModelResponse {
  modelId: string;
  reasoning: string;
  confidence: number; // 0-1
  alternatives?: string[];
}

export interface AISystemCommand {
  action: 'change_theme' | 'change_layout' | 'adjust_eq' | 'change_model' | 'search_stream';
  parameters: Record<string, any>;
  reasoning: string;
}

/**
 * Попросить Gemini подобрать 3D модель
 */
export async function askGeminiForModel(request: AIModelRequest): Promise<AIModelResponse | null> {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API key not configured');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const prompt = `You are an AI that selects 3D models for music tags in a web radio player.

Available models:
GEOMETRIC: cube, sphere, torus, octahedron, dodecahedron, icosahedron, tetrahedron, cone, cylinder, torus_knot
ABSTRACT: crystal, helix, mobius
SPACE: planet_basic, satellite, asteroid  
TECH: chip, circuit, gear

Tag context: "${request.tagContext}"
${request.query ? `User query: "${request.query}"` : ''}
${request.preferences ? `Preferences: ${JSON.stringify(request.preferences)}` : ''}

Select the BEST matching model ID and explain why. Also suggest 2 alternatives.
Return JSON: { modelId: string, reasoning: string, confidence: number, alternatives: [string, string] }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modelId: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            alternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["modelId", "reasoning", "confidence"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    console.log('🤖 Gemini model suggestion:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Gemini model selection failed:', error);
    return null;
  }
}

/**
 * Попросить Gemini выполнить системную команду
 */
export async function askGeminiForCommand(userQuery: string, systemState: any): Promise<AISystemCommand | null> {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API key not configured');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const prompt = `You are an AI assistant controlling a web radio player with 3D visualization.

Current system state:
- Theme: ${systemState.currentTheme || 'unknown'}
- Layout: ${systemState.currentLayout || 'unknown'}
- Active module: ${systemState.activeModule || 'none'}
- Playing: ${systemState.currentStation || 'nothing'}

Available actions:
1. change_theme: { themeId: string } - Change visual theme
2. change_layout: { layoutType: 'sphere' | 'cube' | 'spiral' | 'grid' | 'wave' } - Change cloud layout
3. adjust_eq: { band: number, value: number } - Adjust equalizer (band 0-9, value -12 to 12)
4. change_model: { modelId: string } - Change 3D model for tags
5. search_stream: { query: string } - Search for radio stations

User query: "${userQuery}"

Interpret the user's intent and return ONE action with parameters.
Return JSON: { action: string, parameters: object, reasoning: string }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            parameters: { type: Type.OBJECT },
            reasoning: { type: Type.STRING }
          },
          required: ["action", "parameters", "reasoning"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    console.log('🤖 Gemini command:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Gemini command failed:', error);
    return null;
  }
}

/**
 * Попросить Gemini описать текущее состояние системы
 */
export async function askGeminiToDescribe(context: any): Promise<string> {
  if (!GEMINI_API_KEY) {
    return 'AI описание недоступно - API ключ не настроен';
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const prompt = `Describe this web radio player state in a creative cyberpunk style (2-3 sentences):
    
Playing: ${context.station || 'silence'}
Theme: ${context.theme || 'default'}
Visualization: ${context.visualization || 'none'}
Mood: ${context.mood || 'neutral'}

Be poetic and futuristic.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt
    });

    return response.text || 'Neural signal lost...';
    
  } catch (error) {
    console.error('❌ Gemini description failed:', error);
    return 'AI core offline...';
  }
}

/**
 * Проверить доступность Gemini
 */
export function isGeminiAvailable(): boolean {
  return !!GEMINI_API_KEY && GEMINI_API_KEY.length > 0;
}

/**
 * Получить статус Gemini
 */
export function getGeminiStatus(): { available: boolean; model: string; features: string[] } {
  return {
    available: isGeminiAvailable(),
    model: 'gemini-2.0-flash-exp',
    features: [
      '3D Model Selection',
      'Natural Language Commands',
      'Context Description',
      'Theme & Layout Control',
      'Equalizer Adjustment'
    ]
  };
}
