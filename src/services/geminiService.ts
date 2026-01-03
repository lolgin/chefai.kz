
import { GoogleGenAI, Type } from "@google/genai";
import { Genre, TrackMetadata } from "../types";

// Moved instantiation inside the function to ensure the most up-to-date API key is used per call
export const generateTrackMetadata = async (genre: string, provider: string): Promise<TrackMetadata> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate cyberpunk metadata for a radio station. 
      Genre: ${genre}
      Provider: ${provider}
      Format: JSON with title, artist, bpm (number), mood, energy (0.0 to 1.0), description (short sci-fi).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            mood: { type: Type.STRING },
            energy: { type: Type.NUMBER },
            description: { type: Type.STRING }
          },
          required: ["title", "artist", "bpm", "mood", "energy", "description"]
        }
      }
    });

    // Directly access the .text property from the response
    const data = JSON.parse(response.text || '{}');
    return {
      title: data.title || genre.toUpperCase(),
      artist: data.artist || "AuraWave Core",
      bpm: data.bpm || 120,
      mood: data.mood || "Cybernetic",
      energy: data.energy || 0.5,
      description: data.description || "Neural link established."
    };
  } catch (e) {
    console.warn("Gemini synthesis offline, using fallback.");
    return {
      title: genre.toUpperCase(),
      artist: "Neural Relay",
      bpm: 90,
      mood: "Steady",
      energy: 0.5,
      description: "Fallback frequency active."
    };
  }
};
