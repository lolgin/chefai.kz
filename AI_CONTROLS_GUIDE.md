# AI Controls Guide - Gemini Integration

## 🤖 Quick Start

### Открытие AI Panel
1. Откройте модуль **MODELS** (иконка Layers в header)
2. Кликните на иконку **Sliders** (⚙️) в правом верхнем углу
3. Панель управления AI откроется под header'ом

---

## 🎛️ Controls Reference

### 1. **Gemini AI Assistant** (Toggle)
- **Enabled (✓)**: AI автоматически подбирает 3D модели по контексту тегов
- **Disabled (✗)**: Используются дефолтные модели (sphere)
- **Как работает**: 
  - Анализирует название станции, жанр, теги
  - Выбирает best-match из 24+ primitives
  - Кеширует результаты для performance

**Example**: 
- Tag "Deep Space One" → AI выберет `planet_basic`
- Tag "Techno Radio" → AI выберет `gear` или `circuit`

---

### 2. **Temperature Slider** (0.00 - 1.00)
Контролирует "креативность" AI при выборе моделей:

- **0.00 - 0.30** (🎯 Precise): 
  - Строгие, предсказуемые выборы
  - Только прямые совпадения ключевых слов
  - Рекомендуется для production

- **0.40 - 0.60** (Balanced):
  - Умеренная креативность
  - Может давать неожиданные, но логичные результаты
  - Default: **0.70**

- **0.70 - 1.00** (🎨 Creative):
  - Максимальная креативность
  - Может выбирать абстрактные модели
  - Для экспериментов и эстетических эффектов

**Technical**: Влияет на Gemini API параметр `temperature` в `generateContent()`

---

### 3. **External Aggregators** (Toggle)
- **ON (✓)**: Поиск моделей в внешних источниках
- **OFF (✗)**: Только встроенные 24 primitives

**Supported Aggregators**:
- 🟢 **Sketchfab** - Миллионы user-generated 3D моделей
- 🟢 **Poly Haven** - Open-source, высокое качество
- 🟡 **Ready Player Me** - Avatars (planned)
- 🟡 **Mixamo** - Animated characters (planned)

**Status**: 🚧 Infrastructure готова, API интеграция в progress

---

### 4. **AI Status Panel**
Показывает текущее состояние AI системы:

```
Model: gemini-2.0-flash     ← Используемая модель
Features: 5 active          ← Активные возможности
```

**5 Active Features**:
1. Smart model matching (70+ keyword mappings)
2. Natural language commands
3. Context-aware descriptions
4. Temperature control
5. Aggregator integration (partial)

**Pulse Animation**: Иконка Cpu "дышит" когда AI enabled

---

### 5. **💬 Ask Gemini** (Natural Language Input)

Вводите запросы на естественном языке:

**Example Queries**:
```
"find a space model for ambient tags"
"choose geometric shapes for techno stations"
"use organic models for nature sounds"
"switch to cyberpunk style"
"make all models animated"
```

**How it works**:
1. Вводите текст в поле
2. Enter или кнопка "Ask"
3. Gemini анализирует запрос
4. Возвращает JSON команду: `{action, params, reasoning}`
5. Система выполняет действие

**Available Actions** (from geminiAIOrchestrator):
- `change_model` - Смена текущей модели
- `change_theme` - Переключение темы
- `change_layout` - Изменение layout'а облака
- `adjust_eq` - Настройка эквалайзера
- `search_stream` - Поиск радиостанций

**Current Status**: 🚧 UI готов, handler implementation pending

---

## 🔧 Technical Details

### API Configuration
```bash
# .env.local
VITE_GEMINI_API_KEY=AIzaSyAkgn1OutFc2arEIE1_bdb5G0igE1XdWxg
VITE_GEMINI_PROJECT_ID=gen-lang-client-0461369403
```

### Code Architecture
```
src/services/
  ├── geminiAIOrchestrator.ts    # Natural language commands
  ├── geminiModelService.ts      # Full parameter control
  ├── modelMatcher.ts            # Smart keyword→model mapping
  └── geminiService.ts           # Original metadata generator

src/components/Modules/
  └── ModelsModule.tsx           # UI with AI controls

src/styles/
  └── ai-controls.css            # Slider, animations, pulse
```

### Performance Optimizations
1. **Model URL Caching**: `Map<string, string>` кеш в modelMatcher
2. **Lazy Loading**: Модели загружаются только когда видимы
3. **Debouncing**: Natural language input 300ms debounce
4. **Request Batching**: Aggregator queries батчатся по 10

---

## 🎨 Visual Customization

### Temperature Slider Colors
Gradient отражает креативность:
- **Blue** (0.0) → Precise logic
- **Purple** (0.5) → Balanced
- **Pink** (1.0) → Maximum creativity

### AI Toggle Animation
Hover эффект: White shine sweeps across button (0.5s transition)

### Status Pulse
Active AI icon пульсирует (2s cycle) для visual feedback

---

## 🐛 Troubleshooting

### AI не выбирает модели
1. Проверьте toggle "Gemini AI Assistant" → должен быть ✓ ENABLED
2. Откройте DevTools Console → ищите `🤖 Gemini Query:` логи
3. Проверьте API key в .env.local

### Temperature не влияет на результат
- Gemini использует temperature только для generative tasks
- Для model matching влияет на scoring threshold в modelMatcher
- Попробуйте экстремальные значения (0.0 vs 1.0) для заметной разницы

### Natural Language не работает
- **Current Status**: UI готов, backend в TODO
- Handler в ModelsModule.tsx → строки с `// TODO: Implement askGeminiForCommand`
- Проверьте console.log → должен показывать ввод

### External Aggregators не находят модели
- **Status**: API connections не подключены
- Infrastructure готова в geminiModelService.ts
- Ожидает implementation Sketchfab/Poly Haven endpoints

---

## 📊 Current Implementation Status

| Feature | Status | Description |
|---------|--------|-------------|
| AI Toggle | ✅ Complete | Enable/disable Gemini |
| Temperature Control | ✅ Complete | 0.00-1.00 slider with gradient |
| Aggregators Toggle | ✅ Complete | UI + state management |
| AI Status Panel | ✅ Complete | Model + features display |
| Natural Language Input | ⏳ Partial | UI ready, handler pending |
| Smart Model Matching | ✅ Complete | 70+ mappings, 4-tier fallback |
| External APIs | ⏹️ Pending | Sketchfab/Poly Haven integration |
| Command Execution | ⏹️ Pending | askGeminiForCommand handler |

---

## 🚀 Next Steps

1. **Implement Ask Gemini Handler**:
   ```typescript
   import { askGeminiForCommand } from '../../services/geminiAIOrchestrator';
   
   const handleAskGemini = async (query: string) => {
     const command = await askGeminiForCommand(query, systemState);
     if (command) executeCommand(command);
   };
   ```

2. **Connect Sketchfab API**:
   - OAuth authentication
   - Search endpoint: `/v3/search?q={query}&type=models`
   - Download URLs + thumbnails

3. **Add Aggregator Provider UI**:
   - Checkboxes для каждого provider
   - Wire to `gemini.updateSettings({ preferredProviders: [...] })`

4. **Real-time Model Preview**:
   - Replace emoji с mini Three.js canvas
   - 100x100px renders с rotation on hover

---

## 💡 Advanced Usage

### Custom Model Mappings
Edit [src/services/modelMatcher.ts](../src/services/modelMatcher.ts):

```typescript
const SPECIFIC_MAPPINGS: Record<string, string> = {
  'my-custom-tag': 'torus',
  'special-station': 'helix'
};
```

### Gemini Prompt Tuning
Edit [src/services/geminiAIOrchestrator.ts](../src/services/geminiAIOrchestrator.ts):

```typescript
const prompt = `You are a cyberpunk 3D model curator.
Select models that match the tag's VIBE, not just keywords.
Available models: ${MODELS.map(m => m.id).join(', ')}
...`;
```

### Temperature Response Curves
Modify scoring in modelMatcher:

```typescript
// Lower temperature = stricter thresholds
const threshold = 0.5 + (temperature * 0.3);
if (score > threshold) return modelId;
```

---

## 📚 Related Documentation

- [ADDING_VISUALIZATIONS.md](./ADDING_VISUALIZATIONS.md) - How to add new 3D models
- [COSMIC_USAGE_GUIDE.md](./COSMIC_USAGE_GUIDE.md) - Visual customization
- [AI_AGENT_QUICK_REF.md](./AI_AGENT_QUICK_REF.md) - Development quick reference

---

**Last Updated**: 2024-12-20  
**Version**: 2.0 (Gemini AI Integration)  
**API Model**: gemini-2.0-flash-exp
