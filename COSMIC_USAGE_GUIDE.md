# Руководство по использованию Cosmic Model System

## Быстрый старт

```typescript
import { cosmicModelManager, CosmicObjectType } from './services/cosmicModelProviders';
import { cosmicModelConverter } from './services/cosmicModelConverter';

// 1. Получить модель (с автоматическим fallback на другие провайдеры)
const model = await cosmicModelManager.getModel('Groove Salad', CosmicObjectType.PLANET);

// 2. Конвертировать в Three.js объект
const cosmicObject = await cosmicModelConverter.convert(model);

// 3. Добавить в сцену
scene.add(cosmicObject.mesh);
if (cosmicObject.rings) scene.add(cosmicObject.rings);
if (cosmicObject.atmosphere) scene.add(cosmicObject.atmosphere);
if (cosmicObject.light) scene.add(cosmicObject.light);
```

## Провайдеры

### 1. Procedural (по умолчанию)
✅ **Преимущества:**
- Мгновенная генерация
- 0 байт загрузки
- Бесконечные вариации
- Работает офлайн

❌ **Недостатки:**
- Менее реалистично

```typescript
// Автоматически используется если другие недоступны
const model = await cosmicModelManager.getModel('SomaFM', CosmicObjectType.GAS_GIANT);
// provider: PROCEDURAL
```

### 2. NASA
✅ **Преимущества:**
- Реалистичные текстуры
- Научная точность
- Официальные данные

❌ **Недостатки:**
- Ограниченный набор (Earth, Mars, Jupiter, Moon)
- ~1-2MB на текстуру

```typescript
const earth = await cosmicModelManager.getModel('Earth Radio', CosmicObjectType.PLANET);
// provider: NASA
// textureUrl: реальная текстура Земли от NASA
```

### 3. Poly Haven
✅ **Преимущества:**
- Высокое качество
- CC0 лицензия
- Много текстур

❌ **Недостатки:**
- ~500KB на текстуру
- Ограниченный космический контент

```typescript
const model = await cosmicModelManager.getModel('Space Station', CosmicObjectType.ASTEROID);
// provider: POLY_HAVEN
```

### 4. Sketchfab
✅ **Преимущества:**
- Огромная база моделей
- 3D модели (не только текстуры)

❌ **Недостатки:**
- Требуется API key
- Больший размер файлов
- Лицензии могут отличаться

```typescript
// Требуется настроить API key в cosmicModelProviders.ts
const model = await cosmicModelManager.getModel('Alien Planet', CosmicObjectType.PLANET);
// provider: SKETCHFAB
```

## Получение всех вариантов

```typescript
// Получить модели от ВСЕХ провайдеров для выбора
const variants = await cosmicModelManager.getAllVariants(
  'Groove Salad',
  CosmicObjectType.PLANET
);

// Показать пользователю выбор:
// [
//   { provider: 'procedural', size: 0 },
//   { provider: 'nasa', size: 2000000, textureUrl: '...' },
//   { provider: 'poly_haven', size: 500000, textureUrl: '...' }
// ]
```

## Автоматическое определение типа

```typescript
// Система сама определит подходящий тип объекта
const type = cosmicModelManager.inferType('SomaFM Groove Salad', 'Electronic');
// → CosmicObjectType.GAS_GIANT

const type2 = cosmicModelManager.inferType('BBC Radio 1', 'Pop');
// → CosmicObjectType.STAR (популярная станция)

const type3 = cosmicModelManager.inferType('Ambient Radio', 'Ambient');
// → CosmicObjectType.NEBULA
```

## Иерархическая навигация

```typescript
// Уровень 1: Галактика (жанр)
const galaxy = await cosmicModelManager.getModel('Electronic', CosmicObjectType.GALAXY);

// Уровень 2: Звездная система (провайдер)
const system = await cosmicModelManager.getModel('SomaFM', CosmicObjectType.STAR);

// Уровень 3: Планета (станция)
const planet = await cosmicModelManager.getModel('Groove Salad', CosmicObjectType.PLANET);

// Уровень 4: Луна (плейлист/трек)
const moon = await cosmicModelManager.getModel('Track 1', CosmicObjectType.MOON);
```

## Интеграция в существующий код

### В ShardCloud.tsx:

```typescript
import { cosmicModelManager } from '../../services/cosmicModelProviders';
import { cosmicModelConverter } from '../../services/cosmicModelConverter';

// В компоненте:
useEffect(() => {
  shards.forEach(async (shard) => {
    const type = cosmicModelManager.inferType(shard.data.name);
    const model = await cosmicModelManager.getModel(shard.data.name, type);
    const cosmicObject = await cosmicModelConverter.convert(model);
    
    // Добавить в Three.js сцену вместо текстового тега
    scene.add(cosmicObject.mesh);
  });
}, [shards]);
```

## Оптимизация производительности

### Lazy Loading
```typescript
// Загружаем только видимые объекты
const visibleShards = shards.filter(s => isVisible(s));
const models = await Promise.all(
  visibleShards.map(s => cosmicModelManager.getModel(s.data.name, s.type))
);
```

### Кэширование
```typescript
// Модели автоматически кэшируются
const model1 = await cosmicModelManager.getModel('SomaFM', type); // Загрузка
const model2 = await cosmicModelManager.getModel('SomaFM', type); // Из кэша
```

### LOD (Level of Detail)
```typescript
// Дальние объекты - procedural (быстро)
// Близкие объекты - NASA/Poly Haven (качественно)
const distance = calculateDistance(camera, object);
const provider = distance > 100 ? ModelProvider.PROCEDURAL : ModelProvider.NASA;
```

## Настройка провайдеров

### Изменить приоритет:
```typescript
// В cosmicModelProviders.ts
private preferredProviders: ModelProvider[] = [
  ModelProvider.NASA,        // Сначала пробуем NASA
  ModelProvider.PROCEDURAL,  // Потом процедурную генерацию
  ModelProvider.POLY_HAVEN,
  ModelProvider.SKETCHFAB
];
```

### Добавить свой провайдер:
```typescript
class CustomProvider {
  async search(query: string, type: CosmicObjectType): Promise<CosmicModel[]> {
    // Ваша логика
    return models;
  }
}

// Добавить в CosmicModelManager
this.providers[ModelProvider.CUSTOM] = new CustomProvider();
```

## Примеры использования

### Пример 1: Простая планета
```typescript
const model = await cosmicModelManager.getModel('Radio 1', CosmicObjectType.PLANET);
const obj = await cosmicModelConverter.convert(model);
scene.add(obj.mesh);
```

### Пример 2: Планета с кольцами
```typescript
const model = await cosmicModelManager.getModel('Saturn FM', CosmicObjectType.GAS_GIANT);
model.proceduralConfig.rings = {
  innerRadius: 1.5,
  outerRadius: 2.5,
  color: '#f4a460'
};
const obj = await cosmicModelConverter.convert(model);
scene.add(obj.mesh);
scene.add(obj.rings);
```

### Пример 3: Звезда с свечением
```typescript
const model = await cosmicModelManager.getModel('Star Radio', CosmicObjectType.STAR);
const obj = await cosmicModelConverter.convert(model);
scene.add(obj.mesh);
scene.add(obj.light); // Свет от звезды
```

## Следующие шаги

1. ✅ Установлен Three.js
2. ✅ Созданы провайдеры и конвертер
3. ⏳ Интегрировать в ShardCloud
4. ⏳ Создать Three.js сцену
5. ⏳ Добавить камеру и контроллы
6. ⏳ Реализовать навигацию по уровням
