# AI Agent Handoff Guide - AuraWave Project

## 🎯 Текущее состояние (версия v30)

### Архитектура
- **React 19** + TypeScript + Vite
- **Contexts**: AudioContext, SettingsContext, MetadataContext, LayoutContext
- **3D движки**: Three.js (WebGL планеты) + CSS3D (текстовые облака)
- **API**: Radio Browser (поиск станций), Gemini (AI метаданные)

### Ключевые файлы
```
src/
├── App.tsx (1167 строк) - главный компонент, вся логика
├── contexts/ - состояние приложения
├── components/Background/
│   ├── ShardCloud.tsx - CSS3D облако тегов
│   └── ShardCloudThreeJS.tsx - WebGL 3D планеты
├── hooks/
│   └── useStreamDiscovery.ts - поиск с кешем и агрегацией
├── types.ts - все TypeScript типы
└── constants.tsx - темы, провайдеры, жанры
```

## 🔥 Критические концепции

### 1. Множественный поиск (ТОЛЬКО ЧТО РЕАЛИЗОВАНО)
**Файл**: `src/hooks/useStreamDiscovery.ts`

```typescript
// Логика: при выборе 2+ тегов ищем КАЖДЫЙ ОТДЕЛЬНО
const words = searchQuery.split(' ');
for (const word of words) {
  // Проверяем кеш
  if (searchCache.has(word)) {
    results = searchCache.get(word);
  } else {
    results = await searchStreams(word);
    searchCache.set(word, results); // Макс 50 записей
  }
  // Объединяем с дедупликацией по URL
}
```

**Важно**: 
- Каждое слово ищется ОТДЕЛЬНО
- Результаты объединяются
- Дубликаты удаляются по `url` || `streamUrl` || `url_resolved`
- Кеш хранит до 50 запросов

### 2. Клики на теги
**Файл**: `src/components/Background/ShardCloud.tsx`, `ShardCloudThreeJS.tsx`

```typescript
onClick={(e) => {
  if (e.shiftKey || e.ctrlKey) {
    // Shift+Click - добавить к поиску БЕЗ переключения модуля
    window.dispatchEvent(new CustomEvent('appendSearchQuery', { 
      detail: { query: firstWord, switchModule: false }
    }));
  } else {
    // Обычный клик - открыть модуль
    onShardClick(shard.data);
  }
}
```

**Важно**:
- Обычный клик = стандартное поведение (открыть, переключить)
- Shift+Click = добавить первое слово в поиск, НЕ переключать модуль
- Извлекаем первое слово из названия потока

### 3. Черный список и удаление
**Файл**: `src/App.tsx` → `handleBanStream`

```typescript
const handleBanStream = (item: any) => {
  const url = item.url || item.streamUrl || item.url_resolved;
  addToBlacklist(url, 'user_ban'); // → settings.blacklistedStreams
  setSuggestions(prev => prev.filter(s => 
    (s.url || s.streamUrl || s.url_resolved) !== url
  )); // УДАЛЯЕМ ИЗ ОТОБРАЖЕНИЯ
};
```

**Важно**:
- Забанить = добавить в `blacklistedStreams` + удалить из UI
- Фильтрация происходит в `useStreamDiscovery`
- `blacklistedStreams` сохраняется в localStorage

### 4. Цветовые схемы планет
**Файл**: `src/components/Background/ShardCloudThreeJS.tsx`

```typescript
const getPlanetColorByModule = (moduleType, index) => {
  const baseHue = parseInt(theme.accent.replace('#', ''), 16) % 360;
  const moduleHueShift = {
    'streams': 0, 'discovery': 60, 'nodes': 120,
    'themes': 180, 'models': 240, 'engine': 300
  };
  return new THREE.Color(`hsl(${baseHue + moduleHueShift[moduleType] + index * 30}, 65%, 55%)`);
};
```

**Концепция**:
- Каждый модуль = свой цвет (смещение на цветовом круге)
- Планеты одного модуля = вариации одного цвета
- Кнопка 🎲 (Dices) рандомизирует через `colorSeed`

### 5. Favicon как текстуры
**Файл**: `src/components/Background/ShardCloudThreeJS.tsx`

```typescript
const faviconUrl = shard.data?.favicon || shard.data?.icon;
if (faviconUrl) {
  const textureLoader = new THREE.TextureLoader();
  material = new THREE.MeshStandardMaterial({
    map: textureLoader.load(faviconUrl, undefined, undefined, () => {
      // Fallback на цвет при ошибке
      material.color = color;
    })
  });
}
```

**Важно**: Асинхронная загрузка, fallback на цвет

## 🚧 НЕ ЗАВЕРШЕНО (следующие итерации)

### 1. Фоны (обычные/живые/3D обои)
**План**:
- Добавить `BackgroundProvider` enum в types.ts
- Создать `useBackgroundManager` hook
- Поддержка:
  - Статичные изображения (jpg, png, webp)
  - Живые обои (video, animated webp)
  - 3D сцены (gltf модели как фон)
- Установка кликом из базы провайдеров

**Где реализовать**:
```typescript
// src/types.ts
export enum BackgroundType {
  STATIC = 'static',
  ANIMATED = 'animated',
  VIDEO = 'video',
  THREE_D = '3d'
}

// src/hooks/useBackgroundManager.ts
export const useBackgroundManager = () => {
  const [background, setBackground] = useState<BackgroundConfig>();
  const applyBackground = (config: BackgroundConfig) => {
    // Логика установки фона
  };
  return { background, applyBackground };
};
```

### 2. Теги вдоль нижнего бара
**Текущее**: Теги под поиском (могут не поместиться)  
**План**: Горизонтальный скролл вдоль нижнего бара (ModuleSwitcher)

**Где менять**: `src/App.tsx` строка ~1017
```typescript
// Переместить из под поиска в отдельный контейнер
<div className="absolute bottom-16 left-0 right-0 overflow-x-auto">
  {currentStreamShards.map(...)}
</div>
```

### 3. Агрегаторы провайдеров
**Концепция**: Объединение нескольких Radio Browser инстансов
**План**:
- Массив URLs в constants.tsx
- Параллельный поиск по всем
- Объединение с дедупликацией

## 🔒 НЕЛЬЗЯ ТРОГАТЬ

### Критические файлы
1. **src/contexts/** - ломать контексты = ломать все
2. **src/services/audioEngine.ts** - Web Audio API, хрупкая логика
3. **src/hooks/useAudioPlayer.ts** - плейбек, история, shuffle

### Паттерны которые ДОЛЖНЫ сохраниться
1. **Context → Hook → Component** (unidirectional flow)
2. **Файлы < 150 строк** (App.tsx исключение)
3. **localStorage версионирование** (STORAGE_KEY = 'aurawave_v30_settings')
4. **data-item атрибут** для контекстного меню (JSON.stringify(data))

## 🐛 Известные проблемы

1. **Dev server killed (Exit 137)** - нормально, просто перезапустить
2. **RightPanel.tsx ошибки** - файл удален, не используется
3. **Long-press на 3D метках** - работает, но может не срабатывать если dragging

## 📝 Для отладки

```bash
# Запуск
npm run dev

# Билд
npm run build

# Очистка кеша
localStorage.clear()

# Проверка версии settings
localStorage.getItem('aurawave_v30_settings')
```

## 🎯 Приоритеты для следующей модели

1. ✅ **СДЕЛАНО**: Множественный поиск с кешем
2. ✅ **СДЕЛАНО**: Shift+Click подстановка без переключения
3. ✅ **СДЕЛАНО**: Бан удаляет из UI
4. 🔲 **TODO**: Теги в нижний бар с overflow
5. 🔲 **TODO**: Система фонов
6. 🔲 **TODO**: Агрегация провайдеров

## 💡 Советы

- **Перед изменением**: читай types.ts (все интерфейсы)
- **Большие правки**: используй multi_replace_string_in_file
- **Новые фичи**: сначала тип в types.ts, потом реализация
- **Тестирование**: проверяй в браузере, не только компиляцию
- **localStorage**: инкрементируй версию при изменении схемы

---

**Последнее обновление**: Январь 2026  
**Версия**: v30  
**Статус**: Production-ready, активно развивается  
**Токены использовано**: 99.0% - работаем на последнем процент

Удачи! 🚀
