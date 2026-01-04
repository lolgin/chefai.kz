/**
 * skins.ts
 * 
 * Типы для системы скинов интерфейса (как в Winamp)
 * Каждый скин полностью меняет внешний вид приложения
 */

export type SkinLayout = 
  | 'classic'      // Классический Winamp стиль - компактные окна
  | 'modern'       // Современный минималистичный
  | 'cyberpunk'    // Киберпанк с неоновыми эффектами
  | 'retro'        // Ретро терминал
  | 'glass';       // Стеклянный прозрачный

export interface SkinColors {
  primary: string;      // Основной цвет
  secondary: string;    // Вторичный цвет
  background: string;   // Фон (может быть градиент)
  surface: string;      // Поверхности (панели, карточки)
  text: string;         // Текст
  textSecondary: string; // Вторичный текст
  accent: string;       // Акцент (кнопки, ссылки)
  border: string;       // Границы
  shadow: string;       // Тени
  glow: string;         // Свечение для неона
}

export interface SkinGeometry {
  borderRadius: {
    small: string;   // 4px, 8px, etc.
    medium: string;  // 12px, 16px, etc.
    large: string;   // 24px, 32px, etc.
  };
  spacing: {
    xs: string;      // 4px
    sm: string;      // 8px
    md: string;      // 16px
    lg: string;      // 24px
    xl: string;      // 32px
  };
  fontSize: {
    xs: string;      // 10px
    sm: string;      // 12px
    base: string;    // 14px
    lg: string;      // 16px
    xl: string;      // 20px
    xxl: string;     // 24px
  };
  panelWidth: {
    left: string;    // Ширина левой панели
    right: string;   // Ширина правой панели
  };
}

export interface SkinEffects {
  blur: string;              // Размытие (для glass эффекта)
  shadow: string;            // Тени
  glow: string;              // Свечение
  opacity: number;           // Прозрачность
  glassEffect: boolean;      // Стеклянный эффект
  neonEffect: boolean;       // Неоновый эффект
  scanlines: boolean;        // Сканлайны (ретро)
  gridPattern: boolean;      // Сетка на фоне
  particles: boolean;        // Частицы
  animationSpeed: number;    // Скорость анимаций (0-1)
}

export interface SkinComponents {
  header: {
    height: string;
    style: 'compact' | 'spacious' | 'minimal';
  };
  player: {
    position: 'bottom' | 'top' | 'floating';
    size: 'compact' | 'normal' | 'large';
    style: 'bar' | 'card' | 'minimalist';
  };
  modules: {
    position: 'center' | 'fullscreen' | 'sidebar';
    animation: 'fade' | 'slide' | 'scale' | 'none';
    backdrop: boolean; // Затемнение фона при открытии
  };
  panels: {
    style: 'overlay' | 'push' | 'sidebar';
    width: 'narrow' | 'normal' | 'wide';
  };
  visualizer: {
    style: '3d-cloud' | '2d-bars' | 'waveform' | 'particles';
    intensity: number; // 0-1
  };
}

export interface AppSkin {
  id: string;
  name: string;
  author: string;
  description: string;
  layout: SkinLayout;
  colors: SkinColors;
  geometry: SkinGeometry;
  effects: SkinEffects;
  components: SkinComponents;
  customCSS?: string; // Дополнительные CSS правила
  preview?: string;   // URL превью изображения
}

// Утилита для создания градиента
export function createGradient(colors: string[], angle: number = 135): string {
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
}

// Утилита для создания неонового свечения
export function createNeonGlow(color: string, intensity: number = 1): string {
  const alpha = Math.floor(intensity * 128).toString(16).padStart(2, '0');
  return `0 0 ${10 * intensity}px ${color}${alpha}, 0 0 ${20 * intensity}px ${color}${alpha}`;
}
