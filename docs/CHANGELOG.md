# 📋 Changelog — jitterbit-order-api

> Registro de todas as alterações significativas do projeto.
> Revisado e mantido por: **Vinicius** (`viniciuslks7`)

## [1.0.0] — 07/03/2026

### ✨ Adicionado

- **Constituição do Projeto** (`.github/copilot-instructions.md`) com todos os padrões e regras
- **Estrutura base** do projeto Node.js com Express.js
- **Configuração do banco de dados** PostgreSQL com pool de conexões
- **Script de inicialização** do banco (`npm run db:init`) com criação de tabelas e usuário admin
- **Mapper de dados** (`src/utils/mapper.js`) — transformação PT-BR → EN conforme especificação
- **Model de pedidos** (`src/models/orderModel.js`) — CRUD com queries SQL parametrizadas e transações
- **Service de pedidos** (`src/services/orderService.js`) — lógica de negócio e orquestração
- **Controller de pedidos** (`src/controllers/orderController.js`) — orquestração request/response
- **Endpoints CRUD**:
  - `POST /order` — criar pedido (201)
  - `GET /order/:orderId` — buscar por ID (200/404)
  - `GET /order/list` — listar todos (200)
  - `PUT /order/:orderId` — atualizar (200/404)
  - `DELETE /order/:orderId` — deletar (200/404)
- **Autenticação JWT** com middleware de proteção
  - `POST /auth/login` — obter token
  - Usuário padrão: admin / admin123
- **Validação de dados** com `express-validator`
- **Tratamento global de erros** com respostas padronizadas
- **Documentação Swagger/OpenAPI** interativa em `GET /api-docs`
- **Health Check** em `GET /health` com verificação do banco
- **Segurança**: `helmet`, `cors`, `express-rate-limit`, `compression`
- **Graceful Shutdown** para encerramento limpo do servidor
- **Testes unitários** para mapper e service (Jest)
- **Testes de integração** para endpoints (Supertest)
- **Docker** — `Dockerfile` multi-stage + `docker-compose.yml` com API + PostgreSQL
- **Documentação completa** em `docs/` (CHANGELOG, DECISIONS, API, SETUP)

---

> 📅 Última atualização: 07/03/2026
