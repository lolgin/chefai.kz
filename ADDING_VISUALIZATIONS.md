# Гайд: Добавление Новых Типов Визуализации

Модульная архитектура визуализации позволяет легко добавлять новые типы отображения без поломки существующего кода. Этот гайд оптимизирован для работы с AI-агентами.

## 📐 Архитектура

```
src/services/visualizationProviders.ts  ← Реестр всех провайдеров
src/hooks/useVisualizationProvider.ts   ← Хук для использования
src/components/UI/VisualizationSelector.tsx ← UI для выбора
```

### Как это работает:

1. **Провайдер** = класс, реализующий `IVisualizationProvider`
2. **Провайдер** генерирует layout (позиции элементов в 3D/2D пространстве)
3. **Компонент** использует layout через хук `useVisualizationProvider`
4. **Автоматическая регистрация** в реестре при создании

---

## 🚀 Быстрый Старт: Добавление Нового Провайдера

### Шаг 1: Добавьте ID провайдера в enum

В файле `src/services/visualizationProviders.ts`:

```typescript
export enum VisualizationProvider {
  // ... существующие
  MY_NEW_PROVIDER = 'my-new-provider'  // ← ДОБАВЬТЕ СЮДА
}
```

### Шаг 2: Создайте класс провайдера

В том же файле добавьте:

```typescript
export class MyNewProvider implements IVisualizationProvider {
  readonly id = VisualizationProvider.MY_NEW_PROVIDER;
  readonly name = 'Мое Название';  // Отображается в UI
  readonly description = 'Описание что делает';
  readonly category = 'threejs' as const;  // threejs | css3d | d3 | 2d
  readonly supportsRotation = true;  // Можно вращать?
  readonly supportsZoom = true;      // Можно зумить?
  
  // ГЛАВНЫЙ МЕТОД: вычисление позиций
  calculateLayout(
    items: VisualizationItem[],
    config: VisualizationConfig
  ): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    
    // ВАША ЛОГИКА LAYOUT
    items.forEach((item, index) => {
      positions.set(item.id, {
        x: /* ваша формула X */,
        y: /* ваша формула Y */,
        z: /* ваша формула Z */,
        scale: 1.0,  // опционально
        rotation: { x: 0, y: 0, z: 0 }  // опционально
      });
    });
    
    return positions;
  }
  
  // Конфигурация по умолчанию
  getDefaultConfig(): Partial<VisualizationConfig> {
    return {
      allowRotation: true,
      glow: true,
      // ... другие дефолты
    };
  }
}
```

### Шаг 3: Зарегистрируйте провайдер

В конструкторе `VisualizationRegistry`:

```typescript
constructor() {
  // ... существующие
  this.register(new MyNewProvider());  // ← ДОБАВЬТЕ СЮДА
}
```

### Шаг 4: Добавьте иконку в селектор

В файле `src/components/UI/VisualizationSelector.tsx`:

```typescript
import { MyIcon } from 'lucide-react';  // Выберите иконку

const PROVIDER_ICONS: Record<VisualizationProvider, React.ReactNode> = {
  // ... существующие
  [VisualizationProvider.MY_NEW_PROVIDER]: <MyIcon size={16} />
};
```

### ✅ Готово!

Провайдер автоматически появится в UI селекторе, и пользователи смогут его выбирать.

---

## 📊 Примеры Layout Алгоритмов

### Сфера (Sphere)

```typescript
const radius = 400;
items.forEach((item, index) => {
  const phi = Math.acos(-1 + (2 * index) / items.length);
  const theta = Math.sqrt(items.length * Math.PI) * phi;
  
  positions.set(item.id, {
    x: radius * Math.cos(theta) * Math.sin(phi),
    y: radius * Math.sin(theta) * Math.sin(phi),
    z: radius * Math.cos(phi)
  });
});
```

### Спираль (Helix)

```typescript
const radius = 300;
const height = 800;
items.forEach((item, index) => {
  const t = index / items.length;
  const angle = t * Math.PI * 8;
  
  positions.set(item.id, {
    x: Math.cos(angle) * radius,
    y: t * height - height / 2,
    z: Math.sin(angle) * radius
  });
});
```

### Спиральная галактика (Spiral Galaxy)

```typescript
const arms = 3;
const spread = 500;
items.forEach((item, index) => {
  const armIndex = index % arms;
  const distance = (index / items.length) * spread;
  const angle = (index / items.length) * Math.PI * 8 + 
                (armIndex * Math.PI * 2 / arms);
  
  positions.set(item.id, {
    x: Math.cos(angle) * distance,
    y: (Math.random() - 0.5) * 50,
    z: Math.sin(angle) * distance
  });
});
```

### Куб (Cube Grid)

```typescript
const gridSize = Math.ceil(Math.cbrt(items.length));
const spacing = 100;
items.forEach((item, index) => {
  const x = index % gridSize;
  const y = Math.floor(index / gridSize) % gridSize;
  const z = Math.floor(index / (gridSize * gridSize));
  
  positions.set(item.id, {
    x: (x - gridSize / 2) * spacing,
    y: (y - gridSize / 2) * spacing,
    z: (z - gridSize / 2) * spacing
  });
});
```

### Кольцо (Ring)

```typescript
const radius = 400;
items.forEach((item, index) => {
  const angle = (index / items.length) * Math.PI * 2;
  
  positions.set(item.id, {
    x: Math.cos(angle) * radius,
    y: 0,
    z: Math.sin(angle) * radius
  });
});
```

---

## 🎨 Типы Провайдеров по Категориям

### `threejs` - Three.js 3D
- Используйте для сложной 3D графики
- Рендеринг через WebGL
- Примеры: планеты, галактики, частицы

### `css3d` - CSS 3D Transforms
- Легковесные 3D эффекты
- DOM элементы с CSS transforms
- Примеры: облака тегов, сферы

### `d3` - D3.js Графы
- Графы связей, деревья
- 2D с интерактивностью
- Примеры: force-directed, sunburst

### `2d` - Простые списки
- Сетки, списки, карусели
- Без 3D эффектов
- Примеры: masonry, grid

---

## 🔧 Расширенные Возможности

### Специфичный Компонент Рендеринга

Если нужен кастомный компонент (не просто позиции):

```typescript
class MyProvider implements IVisualizationProvider {
  // ... остальное
  
  getComponent(): React.ComponentType<any> {
    return MyCustomComponent;  // Ваш React компонент
  }
}
```

### Динамические Конфигурации

Используйте поля из `VisualizationConfig`:

```typescript
calculateLayout(items, config) {
  const radius = 400 * (config.spread || 1.0);
  const density = config.density || 1.0;
  
  // Используйте в алгоритме
}
```

### Связи между элементами

Если `config.showConnections === true`:

```typescript
calculateLayout(items, config) {
  // ... позиции
  
  if (config.showConnections) {
    // Добавьте связи в metadata
    positions.set(item.id, {
      ...position,
      connections: [/* массив связанных ID */]
    });
  }
}
```

---

## 📝 Чеклист для AI-Агента

При добавлении нового провайдера проверьте:

- [ ] Добавлен ID в `VisualizationProvider` enum
- [ ] Создан класс провайдера с `IVisualizationProvider`
- [ ] Реализован метод `calculateLayout`
- [ ] Реализован метод `getDefaultConfig`
- [ ] Провайдер зарегистрирован в `VisualizationRegistry`
- [ ] Добавлена иконка в `PROVIDER_ICONS`
- [ ] Указана правильная `category`
- [ ] Указаны `supportsRotation` и `supportsZoom`
- [ ] Layout возвращает валидные координаты
- [ ] Протестировано с разным количеством items (1, 10, 100, 1000)

---

## 🐛 Частые Проблемы

### Провайдер не появляется в UI

- Проверьте регистрацию в `VisualizationRegistry`
- Проверьте наличие иконки в `PROVIDER_ICONS`

### Layout выглядит странно

- Проверьте масштабы координат (оптимально -500 до 500)
- Убедитесь что Z координата не 0 для всех элементов (плоская визуализация)
- Проверьте деление на 0

### Элементы накладываются друг на друга

- Увеличьте `spread` или `spacing`
- Добавьте random offset: `x + (Math.random() - 0.5) * 20`

---

## 🚀 Готовые Примеры

Смотрите реализацию в `src/services/visualizationProviders.ts`:

- `ThreeJSPlanetsProvider` - солнечная система
- `ThreeJSGalaxyProvider` - спиральная галактика
- `ThreeJSNebulaProvider` - туманность с gaussian distribution
- `CSS3DCloudProvider` - классическое облако тегов
- `D3ForceProvider` - force-directed граф

---

## 📚 API Reference

### `VisualizationItem`
```typescript
interface VisualizationItem {
  id: string;          // Уникальный ID
  name: string;        // Название для отображения
  provider?: string;   // Провайдер контента (опционально)
  favicon?: string;    // URL иконки
  tags?: string[];     // Теги для группировки
  [key: string]: any;  // Любые доп поля
}
```

### `LayoutPosition`
```typescript
interface LayoutPosition {
  x: number;           // X координата
  y: number;           // Y координата
  z: number;           // Z координата
  rotation?: {         // Опционально: поворот
    x: number;
    y: number;
    z: number;
  };
  scale?: number;      // Опционально: масштаб (default 1.0)
}
```

### `VisualizationConfig`
```typescript
interface VisualizationConfig {
  itemCount: number;                    // Количество элементов
  containerSize: {                      // Размер контейнера
    width: number;
    height: number;
    depth: number;
  };
  formation?: CloudFormation;           // Тип формации
  objectType?: CosmicObjectType;        // Тип объекта
  density?: number;                     // Плотность (0.1 - 5.0)
  spread?: number;                      // Разброс (0.5 - 2.0)
  allowRotation?: boolean;              // Разрешить вращение
  allowZoom?: boolean;                  // Разрешить зум
  clickable?: boolean;                  // Можно кликать
  showConnections?: boolean;            // Показывать связи
  connectionStyle?: 'lines' | 'particles' | 'glow';
  glow?: boolean;                       // Эффект свечения
  particles?: boolean;                  // Частицы
}
```

---

## 💡 Советы для AI-Агентов

1. **Начинайте с простого** - сначала базовый layout, потом улучшайте
2. **Копируйте структуру** - используйте существующие провайдеры как шаблон
3. **Тестируйте на разных размерах** - 10, 100, 1000 элементов
4. **Документируйте алгоритм** - комментарии в коде помогают
5. **Используйте константы** - не хардкодьте magic numbers
6. **Проверяйте edge cases** - 0 элементов, 1 элемент, очень много элементов

---

## 🎯 Примеры Использования

### В компоненте Three.js

```typescript
import { useVisualizationProvider } from '../../hooks/useVisualizationProvider';
import { VisualizationProvider } from '../../services/visualizationProviders';

function MyThreeJSComponent({ stations }) {
  const { layout, config, supportsRotation } = useVisualizationProvider({
    providerId: VisualizationProvider.THREEJS_GALAXY,
    items: stations.map(s => ({ id: s.url, name: s.name })),
    config: { spread: 1.5, glow: true }
  });
  
  // Используйте layout для позиционирования
  stations.forEach(station => {
    const pos = layout.get(station.url);
    // создайте mesh с позицией pos.x, pos.y, pos.z
  });
}
```

### Переключение провайдера

```typescript
const [providerId, setProviderId] = useState(VisualizationProvider.THREEJS_PLANETS);

<VisualizationSelector
  currentProvider={providerId}
  onProviderChange={setProviderId}
  theme={theme}
/>
```

---

**Готово! Теперь вы можете легко добавлять новые типы визуализации.** 🎨✨
