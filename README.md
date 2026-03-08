# 🚀 Jitterbit Order API

> API REST para gerenciamento de pedidos — Teste Técnico Jitterbit

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4+-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v13+-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Sobre o Projeto

API REST completa para **criar, listar, atualizar e deletar pedidos** com:

- **Transformação automática de dados** — recebe JSON em PT-BR e armazena em EN no banco
- **Autenticação JWT** — endpoints protegidos com token
- **Documentação Swagger** — interface interativa para testar a API
- **Testes automatizados** — unitários e de integração
- **Docker** — suba tudo com um único comando

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **Node.js** | Runtime JavaScript |
| **Express.js** | Framework HTTP |
| **PostgreSQL** | Banco de dados relacional |
| **JWT** | Autenticação |
| **Swagger/OpenAPI** | Documentação interativa |
| **Jest + Supertest** | Testes automatizados |
| **Docker** | Containerização |
| **Helmet + CORS** | Segurança |

---

## ⚡ Início Rápido

### Com Docker (recomendado)

```bash
git clone https://github.com/viniciuslks7/API-GerenciaPedidos.git
cd API-GerenciaPedidos
cp .env.example .env
docker-compose up
```

### Sem Docker

```bash
git clone https://github.com/viniciuslks7/API-GerenciaPedidos.git
cd API-GerenciaPedidos
npm install
cp .env.example .env
# Configure o .env com suas credenciais do PostgreSQL
npm run db:init
npm run dev
```

**Acesse:**
- 🚀 API: http://localhost:3000
- 📖 Swagger: http://localhost:3000/api-docs
- 💚 Health: http://localhost:3000/health

---

## 📡 Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/auth/login` | Obter token JWT | Pública |
| `POST` | `/order` | Criar pedido | JWT |
| `GET` | `/order/list` | Listar todos os pedidos | JWT |
| `GET` | `/order/:orderId` | Obter pedido por ID | JWT |
| `PUT` | `/order/:orderId` | Atualizar pedido | JWT |
| `DELETE` | `/order/:orderId` | Deletar pedido | JWT |
| `GET` | `/health` | Health check | Pública |
| `GET` | `/api-docs` | Swagger UI | Pública |

---

## 🔑 Autenticação

1. **Obtenha o token** fazendo login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

2. **Use o token** nas requisições:

```bash
curl -X GET http://localhost:3000/order/list \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📦 Exemplo: Criar Pedido

**Request (campos em PT-BR):**
```bash
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 10000,
    "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
    "items": [
      {
        "idItem": "2434",
        "quantidadeItem": 1,
        "valorItem": 1000
      }
    ]
  }'
```

**Response (campos transformados para EN):**
```json
{
  "success": true,
  "data": {
    "orderId": "v10089015vdb-01",
    "value": 10000,
    "creationDate": "2023-07-19T12:24:11.529Z",
    "items": [
      {
        "productId": 2434,
        "quantity": 1,
        "price": 1000
      }
    ]
  },
  "message": "Pedido criado com sucesso"
}
```

---

## 🔄 Transformação de Dados

A API recebe dados em **português** e transforma automaticamente para **inglês** antes de salvar:

| Entrada (PT) | Saída (EN) | Transformação |
|---------------|------------|---------------|
| `numeroPedido` | `orderId` | Direto |
| `valorTotal` | `value` | Direto |
| `dataCriacao` | `creationDate` | Normaliza ISO 8601 UTC |
| `idItem` | `productId` | String → Integer |
| `quantidadeItem` | `quantity` | Direto |
| `valorItem` | `price` | Direto |

---

## 🗄️ Banco de Dados

### Tabela: orders

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `orderId` | VARCHAR(100) | Chave primária |
| `value` | NUMERIC(12,2) | Valor total |
| `creationDate` | TIMESTAMPTZ | Data de criação |

### Tabela: items

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | Chave primária |
| `orderId` | VARCHAR(100) | FK → orders |
| `productId` | INTEGER | ID do produto |
| `quantity` | INTEGER | Quantidade |
| `price` | NUMERIC(12,2) | Preço unitário |

---

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage
```

---

## 📁 Estrutura do Projeto

```
src/
├── config/          # Conexão com banco de dados
├── middlewares/      # Auth JWT, validação, erros
├── models/          # Queries SQL (acesso ao banco)
├── controllers/     # Orquestração request/response
├── routes/          # Definição das rotas
├── services/        # Lógica de negócio
├── utils/           # Mapper (transformação de dados)
├── swagger/         # Configuração OpenAPI
└── app.js           # Entry point
```

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [docs/SETUP.md](docs/SETUP.md) | Guia de instalação detalhado |
| [docs/API.md](docs/API.md) | Documentação completa da API |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decisões técnicas |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Histórico de alterações |

---

## 👤 Autor

**Vinicius** — [@viniciuslks7](https://github.com/viniciuslks7)

📧 vinicius.oliveiratwt@gmail.com

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.
