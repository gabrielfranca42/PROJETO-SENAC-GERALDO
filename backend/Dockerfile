# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
# 1. Busca os arquivos de dentro da pasta backend no GitHub
COPY backend/package*.json ./
RUN npm install
# 2. Copia todo o conteúdo da pasta backend para o builder
COPY backend/ .

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
# 3. Busca o package do runtime também de dentro de backend
COPY backend/package*.json ./
RUN npm install --only=production

# 4. Copia a pasta src que foi estruturada corretamente no Stage 1 (builder)
COPY --from=builder /app/src ./src

USER node
EXPOSE 3000
CMD ["node", "src/server.js"]