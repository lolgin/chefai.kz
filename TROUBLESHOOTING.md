# 🐛 Решение Проблем / Troubleshooting

## Белый экран при развертывании (White Screen Issue)

### Проблема
После развертывания на Vercel/Netlify/хостинг видите белый экран.

### Причина
В оригинальном `index.html` был `importmap` для ESM модулей, который конфликтовал с Vite bundler.

### Решение ✅
**Обновлено в commit:** Удален importmap из index.html

Теперь приложение корректно собирается и работает на всех платформах.

### Если проблема осталась:

#### 1. Проверьте консоль браузера (F12)
Откройте Developer Tools → Console и посмотрите ошибки.

**Типичные ошибки:**

**a) "Failed to fetch" или CORS ошибки**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Решение:** Это нормально для некоторых радиостанций. Просто выберите другую станцию.

**b) "Uncaught SyntaxError" или "Unexpected token"**
```
Uncaught SyntaxError: Unexpected token '<'
```
**Решение:** Проблема с путями. Убедитесь что `vercel.json` создан (уже есть в репозитории).

**c) "process is not defined"**
```
ReferenceError: process is not defined
```
**Решение:** Проблема с переменными окружения. В Vercel добавьте:
- Settings → Environment Variables
- Добавьте `GEMINI_API_KEY` (опционально)

#### 2. Проверьте локальную сборку
```bash
# Соберите проект
npm run build

# Проверьте результат
npm run preview

# Откройте http://localhost:4173
# Должно работать!
```

Если локально работает, но на Vercel нет:

#### 3. Проверьте настройки Vercel

**Build & Development Settings:**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**Root Directory:** оставьте пустым (если проект в корне репозитория)

#### 4. Проверьте логи сборки Vercel

1. Зайдите в Vercel Dashboard
2. Выберите ваш проект
3. Откройте последний Deploy
4. Посмотрите вкладку "Build Logs"
5. Ищите ошибки (красный текст)

**Типичные ошибки сборки:**

**"Command failed with exit code 1"**
```
Error: Cannot find module 'react'
```
**Решение:** 
```bash
# Локально
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**"Out of memory"**
```
FATAL ERROR: Reached heap limit
```
**Решение:** Увеличьте Node memory в `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

#### 5. Очистите кэш Vercel

В Vercel Dashboard:
1. Settings → General
2. Scroll to "Build & Development Settings"
3. Clear Build Cache
4. Redeploy

#### 6. Проверьте файловую структуру

Убедитесь что структура правильная:
```
/
├── index.html          ← Должен быть в корне!
├── package.json
├── vite.config.ts
├── vercel.json         ← Должен быть!
└── src/
    ├── index.tsx
    ├── App.tsx
    └── ...
```

## Проблемы с аудио

### Аудио не воспроизводится

**Причина:** Web Audio API требует взаимодействия пользователя.

**Решение:** Нажмите кнопку "BOOT_SYSTEM" перед воспроизведением.

### Кнопка Play не работает

1. Проверьте консоль браузера (F12)
2. Нажмите "BOOT_SYSTEM" сначала
3. Попробуйте другую радиостанцию

### Ошибка "Failed to load audio"

**Причины:**
- Станция офлайн
- CORS блокирует запрос
- Неверный URL

**Решение:** Попробуйте другую станцию из списка слева.

## Проблемы с темами

### Тема не меняется

1. Откройте модуль "THEME" (кнопка с иконкой палитры)
2. Нажмите на нужную тему
3. Тема должна измениться мгновенно

Если не меняется:
- Проверьте консоль (F12)
- Очистите кэш браузера (Ctrl+Shift+R)
- Проверьте localStorage (F12 → Application → Local Storage)

## Проблемы с поиском

### Поиск не находит станции

**Причина:** Radio Browser API может быть недоступен.

**Решение:**
1. Проверьте интернет соединение
2. Подождите 2-3 секунды после ввода
3. Попробуйте другой запрос (например, "Jazz", "Rock")

### Станции не воспроизводятся

Не все станции работают 24/7. Попробуйте:
1. Использовать кнопку "🛡️" для фильтрации
2. Выбрать станции с высоким bitrate
3. Попробовать проверенные станции из левого меню

## Проблемы локальной разработки

### "npm run dev" не работает

**Ошибка: "command not found"**
```bash
# Установите Node.js
# Windows: https://nodejs.org/
# Mac: brew install node
# Linux: sudo apt install nodejs npm
```

**Ошибка: "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Ошибка: "Port 3000 already in use"**
```bash
# Измените порт в vite.config.ts:
server: {
  port: 3001,  // ← измените
}
```

### Hot Reload не работает

1. Остановите dev server (Ctrl+C)
2. Очистите кэш:
```bash
rm -rf node_modules/.vite
```
3. Запустите снова:
```bash
npm run dev
```

### Изменения не видны в браузере

1. Проверьте что файл сохранен (Ctrl+S)
2. Проверьте что нет ошибок в консоли
3. Жесткое обновление (Ctrl+Shift+R)
4. Проверьте что изменяете правильный файл в `src/`

## Получить помощь

Если проблема не решена:

1. **Откройте Issue в GitHub** с информацией:
   - Где развернули (Vercel/локально/VPS)
   - Скриншот ошибки из консоли (F12)
   - Шаги для воспроизведения

2. **Информация для отладки:**
```bash
# Версии
node --version
npm --version

# Попытка сборки
npm run build

# Логи
npm run dev > dev.log 2>&1
```

3. **Проверьте документацию:**
   - [ЗАПУСК_ЛОКАЛЬНО.md](./ЗАПУСК_ЛОКАЛЬНО.md) - локальная разработка
   - [DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md) - развертывание
   - [README.md](./README.md) - общая информация

---

**Последнее обновление:** 2026-01-03
**Версия:** v2.7.0
