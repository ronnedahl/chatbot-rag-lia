
# Stage 1: Bygga applikationen (Builder stage)
FROM node:24-alpine AS builder
WORKDIR /app

# Kopiera package.json och package-lock.json (eller yarn.lock om du använder yarn)
COPY package*.json ./

# Installera alla beroenden (inklusive devDependencies som typescript för att bygga)
# 'npm ci' är att föredra om du har en package-lock.json för deterministiska builds
RUN npm ci
# Alternativt, om du inte har en lock-fil eller har problem med ci:
# RUN npm install

# Kopiera resten av källkoden
COPY . .

# Kör build-skriptet från package.json (som kör 'npx tsc -p tsconfig.json')
RUN npm run build
# Detta skapar 'dist'-mappen med kompilerad JavaScript

# Stage 2: Produktionsavbild (Final stage)
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production

# Kopiera package.json och package-lock.json för att installera *endast* produktionsberoenden
COPY package*.json ./
RUN npm ci --only=production
# Alternativt, om du inte har en lock-fil:
# RUN npm install --only=production

# Kopiera den kompilerade koden från builder-steget
COPY --from=builder /app/dist ./dist

# Om du har några andra assets som din app behöver i roten eller en public-mapp, kopiera dem också
# Exempel: COPY --from=builder /app/public ./public

EXPOSE 3003

# Kör start-skriptet från package.json (som kör 'node dist/server.js')
CMD ["npm", "start"]