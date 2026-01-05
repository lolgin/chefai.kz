# 🖼️ Background Providers - План реализации

## Концепция
Пользователь должен иметь возможность выбрать фон из базы провайдеров:
- **Обычные обои** (jpg, png, webp)
- **Живые обои** (video, animated webp, lottie)
- **3D фоны** (gltf модели, shader backgrounds)

## Архитектура

### 1. Типы (добавить в src/types.ts)

```typescript
export enum BackgroundType {
  STATIC = 'static',       // Статичное изображение
  ANIMATED = 'animated',   // Animated WebP, GIF
  VIDEO = 'video',         // MP4, WebM
  LOTTIE = 'lottie',      // Lottie анимации
  SHADER = 'shader',       // WebGL shader фоны
  GLTF = '3d'             // 3D модели (Three.js)
}

export interface BackgroundAsset {
  id: string;
  name: string;
  type: BackgroundType;
  url: string;
  thumbnail?: string;
  author?: string;
  tags?: string[];
  resolution?: { width: number; height: number };
}

export interface BackgroundProvider {
  id: string;
  name: string;
  description: string;
  assets: BackgroundAsset[];
  apiUrl?: string; // Для динамической загрузки
}
```

### 2. Провайдеры (создать src/data/backgroundProviders.ts)

```typescript
export const BACKGROUND_PROVIDERS: BackgroundProvider[] = [
  {
    id: 'unsplash',
    name: 'Unsplash',
    description: 'High-quality photography',
    apiUrl: 'https://api.unsplash.com/photos/random?query=abstract',
    assets: [] // Динамически загружаются
  },
  {
    id: 'built-in',
    name: 'Built-in Backgrounds',
    description: 'Curated collection',
    assets: [
      {
        id: 'cyberpunk-city',
        name: 'Cyberpunk City',
        type: BackgroundType.STATIC,
        url: '/assets/bg-cyberpunk-city.webp',
        tags: ['cyberpunk', 'city', 'neon']
      },
      {
        id: 'matrix-rain',
        name: 'Matrix Rain',
        type: BackgroundType.SHADER,
        url: 'shader://matrix',
        tags: ['matrix', 'code', 'rain']
      },
      {
        id: 'space-nebula',
        name: 'Space Nebula',
        type: BackgroundType.VIDEO,
        url: '/assets/bg-nebula.webm',
        tags: ['space', 'nebula', 'stars']
      }
    ]
  },
  {
    id: 'pexels',
    name: 'Pexels Videos',
    description: 'Free stock videos',
    apiUrl: 'https://api.pexels.com/videos/search?query=abstract',
    assets: []
  }
];
```

### 3. Hook (создать src/hooks/useBackgroundManager.ts)

```typescript
import { useState, useEffect } from 'react';
import { BackgroundAsset, BackgroundType } from '../types';
import { useSettings } from '../contexts/SettingsContext';

export const useBackgroundManager = () => {
  const { settings, updateSettings } = useSettings();
  const [currentBackground, setCurrentBackground] = useState<BackgroundAsset | null>(
    settings.background || null
  );

  const applyBackground = (asset: BackgroundAsset) => {
    setCurrentBackground(asset);
    updateSettings({ background: asset });
    
    // Apply to body or dedicated background container
    const container = document.getElementById('app-background');
    if (!container) return;

    // Clear previous background
    container.innerHTML = '';
    container.style.cssText = '';

    switch (asset.type) {
      case BackgroundType.STATIC:
      case BackgroundType.ANIMATED:
        container.style.backgroundImage = `url('${asset.url}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        break;

      case BackgroundType.VIDEO:
        const video = document.createElement('video');
        video.src = asset.url;
        video.loop = true;
        video.muted = true;
        video.autoplay = true;
        video.style.cssText = 'position:absolute;width:100%;height:100%;object-fit:cover;';
        container.appendChild(video);
        break;

      case BackgroundType.SHADER:
        // Integrate with Three.js scene
        // TODO: Implement shader background renderer
        break;

      case BackgroundType.GLTF:
        // Load 3D model as background
        // TODO: Implement GLTF background loader
        break;
    }
  };

  const removeBackground = () => {
    setCurrentBackground(null);
    updateSettings({ background: null });
    const container = document.getElementById('app-background');
    if (container) {
      container.innerHTML = '';
      container.style.cssText = '';
    }
  };

  return {
    currentBackground,
    applyBackground,
    removeBackground
  };
};
```

### 4. UI компонент (создать src/components/Modules/BackgroundsModule.tsx)

```typescript
import React, { useState } from 'react';
import { BackgroundAsset, BackgroundProvider } from '../../types';
import { BACKGROUND_PROVIDERS } from '../../data/backgroundProviders';
import { useBackgroundManager } from '../../hooks/useBackgroundManager';
import { IconButton } from '../UI/IconButton';
import { Download, Trash2, Eye } from 'lucide-react';

export const BackgroundsModule: React.FC = () => {
  const { currentBackground, applyBackground, removeBackground } = useBackgroundManager();
  const [selectedProvider, setSelectedProvider] = useState<BackgroundProvider>(
    BACKGROUND_PROVIDERS[0]
  );

  const handleSelectBackground = (asset: BackgroundAsset) => {
    applyBackground(asset);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Provider tabs */}
      <div className="flex gap-2 p-4 border-b border-white/10">
        {BACKGROUND_PROVIDERS.map(provider => (
          <button
            key={provider.id}
            onClick={() => setSelectedProvider(provider)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedProvider.id === provider.id
                ? 'bg-white/20'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {provider.name}
          </button>
        ))}
      </div>

      {/* Current background info */}
      {currentBackground && (
        <div className="p-4 bg-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-60">Active background:</p>
            <p className="font-medium">{currentBackground.name}</p>
          </div>
          <IconButton
            icon={Trash2}
            onClick={removeBackground}
            title="Remove background"
          />
        </div>
      )}

      {/* Asset grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedProvider.assets.map(asset => (
            <div
              key={asset.id}
              className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer bg-white/5 hover:bg-white/10 transition"
              onClick={() => handleSelectBackground(asset)}
            >
              {/* Thumbnail */}
              <img
                src={asset.thumbnail || asset.url}
                alt={asset.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <div className="flex gap-2">
                  <IconButton icon={Eye} onClick={() => {}} title="Preview" />
                  <IconButton icon={Download} onClick={() => {}} title="Apply" />
                </div>
              </div>

              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs truncate">{asset.name}</p>
              </div>

              {/* Type badge */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs">
                {asset.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 5. Интеграция в App.tsx

```typescript
// Добавить в ModuleType enum
export enum ModuleType {
  // ...existing
  BACKGROUNDS = 'backgrounds'
}

// Добавить в ModuleSwitcher
case ModuleType.BACKGROUNDS:
  return <BackgroundsModule />;

// Добавить background container в App
<div id="app-background" className="fixed inset-0 -z-10" />
```

### 6. Settings Context обновление

```typescript
// В SettingsContext добавить:
interface Settings {
  // ...existing
  background?: BackgroundAsset | null;
  backgroundBlur?: number; // 0-10, для размытия фона
  backgroundOpacity?: number; // 0-100, прозрачность
  backgroundParallax?: boolean; // Эффект parallax
}

const DEFAULT_SETTINGS: Settings = {
  // ...existing
  background: null,
  backgroundBlur: 0,
  backgroundOpacity: 100,
  backgroundParallax: false
};
```

## Провайдеры API

### Unsplash
```typescript
const fetchUnsplashBackground = async (query: string = 'abstract') => {
  const response = await fetch(
    `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape`,
    { headers: { Authorization: 'Client-ID YOUR_ACCESS_KEY' } }
  );
  const data = await response.json();
  return {
    id: data.id,
    name: data.description || data.alt_description,
    type: BackgroundType.STATIC,
    url: data.urls.full,
    thumbnail: data.urls.small,
    author: data.user.name
  };
};
```

### Pexels
```typescript
const fetchPexelsVideo = async (query: string = 'abstract') => {
  const response = await fetch(
    `https://api.pexels.com/videos/search?query=${query}&per_page=20`,
    { headers: { Authorization: 'YOUR_API_KEY' } }
  );
  const data = await response.json();
  return data.videos.map(video => ({
    id: video.id.toString(),
    name: video.url,
    type: BackgroundType.VIDEO,
    url: video.video_files[0].link,
    thumbnail: video.image,
    author: video.user.name
  }));
};
```

## Shader Backgrounds

### Matrix Rain
```glsl
// fragment shader
uniform float time;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float rain = fract(uv.y * 20.0 - time);
  vec3 color = vec3(0.0, rain, 0.0);
  gl_FragColor = vec4(color, 1.0);
}
```

### Интеграция шейдеров
```typescript
// src/components/Background/ShaderBackground.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ShaderBackground: React.FC<{ shaderCode: string }> = ({ shaderCode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer();
    
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      fragmentShader: shaderCode
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    const animate = () => {
      material.uniforms.time.value += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
    
    containerRef.current?.appendChild(renderer.domElement);
    
    return () => renderer.dispose();
  }, [shaderCode]);

  return <div ref={containerRef} />;
};
```

## Приоритет задач

1. **Высокий**: Статичные изображения (built-in коллекция)
2. **Средний**: Video backgrounds (WebM, MP4)
3. **Средний**: Unsplash/Pexels API интеграция
4. **Низкий**: Shader backgrounds
5. **Низкий**: 3D GLTF backgrounds

## Оценка времени
- Базовая реализация (статика + видео): **2-3 часа**
- API провайдеры: **1-2 часа**
- Shader backgrounds: **3-4 часа**
- Полная система: **6-10 часов**

## Важные замечания

- **Производительность**: Video/shader фоны нагружают GPU, нужен toggle
- **Мобильные**: Отключать видео/shader на мобилках
- **Кеширование**: Сохранять выбранный фон в localStorage
- **Fallback**: Всегда иметь дефолтный фон (gradient или solid)

---

**Статус**: Не реализовано  
**Приоритет**: Medium (nice-to-have)  
**Токены**: Отложить до следующей сессии
