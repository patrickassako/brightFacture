FROM node:20-alpine

RUN apk add --no-cache chromium nss freetype harfbuzz python3 make g++

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src
COPY public ./public
COPY templates ./templates

RUN npm run build && \
    npm ci --only=production && \
    mkdir -p data output logs

EXPOSE 3000

CMD ["node", "dist/index.js"]
