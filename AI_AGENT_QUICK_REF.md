# 🤖 AI Agent Quick Reference: Добавление Визуализаций

## TL;DR для AI-агентов

Модульная система визуализации = **4 простых шага** для добавления нового типа отображения.

---

## ⚡ Быстрый Старт (< 5 минут)

### 1️⃣ Enum ID

`src/services/visualizationProviders.ts`:

```typescript
export enum VisualizationProvider {
  MY_COOL_VIZ = 'my-cool-viz'  // ← ДОБАВИТЬ
}
```

### 2️⃣ Провайдер Класс

Там же:

```typescript
export class MyCoolVizProvider implements IVisualizationProvider {
  readonly id = VisualizationProvider.MY_COOL_VIZ;
  readonly name = 'Cool Viz';
  readonly description = 'Делает крутую визуализацию';
  readonly category = 'threejs' as const;
  readonly supportsRotation = true;
  readonly supportsZoom = true;
  
  calculateLayout(items, config) {
    const positions = new Map();
    items.forEach((item, i) => {
      positions.set(item.id, {
        x: /* формула */,
        y: /* формула */,
        z: /* формула */
      });
    });
    return positions;
  }
  
  getDefaultConfig() {
    return { allowRotation: true, glow: true };
  }
}
```

### 3️⃣ Регистрация

`VisualizationRegistry` constructor:

```typescript
this.register(new MyCoolVizProvider());  // ← ДОБАВИТЬ
```

### 4️⃣ Иконка

`src/components/UI/VisualizationSelector.tsx`:

```typescript
import { MyCoolIcon } from 'lucide-react';

const PROVIDER_ICONS = {
  [VisualizationProvider.MY_COOL_VIZ]: <MyCoolIcon size={16} />
};
```

---

## 📐 Layout Шпаргалка

### Сфера
```typescript
const phi = Math.acos(-1 + (2 * i) / items.length);
const theta = Math.sqrt(items.length * Math.PI) * phi;
x = R * Math.cos(theta) * Math.sin(phi);
y = R * Math.sin(theta) * Math.sin(phi);
z = R * Math.cos(phi);
```

### Спираль
```typescript
const t = i / items.length;
const angle = t * Math.PI * 8;
x = Math.cos(angle) * R;
y = t * H - H/2;
z = Math.sin(angle) * R;
```

### Галактика
```typescript
const arm = i % 3;
const d = (i / items.length) * R;
const a = (i / items.length) * Math.PI * 8 + arm * 2.09;
x = Math.cos(a) * d;
y = (Math.random() - 0.5) * 50;
z = Math.sin(a) * d;
```

### Сетка 3D
```typescript
const size = Math.ceil(Math.cbrt(items.length));
const x = i % size;
const y = Math.floor(i / size) % size;
const z = Math.floor(i / (size * size));
// ...позиционирование
```

---

## ✅ Чеклист

- [ ] ID в enum
- [ ] Класс с `IVisualizationProvider`
- [ ] `calculateLayout()` реализован
- [ ] `getDefaultConfig()` реализован
- [ ] Зарегистрирован в registry
- [ ] Иконка добавлена
- [ ] Category указан (`threejs`|`css3d`|`d3`|`2d`)

---

## 🎨 Categories

- **`threejs`** - WebGL 3D (планеты, галактики, частицы)
- **`css3d`** - CSS 3D (облака, сферы, легковесные эффекты)
- **`d3`** - D3.js графы (force-directed, деревья, sunburst)
- **`2d`** - Простые списки (grid, masonry, карусель)

---

## 🔍 Где Смотреть Примеры

`src/services/visualizationProviders.ts`:
- `ThreeJSPlanetsProvider` (солнечная система)
- `ThreeJSGalaxyProvider` (спиральная галактика)
- `ThreeJSNebulaProvider` (туманность)
- `CSS3DCloudProvider` (облако тегов)

---

## 🚨 Частые Ошибки

❌ Забыли регистрацию → провайдер не появится в UI  
❌ Нет иконки → ошибка рендера селектора  
❌ Z = 0 для всех → плоская визуализация  
❌ Координаты > 10000 → элементы за камерой  
❌ Деление на 0 → NaN координаты

---

## 💡 Pro Tips

✨ Координаты: `-500` до `500` оптимально  
✨ Z разброс: минимум `±100` для 3D эффекта  
✨ Random offset: `+ (Math.random() - 0.5) * 20`  
✨ Масштаб: `0.5` - `2.0` для variety  
✨ Тестируйте: 10, 100, 1000 элементов

---

## 🎯 Использование

```typescript
import { useVisualizationProvider } from '../hooks/useVisualizationProvider';

const { layout, config } = useVisualizationProvider({
  providerId: VisualizationProvider.MY_COOL_VIZ,
  items: stations.map(s => ({ id: s.url, name: s.name })),
  config: { spread: 1.5 }
});

// layout.get(item.id) → { x, y, z, scale?, rotation? }
```

---

**Full docs**: `ADDING_VISUALIZATIONS.md`
