/**
 * @fileoverview Entry point da aplicação Express.
 * Configura middlewares globais, rotas, Swagger e inicia o servidor.
 * @author Vinicius (viniciuslks7)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Importação das rotas
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

// Importação dos middlewares
const errorHandler = require('./middlewares/errorHandler');

// Importação da configuração Swagger
const swaggerSpec = require('./swagger/swagger');

// Importação do banco de dados (para health check)
const { query } = require('./config/database');

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middlewares Globais
// ==========================================

// Segurança — adiciona headers HTTP de proteção
app.use(helmet());

// CORS — permite requisições cross-origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compressão — otimiza tamanho das respostas HTTP
app.use(compression());

// Parser JSON — interpreta body das requisições como JSON
app.use(express.json());

// Rate Limiting — proteção contra abuso (100 requests por 15 min por IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use(limiter);

// ==========================================
// Rotas
// ==========================================

// Documentação Swagger (pública)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Jitterbit Order API — Docs'
}));

// Health Check (público)
app.get('/health', async (req, res) => {
  try {
    // Testa conexão com o banco de dados
    await query('SELECT 1', []);
    return res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        database: 'connected',
        timestamp: new Date().toISOString()
      },
      message: 'Servidor operacional'
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: {
        status: 'degraded',
        uptime: process.uptime(),
        database: 'disconnected',
        timestamp: new Date().toISOString()
      },
      message: 'Servidor operacional, mas banco de dados indisponível'
    });
  }
});

// Rotas de autenticação (públicas)
app.use('/auth', authRoutes);

// Rotas de pedidos (protegidas por JWT)
app.use('/order', orderRoutes);

// ==========================================
// Tratamento de Erros
// ==========================================

// Rota não encontrada (404)
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
    error: 'ROUTE_NOT_FOUND'
  });
});

// Middleware global de erros (deve ser o último)
app.use(errorHandler);

// ==========================================
// Inicialização do Servidor
// ==========================================

// Inicia o servidor apenas se não estiver em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log('============================================');
    console.log(`  🚀 Jitterbit Order API`);
    console.log(`  📡 Servidor rodando em: http://localhost:${PORT}`);
    console.log(`  📖 Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`  💚 Health Check: http://localhost:${PORT}/health`);
    console.log('============================================');
  });

  // Graceful Shutdown — fecha conexões corretamente ao desligar
  const gracefulShutdown = (signal) => {
    console.log(`\n[${signal}] Encerrando servidor graciosamente...`);
    server.close(() => {
      console.log('[Server] Servidor HTTP encerrado');
      process.exit(0);
    });

    // Força encerramento após 10 segundos
    setTimeout(() => {
      console.error('[Server] Forçando encerramento após timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Exporta o app para uso nos testes (supertest)
module.exports = app;
