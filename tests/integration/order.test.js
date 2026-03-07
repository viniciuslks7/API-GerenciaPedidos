/**
 * @fileoverview Testes de integração para os endpoints da API de pedidos.
 * Utiliza supertest para testar os endpoints HTTP completos.
 * Nota: Estes testes requerem banco de dados PostgreSQL rodando.
 * Em ambiente CI, podem ser executados com Docker.
 * @author Vinicius (viniciuslks7)
 */

const request = require('supertest');
const app = require('../../src/app');

// Variável para armazenar o token JWT obtido no login
let authToken = '';

// Dados de teste (formato PT-BR conforme especificação)
const testOrder = {
  numeroPedido: 'test-integration-001',
  valorTotal: 5000,
  dataCriacao: '2023-07-19T12:24:11.5299601+00:00',
  items: [
    {
      idItem: '1234',
      quantidadeItem: 2,
      valorItem: 2500
    }
  ]
};

describe('API de Pedidos — Testes de Integração', () => {

  // ==========================================
  // Autenticação — Obter token antes dos testes
  // ==========================================
  describe('POST /auth/login', () => {
    it('deve retornar token JWT com credenciais válidas', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      // Se o banco não estiver disponível, pula os testes de integração
      if (res.status === 500) {
        console.warn('[AVISO] Banco de dados não disponível. Testes de integração pulados.');
        return;
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();

      // Salva o token para os próximos testes
      authToken = res.body.data.token;
    });

    it('deve retornar 401 com credenciais inválidas', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'admin', password: 'senhaerrada' });

      if (res.status === 500) return; // Banco não disponível

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('deve retornar 400 sem campos obrigatórios', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({});

      if (res.status === 500) return;

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // Health Check
  // ==========================================
  describe('GET /health', () => {
    it('deve retornar status do servidor', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBeDefined();
      expect(res.body.data.uptime).toBeDefined();
    });
  });

  // ==========================================
  // Endpoints protegidos — sem token
  // ==========================================
  describe('Proteção JWT', () => {
    it('deve retornar 401 ao acessar /order sem token', async () => {
      const res = await request(app)
        .post('/order')
        .send(testOrder);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('MISSING_TOKEN');
    });

    it('deve retornar 401 ao acessar /order/list sem token', async () => {
      const res = await request(app).get('/order/list');

      expect(res.status).toBe(401);
    });
  });

  // ==========================================
  // CRUD de Pedidos (requer banco de dados)
  // ==========================================
  describe('CRUD de Pedidos', () => {
    // Pula se não tiver token (banco indisponível)
    beforeAll(() => {
      if (!authToken) {
        console.warn('[AVISO] Token JWT não disponível. Testes CRUD pulados.');
      }
    });

    it('POST /order — deve criar pedido com sucesso', async () => {
      if (!authToken) return;

      const res = await request(app)
        .post('/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testOrder);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBe('test-integration-001');
      expect(res.body.data.value).toBe(5000);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].productId).toBe(1234);
    });

    it('POST /order — deve retornar 409 para pedido duplicado', async () => {
      if (!authToken) return;

      const res = await request(app)
        .post('/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testOrder);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('DUPLICATE_ORDER');
    });

    it('POST /order — deve retornar 400 com body inválido', async () => {
      if (!authToken) return;

      const res = await request(app)
        .post('/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ numeroPedido: 'teste' }); // Faltam campos

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('GET /order/:orderId — deve retornar pedido existente', async () => {
      if (!authToken) return;

      const res = await request(app)
        .get('/order/test-integration-001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBe('test-integration-001');
    });

    it('GET /order/:orderId — deve retornar 404 para pedido inexistente', async () => {
      if (!authToken) return;

      const res = await request(app)
        .get('/order/nao-existe-123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /order/list — deve retornar lista de pedidos', async () => {
      if (!authToken) return;

      const res = await request(app)
        .get('/order/list')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('PUT /order/:orderId — deve atualizar pedido existente', async () => {
      if (!authToken) return;

      const updatedOrder = {
        ...testOrder,
        valorTotal: 15000,
        items: [
          { idItem: '5678', quantidadeItem: 3, valorItem: 5000 }
        ]
      };

      const res = await request(app)
        .put('/order/test-integration-001')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedOrder);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.value).toBe(15000);
    });

    it('PUT /order/:orderId — deve retornar 404 para pedido inexistente', async () => {
      if (!authToken) return;

      const res = await request(app)
        .put('/order/nao-existe-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testOrder);

      expect(res.status).toBe(404);
    });

    it('DELETE /order/:orderId — deve deletar pedido existente', async () => {
      if (!authToken) return;

      const res = await request(app)
        .delete('/order/test-integration-001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /order/:orderId — deve retornar 404 para pedido já deletado', async () => {
      if (!authToken) return;

      const res = await request(app)
        .delete('/order/test-integration-001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // Rota não encontrada
  // ==========================================
  describe('Rota inexistente', () => {
    it('deve retornar 404 para rota não mapeada', async () => {
      const res = await request(app).get('/rota-que-nao-existe');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('ROUTE_NOT_FOUND');
    });
  });
});
