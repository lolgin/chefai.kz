/**
 * TrackInfo.tsx
 * 
 * Отображение информации о текущем треке
 * Содержит:
 * - Название трека и исполнитель
 * - Favicon/иконка станции
 * - Битрейт
 * - Копирование метаданных по клику
 */

import React from 'react';
import { Activity, Copy } from 'lucide-react';
import { TrackMetadata } from '../../types';

interface TrackInfoProps {
  metadata: TrackMetadata | null;
  onCopyMetadata?: () => void;
}

export const TrackInfo: React.FC<TrackInfoProps> = ({
  metadata,
  onCopyMetadata
}) => {
  return (
    <div className="flex items-center gap-5 w-1/4 overflow-hidden group">
      <div className="w-14 h-14 rounded-2xl bg-black/10 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
        {metadata?.favicon ? (
          <img src={metadata.favicon} className="w-full h-full object-cover" alt="" />
        ) : (
          <Activity size={24} className="animate-pulse" />
        )}
      </div>
      
      <div className="flex-1 overflow-hidden cursor-pointer" onClick={onCopyMetadata}>
        <div className="text-[8px] font-black uppercase opacity-20 tracking-widest flex items-center gap-2">
          {metadata?.artist || 'NEURAL_LINK'} // {metadata?.bitrate || '128'}K
        </div>
        
        <div className="relative overflow-hidden h-6 mt-1">
          <div
            className={`${
              (metadata?.title?.length || 0) > 18 ? 'animate-marquee-text' : ''
            } text-base font-black uppercase text-indigo-600 flex items-center gap-3`}
          >
            {metadata?.title || 'SYNCING...'}
            {(metadata?.title?.length || 0) > 18 && (
              <Copy size={12} className="opacity-10 group-hover:opacity-100 transition-all" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
