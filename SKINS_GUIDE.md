# 🎨 Система Скинов AuraWave

## Обзор

Полноценная система скинов интерфейса, как в Winamp - **полностью меняет внешний вид приложения**.

## Доступные Скины

### 1. 🌟 Modern Minimalist (По умолчанию)
- **Стиль**: Современный минималистичный дизайн
- **Цвета**: Светлые пастельные тона (индиго, фиолетовый)
- **Эффекты**: Стеклянный blur, плавные анимации, частицы
- **Геометрия**: Большие радиусы скругления (32px), широкие отступы
- **Панели**: Push-стиль, широкие (280px/320px)
- **Player**: Внизу, большой размер, карточный стиль

### 2. 🎵 Classic Winamp
- **Стиль**: Классический Winamp - компактные окна
- **Цвета**: Зелёный неон (#00FF00), оранжевый акцент (#FF6600)
- **Эффекты**: Неоновое свечение, сетка на фоне
- **Геометрия**: Минимальные скругления (2-6px), компактные отступы
- **Панели**: Overlay-стиль, узкие (200px/250px)
- **Player**: Внизу, компактный, бар-стиль

### 3. 🌃 Cyberpunk 2077
- **Стиль**: Киберпанк с неоновыми эффектами
- **Цвета**: Cyan (#00ffff), Magenta (#ff00ff), жёлтый акцент
- **Эффекты**: Неоновое свечение, сканлайны, сетка, частицы
- **Геометрия**: Острые углы (0-4px), средние отступы
- **Панели**: Overlay-стиль, средние (240px/280px)
- **Player**: Внизу, средний размер, бар-стиль

### 4. 📟 Retro Terminal
- **Стиль**: Ретро терминал 80-х
- **Цвета**: Монохромный зелёный (#33ff33)
- **Эффекты**: Сканлайны, неоновое свечение, без blur
- **Геометрия**: Без скруглений (0px), средние отступы
- **Панели**: Sidebar-стиль, узкие (220px/260px)
- **Player**: Внизу, компактный, минималистичный

## Структура Скина

```typescript
interface AppSkin {
  id: string;                    // Уникальный ID
  name: string;                  // Отображаемое имя
  author: string;                // Автор
  description: string;           // Описание
  layout: SkinLayout;            // Тип layout'а
  colors: SkinColors;            // Цветовая схема
  geometry: SkinGeometry;        // Геометрия (размеры, отступы)
  effects: SkinEffects;          // Визуальные эффекты
  components: SkinComponents;    // Настройки компонентов
  customCSS?: string;            // Дополнительный CSS
  preview?: string;              // URL превью
}
```

## Как Использовать

### В Интерфейсе
1. Откройте модуль **SKINS** (иконка Diamond 💎)
2. Выберите скин из сетки
3. Скин применится мгновенно

### В Коде

```typescript
import { useSkin } from './contexts/SkinContext';

function MyComponent() {
  const { currentSkin, setSkin } = useSkin();
  
  // Получить текущий скин
  console.log(currentSkin.name);
  
  // Сменить скин
  setSkin('cyberpunk-2077');
  
  return (
    <div style={{ color: currentSkin.colors.text }}>
      Hello from {currentSkin.name}!
    </div>
  );
}
```

### CSS Переменные

Все скины устанавливают глобальные CSS переменные:

```css
/* Цвета */
--color-primary
--color-secondary
--color-background
--color-surface
--color-text
--color-text-secondary
--color-accent
--color-border
--color-shadow
--color-glow

/* Геометрия */
--radius-sm, --radius-md, --radius-lg
--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl
--font-xs, --font-sm, --font-base, --font-lg, --font-xl, --font-xxl

/* Эффекты */
--effect-blur
--effect-shadow
--effect-glow
--effect-opacity
--animation-speed
```

Используйте их в своих компонентах:

```css
.my-panel {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--effect-shadow);
}
```

### Готовые CSS Классы

```css
.skin-panel       /* Панель с blur и тенью */
.skin-card        /* Карточка с hover эффектом */
.skin-button      /* Кнопка с акцентным цветом */
.skin-input       /* Поле ввода */
.skin-glass       /* Стеклянный эффект */
.skin-effect-scanlines  /* Сканлайны */
.skin-effect-grid       /* Сетка на фоне */
.skin-effect-neon       /* Неоновое свечение */
```

## Создание Своего Скина

### 1. Базовый Скин

```typescript
import { AppSkin, createGradient, createNeonGlow } from '../types/skins';

export const mySkin: AppSkin = {
  id: 'my-custom-skin',
  name: '✨ My Custom Skin',
  author: 'Your Name',
  description: 'My amazing custom skin',
  layout: 'modern',
  colors: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    background: createGradient(['#1a1a2e', '#16213e'], 135),
    surface: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    accent: '#ff6b6b',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    glow: '#ff6b6b',
  },
  geometry: {
    borderRadius: { small: '8px', medium: '16px', large: '24px' },
    spacing: { xs: '8px', sm: '16px', md: '24px', lg: '32px', xl: '48px' },
    fontSize: { xs: '10px', sm: '12px', base: '14px', lg: '16px', xl: '20px', xxl: '24px' },
    panelWidth: { left: '280px', right: '320px' },
  },
  effects: {
    blur: '20px',
    shadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    glow: createNeonGlow('#ff6b6b', 0.8),
    opacity: 0.9,
    glassEffect: true,
    neonEffect: true,
    scanlines: false,
    gridPattern: true,
    particles: true,
    animationSpeed: 0.6,
  },
  components: {
    header: { height: '60px', style: 'compact' },
    player: { position: 'bottom', size: 'normal', style: 'card' },
    modules: { position: 'center', animation: 'fade', backdrop: true },
    panels: { style: 'push', width: 'normal' },
    visualizer: { style: '3d-cloud', intensity: 0.8 },
  },
};
```

### 2. Добавить в Коллекцию

Отредактируйте `src/skins/index.ts`:

```typescript
export const AVAILABLE_SKINS: AppSkin[] = [
  modernMinimalistSkin,
  classicWinampSkin,
  cyberpunkSkin,
  retroTerminalSkin,
  mySkin, // Добавить здесь
];
```

### 3. С Кастомным CSS

```typescript
export const myAdvancedSkin: AppSkin = {
  // ... базовые настройки ...
  customCSS: `
    .my-custom-element {
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      animation: myCustomAnimation 2s infinite;
    }
    
    @keyframes myCustomAnimation {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `,
};
```

## Импорт Winamp Скинов (В разработке)

Планируется поддержка импорта классических Winamp .wsz файлов:

1. Конвертация WSZ → JSON
2. Автоматическое извлечение цветов
3. Генерация геометрии
4. Сохранение в localStorage

## ИИ Генерация (Скоро)

Используйте Gemini API для создания скинов:

```typescript
// Пример запроса
const prompt = "Create a dark cyberpunk skin with neon green and purple";
const generatedSkin = await generateSkinWithAI(prompt);
```

## Хранение

Выбранный скин сохраняется в `localStorage`:
- **Ключ**: `aurawave_skin_v1`
- **Значение**: `skinId` (string)

## Технические Детали

### Файловая Структура
```
src/
  types/
    skins.ts              # TypeScript типы
  skins/
    index.ts              # Коллекция скинов
  contexts/
    SkinContext.tsx       # Контекст управления
  styles/
    skins.css             # Глобальные CSS
  components/
    Modules/
      SkinsModule.tsx     # UI модуль выбора
```

### Порядок Применения
1. SkinProvider загружает скин из localStorage
2. applySkinStyles() устанавливает CSS переменные
3. Компоненты используют CSS переменные или useSkin()
4. При смене скина всё обновляется автоматически

## Советы

1. **Цвета**: Используйте `createGradient()` для фонов
2. **Свечение**: Используйте `createNeonGlow()` для неона
3. **Тестирование**: Проверьте скин на всех модулях
4. **Производительность**: Избегайте тяжёлых CSS анимаций
5. **Доступность**: Поддерживайте контрастность текста

## API Референс

### Утилиты

```typescript
// Создать градиент
createGradient(['#color1', '#color2', ...], angle)

// Создать неоновое свечение
createNeonGlow(color, intensity)

// Получить скин по ID
getSkinById(id: string): AppSkin | undefined

// Получить дефолтный скин
getDefaultSkin(): AppSkin
```

### Хук useSkin

```typescript
const { currentSkin, setSkin, applySkinStyles } = useSkin();

// currentSkin: AppSkin      - Текущий активный скин
// setSkin: (id) => void     - Установить скин по ID
// applySkinStyles: () => void - Переприменить стили
```

## Будущие Планы

- [ ] Импорт/экспорт скинов в JSON
- [ ] Импорт Winamp .wsz файлов
- [ ] ИИ генерация через Gemini
- [ ] Marketplace скинов
- [ ] Редактор скинов в UI
- [ ] Анимированные скины
- [ ] Динамические скины (реакция на музыку)

---

**Enjoy skinning! 🎨✨**
