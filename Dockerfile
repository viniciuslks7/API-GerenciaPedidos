# ============================================
# Dockerfile — Jitterbit Order API
# Multi-stage build para imagem otimizada
# ============================================

# Etapa 1: Instalação de dependências
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Etapa 2: Imagem final de produção
FROM node:20-alpine AS production
WORKDIR /app

# Copia dependências da etapa anterior
COPY --from=dependencies /app/node_modules ./node_modules

# Copia código-fonte
COPY package*.json ./
COPY src/ ./src/

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Expõe a porta da API
EXPOSE 3000

# Health check do container
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "src/app.js"]
