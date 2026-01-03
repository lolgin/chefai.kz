# 🎨 AuraWave Display Customization Guide

## Новые Возможности v2.0

### 🌈 Светлые Стеклянные Темы

Добавлено 4 новые светлые темы с glassmorphism эффектами:

- **❄️ Glass Frost** - Ледяной голубой с максимальным blur
- **💎 Crystal Clear** - Кристальный янтарно-голубой микс
- **🌸 Lavender Mist** - Лавандовый туман
- **🍃 Mint Fresh** - Свежая мята

Все темы поддерживают:
- Градиентные фоны
- Размытие фона (32-40px)
- Полупрозрачные поверхности
- Адаптивную интенсивность теней

### 🎛️ Модуль Display Settings

Новый модуль **DISPLAY** с расширенными настройками:

#### Размер Шрифта
- `xs` - Extra Small (0.75rem)
- `sm` - Small (0.875rem)
- `md` - Medium (1rem)
- `lg` - Large (1.125rem) ✨ **По умолчанию**
- `xl` - Extra Large (1.25rem)
- `xxl` - 2X Large (1.5rem)

#### Размер Иконок
- `sm` - 16px
- `md` - 24px
- `lg` - 32px ✨ **По умолчанию**
- `xl` - 48px

#### Стиль Границ
- `none` - Без границ
- `solid` - Сплошные
- `gradient` - Градиентные ✨ **По умолчанию**
- `glow` - С свечением

#### Отступы
- `tight` - Плотные
- `normal` - Нормальные ✨ **По умолчанию**
- `relaxed` - Просторные

#### Скорость Анимаций
- `slow` - Медленно (500ms)
- `normal` - Нормально (300ms) ✨ **По умолчанию**
- `fast` - Быстро (150ms)

### 🎲 Случайные Цвета

Включите **Случайные Цвета** для генерации уникальных палитр для каждого элемента:

- Гармоничные цветовые схемы
- Пастельные цвета для светлых тем
- Неоновые цвета для темных тем
- Триадные и аналоговые палитры

### 🔘 Генератор Случайных Настроек

Кнопка **"Случайная Конфигурация"** с иконкой ✨ генерирует:
- Случайный размер шрифта
- Случайный размер иконок
- Случайный стиль границ
- Случайный spacing
- Случайное включение glassmorphism
- Случайное включение цветовой рандомизации

## 🛠️ Технические Детали

### Новые Типы

```typescript
interface DisplaySettings {
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  iconSize: 'sm' | 'md' | 'lg' | 'xl';
  compactMode: boolean;
  glassEffect: boolean;
  randomColors: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  borderStyle: 'none' | 'solid' | 'gradient' | 'glow';
  spacing: 'tight' | 'normal' | 'relaxed';
}

interface ModuleCustomization {
  moduleId: string;
  customColor?: string;
  opacity?: number;
  blur?: number;
  scale?: number;
  visible?: boolean;
}
```

### Утилиты

#### `colorUtils.ts`
- `generateRandomColor()` - Случайный HSL цвет
- `generatePastelColor()` - Пастельный цвет
- `generateNeonColor()` - Неоновый цвет
- `generateHarmoniousPalette()` - Гармоничная палитра из 5 цветов
- `generateTriadicColors()` - Триадная схема
- `generateAnalogousColors()` - Аналоговая схема

#### `displayStyles.ts`
- `getFontSizeClass()` - Tailwind класс размера шрифта
- `getIconSize()` - Размер иконки в px
- `getSpacingClass()` - Класс отступов
- `getAnimationDuration()` - Длительность анимации
- `getGlassStyles()` - Стили glassmorphism
- `getBorderStyles()` - Стили границ

#### `withDisplaySettings.tsx`
- HOC для применения настроек к компонентам
- `useIconSize()` - Hook для размера иконок
- `useRandomColor()` - Hook для случайных цветов

### Сохранение

Все настройки сохраняются в localStorage под ключом:
```
aurawave_v28_settings
```

### Значения По Умолчанию

```typescript
{
  themeId: 'glass-frost',
  display: {
    fontSize: 'lg',
    iconSize: 'lg',
    compactMode: false,
    glassEffect: true,
    randomColors: false,
    animationSpeed: 'normal',
    borderStyle: 'gradient',
    spacing: 'normal'
  }
}
```

## 🎯 Примеры Использования

### Применение настроек в компоненте

```tsx
import { useSettings } from './contexts/SettingsContext';
import { applyDisplaySettings } from './utils/displayStyles';

const MyComponent = () => {
  const { settings, theme } = useSettings();
  
  return (
    <div style={applyDisplaySettings(settings.display!, theme)}>
      Content
    </div>
  );
};
```

### Использование случайных цветов

```tsx
import { useRandomColor } from './hocs/withDisplaySettings';

const MyButton = () => {
  const randomColor = useRandomColor(true);
  
  return (
    <button style={{ backgroundColor: randomColor }}>
      Click me
    </button>
  );
};
```

### HOC с настройками

```tsx
import { withDisplaySettings } from './hocs/withDisplaySettings';

const MyComponent = (props) => <div>{props.children}</div>;

export default withDisplaySettings(MyComponent, {
  allowRandomColor: true,
  baseClassName: 'my-component'
});
```

## 🚀 Будущие Улучшения

- [ ] Сохранение пользовательских тем
- [ ] Импорт/экспорт настроек
- [ ] Пресеты для разных сценариев
- [ ] Анимированные переходы между темами
- [ ] Кастомные градиенты через UI
- [ ] Per-module цветовая кастомизация
- [ ] Accessibility режим с высоким контрастом
