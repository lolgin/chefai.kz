/**
 * MetadataContext.tsx
 * 
 * Контекст для управления метаданными текущего трека
 * Содержит:
 * - Информация о треке (название, исполнитель, BPM)
 * - Статус воспроизведения
 * - Методы обновления и очистки метаданных
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TrackMetadata, Provider } from '../types';
import { generateTrackMetadata } from '../services/geminiService';

interface MetadataContextType {
  metadata: TrackMetadata | null;
  statusMessage: string;
  updateMetadata: (metadata: TrackMetadata) => void;
  clearMetadata: () => void;
  setStatusMessage: (message: string) => void;
  fetchAIMetadata: (name: string, provider: string) => Promise<void>;
}

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export const MetadataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metadata, setMetadata] = useState<TrackMetadata | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('SYSTEM_READY');

  const updateMetadata = (newMetadata: TrackMetadata) => {
    setMetadata(newMetadata);
  };

  const clearMetadata = () => {
    setMetadata(null);
    setStatusMessage('SYSTEM_READY');
  };

  const fetchAIMetadata = async (name: string, provider: string) => {
    if (provider === Provider.GENERATIVE_AI) {
      try {
        const aiMetadata = await generateTrackMetadata(name, provider);
        setMetadata(prev => (prev ? { ...prev, ...aiMetadata } : null));
      } catch (error) {
        console.error('Failed to fetch AI metadata:', error);
      }
    }
  };

  const value: MetadataContextType = {
    metadata,
    statusMessage,
    updateMetadata,
    clearMetadata,
    setStatusMessage,
    fetchAIMetadata
  };

  return <MetadataContext.Provider value={value}>{children}</MetadataContext.Provider>;
};

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within MetadataProvider');
  }
  return context;
};
