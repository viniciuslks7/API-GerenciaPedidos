# 📡 Documentação da API — jitterbit-order-api

> Documentação complementar dos endpoints da API REST.
> Para documentação interativa, acesse: http://localhost:3000/api-docs
> Revisado e mantido por: **Vinicius** (`viniciuslks7`)

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)** para proteger os endpoints.

### Login
```
POST /auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "24h",
    "username": "admin"
  },
  "message": "Login realizado com sucesso"
}
```

**Uso do token:** Inclua o header em todas as requisições protegidas:
```
Authorization: Bearer <token>
```

---

## 📦 Endpoints de Pedidos

### Criar Pedido

```
POST /order
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (formato PT-BR):**
```json
{
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
}
```

**Resposta (201):** Dados transformados para formato EN:
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

**Transformação de dados:**

| Campo Entrada (PT) | Campo Saída (EN) | Transformação |
|---------------------|-------------------|---------------|
| `numeroPedido` | `orderId` | Direto |
| `valorTotal` | `value` | Direto |
| `dataCriacao` | `creationDate` | Normaliza para ISO 8601 UTC |
| `idItem` | `productId` | String → Integer |
| `quantidadeItem` | `quantity` | Direto |
| `valorItem` | `price` | Direto |

---

### Obter Pedido por ID

```
GET /order/:orderId
Authorization: Bearer <token>
```

**Exemplo:** `GET /order/v10089015vdb-01`

**Resposta (200):**
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
  "message": "Pedido encontrado com sucesso"
}
```

**Resposta (404):**
```json
{
  "success": false,
  "message": "Pedido não encontrado",
  "error": "ORDER_NOT_FOUND"
}
```

---

### Listar Todos os Pedidos

```
GET /order/list
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "v10089015vdb-01",
      "value": 10000,
      "creationDate": "2023-07-19T12:24:11.529Z",
      "items": [...]
    }
  ],
  "message": "1 pedido(s) encontrado(s)"
}
```

---

### Atualizar Pedido

```
PUT /order/:orderId
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** Mesmo formato da criação (PT-BR).

**Resposta (200):** Dados atualizados no formato EN.

**Resposta (404):** Pedido não encontrado.

---

### Deletar Pedido

```
DELETE /order/:orderId
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Pedido deletado com sucesso"
}
```

---

## 💚 Health Check

```
GET /health
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 12345.67,
    "database": "connected",
    "timestamp": "2026-03-07T12:00:00.000Z"
  },
  "message": "Servidor operacional"
}
```

---

## ❌ Códigos de Erro

| Código HTTP | Código de Erro | Descrição |
|-------------|----------------|-----------|
| 400 | `VALIDATION_ERROR` | Dados de entrada inválidos |
| 401 | `MISSING_TOKEN` | Token JWT não fornecido |
| 401 | `INVALID_TOKEN` | Token JWT inválido ou expirado |
| 401 | `INVALID_CREDENTIALS` | Username ou password incorretos |
| 404 | `ORDER_NOT_FOUND` | Pedido não encontrado |
| 404 | `ROUTE_NOT_FOUND` | Rota não existe |
| 409 | `DUPLICATE_ORDER` | Pedido já existe |
| 429 | `RATE_LIMIT_EXCEEDED` | Muitas requisições |
| 500 | `INTERNAL_ERROR` | Erro interno do servidor |

---

> 📅 Última atualização: 07/03/2026
