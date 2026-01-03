# 🚀 Стратегия Развертывания AuraWave на VPS

## 📋 Текущая Ситуация

У вас есть:
- ✅ VS Code локально
- ✅ VPS с SSH доступом
- ✅ Домен chefai.kz
- ✅ Поддомены
- ✅ n8n уже работает
- ✅ Проект AuraWave (React/Vite)

**Цель**: Развернуть AuraWave на VPS и связать все компоненты.

---

## 🎯 Рекомендуемая Стратегия (Простейший Вариант)

### Вариант A: GitHub Pages (САМЫЙ ПРОСТОЙ) ⭐

**Преимущества:**
- Бесплатно
- Автоматический деплой при push в GitHub
- HTTPS сертификаты автоматически
- Не нужно настраивать VPS

**Шаги:**
1. Добавьте в `package.json`:
```json
{
  "homepage": "https://lolgin.github.io/chefai.kz",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

2. Установите gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Деплой одной командой:
```bash
npm run deploy
```

4. Настройте custom domain в GitHub Settings → Pages

**Минусы:** Нет серверной части (но для статического React это идеально)

---

### Вариант B: Vercel (РЕКОМЕНДУЕТСЯ) ⭐⭐⭐

**Преимущества:**
- Бесплатно для hobby проектов
- Автоматический деплой из GitHub
- HTTPS автоматически
- Свой домен подключается легко
- Preview для каждого PR

**Шаги:**
1. Зарегистрируйтесь на https://vercel.com
2. Подключите GitHub репозиторий
3. Vercel автоматически определит что это Vite проект
4. Добавьте ваш домен chefai.kz в настройках
5. Всё! Каждый push автоматически деплоится

**Настройка домена:**
- В DNS вашего домена добавьте CNAME запись:
  ```
  @ -> cname.vercel-dns.com
  или
  app -> cname.vercel-dns.com
  ```

---

### Вариант C: VPS с Nginx (ПОЛНЫЙ КОНТРОЛЬ)

Если нужен полный контроль и уже есть VPS, вот пошаговый план:

#### Шаг 1: Подготовка VPS

```bash
# Подключитесь к VPS
ssh user@chefai.kz

# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Установите Nginx
sudo apt install -y nginx

# Установите certbot для SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### Шаг 2: Настройка проекта на VPS

```bash
# Создайте директорию для проекта
sudo mkdir -p /var/www/aurawave
sudo chown $USER:$USER /var/www/aurawave

# Клонируйте репозиторий
cd /var/www/aurawave
git clone https://github.com/lolgin/chefai.kz.git .

# Установите зависимости
npm install

# Соберите проект
npm run build

# dist/ теперь содержит готовое приложение
```

#### Шаг 3: Настройка Nginx

Создайте файл конфигурации:

```bash
sudo nano /etc/nginx/sites-available/aurawave
```

Вставьте конфигурацию:

```nginx
server {
    listen 80;
    server_name app.chefai.kz;  # или любой поддомен
    
    root /var/www/aurawave/dist;
    index index.html;
    
    # Поддержка React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/aurawave /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Шаг 4: SSL сертификат

```bash
sudo certbot --nginx -d app.chefai.kz
```

#### Шаг 5: Автоматический деплой (CI/CD)

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install and Build
        run: |
          npm install
          npm run build
      
      - name: Deploy to VPS
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "dist/*"
          target: "/var/www/aurawave/"
```

Добавьте секреты в GitHub Settings → Secrets:
- `VPS_HOST`: IP или домен VPS
- `VPS_USER`: SSH пользователь
- `VPS_SSH_KEY`: Приватный SSH ключ

---

## 🔧 Вариант D: Docker + Docker Compose (ПРОФЕССИОНАЛЬНЫЙ)

Если хотите изолировать приложение и упростить деплой:

### Создайте `Dockerfile`:

```dockerfile
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Создайте `docker-compose.yml`:

```yaml
version: '3.8'
services:
  aurawave:
    build: .
    ports:
      - "3000:80"
    restart: unless-stopped

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

volumes:
  n8n_data:
```

### Деплой:

```bash
# На VPS
cd /var/www/aurawave
git pull
docker-compose up -d --build
```

---

## 📊 Сравнение Вариантов

| Критерий | GitHub Pages | Vercel | VPS (Nginx) | Docker |
|----------|--------------|--------|-------------|--------|
| Простота | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Скорость настройки | 5 мин | 5 мин | 30-60 мин | 20 мин |
| Стоимость | Бесплатно | Бесплатно | $5-10/мес | $5-10/мес |
| Контроль | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Auto Deploy | ✅ | ✅ | ⚙️ (настройка) | ⚙️ (настройка) |
| Custom Domain | ✅ | ✅ | ✅ | ✅ |
| HTTPS | ✅ | ✅ | ⚙️ (certbot) | ⚙️ (certbot) |

---

## 🎯 Моя Рекомендация

Для вашей ситуации (устали, нужно быстро):

### **Используйте Vercel!** ⭐

**Почему:**
1. Настройка за 5 минут
2. Автоматический деплой из GitHub
3. Бесплатно
4. HTTPS автоматически
5. Custom domain легко
6. VPS можете оставить для n8n

**Шаги:**
1. Идите на https://vercel.com/signup
2. "Import Git Repository" → выберите ваш репозиторий
3. Vercel автоматически определит настройки
4. Нажмите "Deploy"
5. В настройках добавьте домен app.chefai.kz
6. Готово! ✨

**Все следующие изменения автоматически деплоятся при push в GitHub.**

---

## 🔍 Диагностика Текущего Состояния

Чтобы я мог дать более точные рекомендации, выполните эти команды и покажите вывод:

### На локальной машине:
```bash
# Проверка Node.js
node --version
npm --version

# Проверка Git
git remote -v

# Текущая ветка
git branch

# Локальная сборка работает?
npm run build
```

### На VPS (по SSH):
```bash
# Подключитесь
ssh user@chefai.kz

# Проверьте систему
uname -a
cat /etc/*release

# Проверьте установленное
which nginx
which node
which docker

# Проверьте порты
sudo netstat -tulpn | grep LISTEN

# Проверьте домены
cat /etc/nginx/sites-available/*
```

---

## 📝 Следующие Шаги

**Вариант 1 (Рекомендуется - Vercel):**
1. Зарегистрируйтесь на Vercel
2. Импортируйте репозиторий
3. Добавьте домен
4. Всё работает!

**Вариант 2 (VPS):**
1. Покажите мне вывод команд диагностики
2. Я создам точный скрипт для вашего VPS
3. Запустите скрипт
4. Настроим автодеплой

**Вариант 3 (GitHub Pages):**
1. Я добавлю конфиг в репозиторий
2. Вы запустите `npm run deploy`
3. Настроите DNS

---

## 🆘 Если Что-то Не Работает

1. **Показывайте ошибки полностью** - скриншот или текст
2. **Команда которую запустили**
3. **На какой машине** (локально или VPS)
4. **Вывод терминала**

Я помогу разобраться!

---

## 💡 Быстрый Старт (Прямо Сейчас)

Если хотите **прямо сейчас** увидеть результат:

```bash
# На вашей локальной машине
npm run build
npx serve dist

# Откройте http://localhost:3000
# Это то, что увидят пользователи!
```

Для публичного доступа:
```bash
# Установите ngrok
npm install -g ngrok

# Запустите туннель
npx serve dist &
ngrok http 3000

# Получите публичный URL вида https://xxx.ngrok.io
# Им можно делиться для тестирования
```

---

**Какой вариант выбираем? Скажите и я подготовлю точную инструкцию!** 🚀
