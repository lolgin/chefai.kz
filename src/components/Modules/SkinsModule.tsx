/**
 * SkinsModule.tsx
 * 
 * Модуль выбора и настройки скинов интерфейса
 * Как в Winamp - полностью меняет внешний вид приложения
 */

import React, { useState } from 'react';
import { Palette, Download, Sparkles, Eye, Wand2, Code } from 'lucide-react';
import { AVAILABLE_SKINS } from '../../skins';
import { AppSkin } from '../../types/skins';
import { Button } from '../UI/Button';

interface SkinsModuleProps {
  currentSkinId: string;
  onSkinChange: (skinId: string) => void;
}

export const SkinsModule: React.FC<SkinsModuleProps> = ({
  currentSkinId,
  onSkinChange
}) => {
  const [hoveredSkin, setHoveredSkin] = useState<string | null>(null);

  const generateRandomSkin = () => {
    const randomSkin = AVAILABLE_SKINS[Math.floor(Math.random() * AVAILABLE_SKINS.length)];
    onSkinChange(randomSkin.id);
  };

  const renderSkinCard = (skin: AppSkin) => {
    const isActive = currentSkinId === skin.id;
    const isHovered = hoveredSkin === skin.id;

    return (
      <div
        key={skin.id}
        className="relative group cursor-pointer transition-all duration-300"
        style={{
          transform: isActive ? 'scale(1.05)' : isHovered ? 'scale(1.02)' : 'scale(1)',
        }}
        onClick={() => onSkinChange(skin.id)}
        onMouseEnter={() => setHoveredSkin(skin.id)}
        onMouseLeave={() => setHoveredSkin(null)}
      >
        {/* Превью скина */}
        <div
          className="relative overflow-hidden aspect-video rounded-3xl border-4 shadow-2xl"
          style={{
            borderColor: isActive ? skin.colors.accent : 'transparent',
            background: skin.colors.background,
            boxShadow: isActive ? `0 0 30px ${skin.colors.glow}` : 'none',
          }}
        >
          {/* Эффекты */}
          {skin.effects.scanlines && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
              }}
            />
          )}
          {skin.effects.gridPattern && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          )}

          {/* Мини-превью интерфейса */}
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div
              className="mb-4 p-3 rounded-lg flex items-center gap-2"
              style={{
                backgroundColor: skin.colors.surface,
                borderRadius: skin.geometry.borderRadius.medium,
                fontSize: skin.geometry.fontSize.xs,
                color: skin.colors.text,
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: skin.colors.accent }} />
              <div className="flex-1 h-1 rounded" style={{ backgroundColor: skin.colors.border, opacity: 0.3 }} />
            </div>

            {/* Content area */}
            <div className="flex-1 grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="rounded"
                  style={{
                    backgroundColor: skin.colors.surface,
                    borderRadius: skin.geometry.borderRadius.small,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>

            {/* Player bar */}
            <div
              className="mt-4 p-2 rounded flex items-center gap-2"
              style={{
                backgroundColor: skin.colors.surface,
                borderRadius: skin.geometry.borderRadius.small,
                borderTop: `2px solid ${skin.colors.accent}`,
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.colors.accent }} />
              <div className="flex-1 h-1 rounded" style={{ backgroundColor: skin.colors.border, opacity: 0.5 }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: skin.colors.secondary }} />
            </div>
          </div>

          {/* Overlay при hover */}
          {isHovered && !isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Eye size={48} color={skin.colors.accent} />
            </div>
          )}

          {/* Badge если активен */}
          {isActive && (
            <div
              className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black uppercase"
              style={{
                backgroundColor: skin.colors.accent,
                color: '#ffffff',
              }}
            >
              АКТИВЕН
            </div>
          )}
        </div>

        {/* Информация о скине */}
        <div className="mt-4 space-y-2">
          <h3 className="text-xl font-black uppercase">{skin.name}</h3>
          <p className="text-sm opacity-60">{skin.description}</p>
          <div className="flex items-center gap-2 text-xs opacity-40">
            <span>👤 {skin.author}</span>
            <span>•</span>
            <span>📐 {skin.layout}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase mb-2">Скины Интерфейса</h2>
          <p className="opacity-60">Полностью меняют внешний вид приложения, как в Winamp</p>
        </div>
        <div className="flex gap-3">
          <Button
            size="md"
            icon={<Sparkles size={20} />}
            onClick={generateRandomSkin}
          >
            Случайный
          </Button>
          <Button
            size="md"
            variant="secondary"
            icon={<Wand2 size={20} />}
            onClick={() => alert('AI Генерация скина - скоро!')}
          >
            Создать с ИИ
          </Button>
          <Button
            size="md"
            variant="secondary"
            icon={<Download size={20} />}
            onClick={() => alert('Импорт Winamp скинов - в разработке!')}
          >
            Импорт
          </Button>
        </div>
      </div>

      {/* Сетка скинов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {AVAILABLE_SKINS.map(skin => renderSkinCard(skin))}
      </div>

      {/* Инфо блок */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/20">
        <div className="flex items-start gap-4">
          <Code size={32} className="text-indigo-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-black uppercase mb-2">Создайте свой скин</h4>
            <p className="opacity-70 mb-4">
              Используйте ИИ для генерации уникального скина или импортируйте классические скины из Winamp.
              Все скины бесплатные и с открытым исходным кодом.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-xs font-bold">JSON формат</span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-xs font-bold">Кастомный CSS</span>
              <span className="px-3 py-1 rounded-full bg-pink-500/20 text-xs font-bold">Open Source</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
