# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Instalação de dependências incluindo devDependencies para o build
RUN npm install
COPY . .
# Caso utilize TypeScript ou Babel, execute o comando de transpilação
# RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
# Instalação exclusiva de dependências de produção
COPY package*.json ./
RUN npm install --only=production
# Cópia do artefato buildado ou código-fonte necessário
COPY --from=builder /app/src ./src
# Definição de usuário não-root para segurança conforme Docker Bench for Security
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]