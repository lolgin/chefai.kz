<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AuraWave - Neural Audio Console

Модульное веб-приложение для потокового воспроизведения музыки с 3D визуализацией и AI-метаданными.

View your app in AI Studio: https://ai.studio/apps/drive/1k-3u402rftSKiRFPfX94oWaxrCsanPbs

## 🚀 Quick Start

**Prerequisites:**  Node.js 18+

> **🇷🇺 Подробная инструкция на русском**: См. [ЗАПУСК_ЛОКАЛЬНО.md](./ЗАПУСК_ЛОКАЛЬНО.md)
> 
> **🚀 Деплой на сервер**: См. [DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (optional)

3. Run the app:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser

4. Build for production:
   ```bash
   npm run build
   ```

## 📁 Project Structure (Modular Architecture)

Проект был рефакторен из монолитного App.tsx (509 строк) в модульную структуру для улучшения поддерживаемости:

```
src/
├── contexts/           # Глобальное состояние приложения
│   ├── AudioContext.tsx       # Состояние аудио плеера
│   ├── SettingsContext.tsx    # Настройки, темы, EQ
│   └── MetadataContext.tsx    # Метаданные треков
│
├── hooks/             # Переиспользуемая бизнес-логика
│   ├── useAudioPlayer.ts      # Логика управления плеером
│   ├── useStreamDiscovery.ts  # Поиск радиостанций
│   └── useSystemLogs.ts       # Системные логи
│
├── components/        # UI компоненты
│   ├── UI/
│   │   ├── Button.tsx         # Переиспользуемая кнопка
│   │   └── IconButton.tsx     # Кнопка с иконкой
│   │
│   ├── Player/
│   │   ├── PlayerControls.tsx # Play/Pause/Skip
│   │   ├── VolumeControl.tsx  # Громкость
│   │   └── TrackInfo.tsx      # Информация о треке
│   │
│   ├── Panels/
│   │   ├── LeftPanel.tsx      # Боковая панель навигации
│   │   ├── RightPanel.tsx     # Панель логов
│   │   └── ModuleSwitcher.tsx # Переключатель модулей
│   │
│   ├── Modules/
│   │   ├── DiscoveryModule.tsx # Поиск станций
│   │   ├── NodesModule.tsx     # Управление нодами
│   │   ├── ThemesModule.tsx    # Выбор тем
│   │   ├── EQModule.tsx        # Эквалайзер
│   │   └── LogsModule.tsx      # Отображение логов
│   │
│   ├── Background/
│   │   └── ShardCloud.tsx     # 3D облако тегов
│   │
│   └── Visualizer.tsx         # Аудио визуализация
│
├── services/          # Внешние сервисы
│   ├── audioEngine.ts         # Web Audio API
│   ├── streamDiscovery.ts     # Поиск потоков
│   └── geminiService.ts       # AI метаданные
│
├── types.ts           # TypeScript типы
├── constants.tsx      # Константы (провайдеры, темы)
├── App.tsx           # Главный компонент (417 строк)
└── index.tsx         # Точка входа

```

## 🎯 Key Features

- **Context API** для глобального состояния (audio, settings, metadata)
- **Custom Hooks** для переиспользуемой логики
- **Модульные компоненты** - каждый файл < 300 строк
- **TypeScript** типизация для всех компонентов
- **3D визуализация** с использованием CSS 3D transforms
- **AI-генерация метаданных** через Gemini API
- **Поиск радиостанций** через Radio Browser API

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Web Audio API** - Audio processing
- **Gemini AI** - Metadata generation
- **Lucide React** - Icons

## 📝 Development Guidelines

### Добавление нового модуля

1. Создайте компонент в `src/components/Modules/`
2. Добавьте тип модуля в `ModuleSwitcher.tsx`
3. Импортируйте и добавьте в `App.tsx`
4. Добавьте иконку в массив `modules`

### Добавление нового контекста

1. Создайте файл в `src/contexts/`
2. Экспортируйте Provider и хук `use*`
3. Оберните `<App>` в новый Provider в `index.tsx`

### Стиль кода

- Используйте **функциональные компоненты** с хуками
- Добавляйте **комментарии на русском** для сложной логики
- Держите файлы **< 300 строк**
- Используйте **TypeScript типы** из `types.ts`

## 🎨 Themes

Доступные темы в `constants.tsx`:
- **Frost** - светлая минималистичная
- **Neon Overdrive** - киберпанк неон
- **Acid Matrix** - зеленая матрица
- **Starship HUD** - оранжевый космос
- **Luxury Void** - черно-золотая
- **Abyssal Depth** - глубокий синий
- **Biopunk Core** - биотехно зеленый

## 🔊 Audio Providers

- **SomaFM** - Electronic, ambient channels
- **Nightride FM** - Synthwave, cyberpunk
- **Gen-AI Synth** - AI-generated metadata
- **Neural Focus** - Coding music
- **Bass & Beats** - DnB, dubstep
- **Custom Nodes** - User-added stations

## 🐛 Troubleshooting

**Build errors:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**Audio not playing:**
- Check browser console for CORS errors
- Ensure audioEngine is initialized
- Verify stream URL is valid

## 📄 License

MIT License - see LICENSE file for details
