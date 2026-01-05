# 🎯 Руководство по Drag & Drop системе

## Обзор

Все элементы интерфейса AuraWave теперь поддерживают перемещение и изменение размера через универсальную систему **LayoutContext** + **DraggableElement**.

## Архитектура

### Core файлы:
- `src/contexts/LayoutContext.tsx` - центральное хранилище позиций/размеров
- `src/components/UI/DraggableElement.tsx` - обертка для перемещаемых элементов
- `src/components/Background/DraggableTag.tsx` - обертка для тегов облака

### Режимы редактирования:

| Режим | Иконка | Описание |
|-------|--------|----------|
| **normal** | ⚫ ВЫКЛ | Обычный режим, drag & drop отключен |
| **move** | 🔀 ПЕРЕМЕЩЕНИЕ | Можно перемещать элементы |
| **resize** | 📏 РАЗМЕР | Можно изменять размер элементов |
| **full** | ✨ ПОЛНЫЙ | Можно перемещать И изменять размер |

### Активация:

1. Нажмите кнопку **Layers** (📋) в верхней панели
2. Выберите режим редактирования
3. Элементы получат фиолетовую обводку (`ring-2 ring-purple-500/30`)
4. Перетаскивайте элементы за маркер (GripVertical) или изменяйте размер за угол (Maximize2)

## Как работает

### Для панелей (LeftPanel, RightPanel):

```tsx
<DraggableElement
  id="streams-list"
  defaultPanel="left"
  defaultSize={{ width: 480, height: 600 }}
>
  <LeftPanel {...props} />
</DraggableElement>
```

### Для тегов облака (ShardCloud):

```tsx
<DraggableTag
  id={tagName}
  x={position.x}
  y={position.y}
  z={position.z}
  size={shard.size}
  data={shard.data}
  onClick={() => onShardClick(shard.data)}
>
  <span>{displayText}</span>
</DraggableTag>
```

### Для 3D планет (ShardCloudThreeJS):

Drag & drop работает напрямую через Three.js raycasting:
- Регистрация тегов через `registerElement()` при создании
- Проверка `editMode` перед разрешением drag'a
- Сохранение позиции через `updateLayout()` при завершении

## Ключевые концепции

### 1. Авто-регистрация "с рождения"

Каждый элемент автоматически регистрируется в LayoutContext при монтировании:

```typescript
useEffect(() => {
  registerElement(id, {
    panel: defaultPanel,
    size: defaultSize,
    position: defaultPosition
  });
}, [id]);
```

### 2. Режим-зависимое поведение

```typescript
const canMove = editMode === 'move' || editMode === 'full';
const canResize = editMode === 'resize' || editMode === 'full';
```

### 3. localStorage персистентность

Все позиции и размеры сохраняются в `localStorage` под ключом `aurawave_layout_v1`:

```typescript
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
}, [layouts]);
```

### 4. Constraints (ограничения)

Каждый элемент имеет минимальные и максимальные размеры:

```typescript
minSize: { width: 100, height: 50 }
maxSize: { width: 800, height: 600 }
```

## Добавление новых перемещаемых элементов

### 1. Оберните компонент в DraggableElement:

```tsx
<DraggableElement
  id="unique-id"
  showHandle={true}
  resizable={true}
  defaultPanel="float"
  defaultSize={{ width: 400, height: 300 }}
  defaultPosition={{ x: 100, y: 100 }}
>
  <YourComponent />
</DraggableElement>
```

### 2. ID должен быть уникальным

- Используйте префиксы: `streams-list`, `custom-nodes`, `player-controls`
- Для тегов: `tag-${name.replace(/[^a-zA-Z0-9]/g, '-')}`
- Для 3D: `tag-3d-${name.replace(/[^a-zA-Z0-9]/g, '-')}`

### 3. Выберите параметры:

- **showHandle**: показывать ли маркер перетаскивания (GripVertical)
- **resizable**: можно ли изменять размер
- **defaultPanel**: начальная панель ('left', 'right', 'float')
- **defaultSize**: начальный размер (опционально)
- **defaultPosition**: начальная позиция (опционально)

## API LayoutContext

### Хук useLayout():

```typescript
const {
  layouts,           // Map всех layouts
  editMode,          // Текущий режим
  setEditMode,       // Установить режим
  registerElement,   // Зарегистрировать элемент
  updateLayout,      // Обновить layout
  moveElement,       // Переместить элемент
  resetLayout,       // Сбросить все layouts
  isDragging,        // ID перетаскиваемого элемента
  isResizing         // ID изменяемого элемента
} = useLayout();
```

### Типы:

```typescript
interface ElementLayout {
  id: string;
  panel: 'left' | 'right' | 'top' | 'bottom' | 'float';
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  order: number;
  visible: boolean;
  locked?: boolean;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}

type LayoutEditMode = 'normal' | 'move' | 'resize' | 'full';
```

## Примеры использования

### Пример 1: Перемещаемая панель

```tsx
import { DraggableElement } from './components/UI/DraggableElement';

<DraggableElement
  id="my-panel"
  defaultPanel="left"
  showHandle={true}
  resizable={false}
>
  <div className="p-4 bg-black/20">
    <h2>My Panel</h2>
  </div>
</DraggableElement>
```

### Пример 2: Перемещаемый и изменяемый модуль

```tsx
<DraggableElement
  id="discovery-module"
  defaultPanel="float"
  defaultSize={{ width: 600, height: 400 }}
  defaultPosition={{ x: 200, y: 100 }}
  showHandle={true}
  resizable={true}
>
  <DiscoveryModule />
</DraggableElement>
```

### Пример 3: Условная обертка (только в режиме редактирования)

```tsx
const { editMode } = useLayout();

{editMode !== 'normal' ? (
  <DraggableElement id="element" {...props}>
    <MyComponent />
  </DraggableElement>
) : (
  <MyComponent />
)}
```

## Troubleshooting

### Проблема: Элемент не перемещается

**Решение:**
- Убедитесь что `editMode !== 'normal'`
- Проверьте что `showHandle={true}`
- Проверьте что элемент не заблокирован (`locked: false`)

### Проблема: Позиция не сохраняется

**Решение:**
- Проверьте localStorage в DevTools
- Ключ должен быть `aurawave_layout_v1`
- Убедитесь что ID элемента уникален

### Проблема: Drag конфликтует с другими взаимодействиями

**Решение:**
- Для ShardCloud: проверьте `editMode === 'normal'` перед старым drag'ом
- Для THREE.js: используйте `canMove` проверку перед raycasting drag'ом

### Проблема: Элемент выходит за границы экрана

**Решение:**
- Установите `minSize` и `maxSize`
- В handleDragEnd добавьте проверку границ viewport

## Roadmap

### Планируемые функции:

- ✅ Базовый drag & drop
- ✅ Режимы редактирования
- ✅ localStorage персистентность
- ✅ Интеграция с ShardCloud
- ✅ Интеграция с ShardCloudThreeJS
- ⏹️ Drop zones с подсветкой
- ⏹️ Snap-to-grid
- ⏹️ Undo/Redo
- ⏹️ Export/Import layouts
- ⏹️ Presets (сохраненные раскладки)

## Связанные файлы

- [LayoutContext.tsx](src/contexts/LayoutContext.tsx) - Центральный контекст
- [DraggableElement.tsx](src/components/UI/DraggableElement.tsx) - Обертка для элементов
- [DraggableTag.tsx](src/components/Background/DraggableTag.tsx) - Обертка для тегов
- [ShardCloud.tsx](src/components/Background/ShardCloud.tsx) - CSS3D облако с drag & drop
- [ShardCloudThreeJS.tsx](src/components/Background/ShardCloudThreeJS.tsx) - THREE.js облако с drag & drop
- [App.tsx](src/App.tsx) - UI режима редактирования

---

**Последнее обновление:** 2024 (после интеграции в облако тегов)
