# 🔧 Guia de Instalação e Execução — jitterbit-order-api

> Guia completo para configurar e executar o projeto.
> Revisado e mantido por: **Vinicius** (`viniciuslks7`)

---

## 📋 Pré-requisitos

### Opção 1: Com Docker (recomendado)
- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado

### Opção 2: Sem Docker
- [Node.js](https://nodejs.org/) v18+ instalado
- [PostgreSQL](https://www.postgresql.org/) v13+ instalado e rodando
- [npm](https://www.npmjs.com/) v9+ instalado

---

## 🐳 Execução com Docker (1 comando)

A forma mais simples de rodar o projeto:

```bash
# 1. Clone o repositório
git clone https://github.com/viniciuslks7/API-GerenciaPedidos.git
cd API-GerenciaPedidos

# 2. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Suba tudo (API + PostgreSQL)
docker-compose up

# A API estará disponível em:
# 🚀 API: http://localhost:3000
# 📖 Swagger: http://localhost:3000/api-docs
# 💚 Health: http://localhost:3000/health
```

Para parar:
```bash
docker-compose down
```

Para limpar dados do banco:
```bash
docker-compose down -v
```

---

## 💻 Execução Local (sem Docker)

### 1. Clone o repositório

```bash
git clone https://github.com/viniciuslks7/API-GerenciaPedidos.git
cd API-GerenciaPedidos
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as credenciais do seu PostgreSQL local:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=jitterbit_orders
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
JWT_SECRET=sua_chave_secreta_aqui
```

### 4. Crie o banco de dados

No PostgreSQL, crie o banco de dados:

```sql
CREATE DATABASE jitterbit_orders;
```

### 5. Inicialize as tabelas e o usuário admin

```bash
npm run db:init
```

Isso irá:
- Criar as tabelas `orders`, `items` e `users`
- Criar o usuário admin (senha: `admin123`)

### 6. Inicie o servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (hot reload)
npm run dev
```

### 7. Acesse a API

- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

---

## 🧪 Executando Testes

```bash
# Rodar todos os testes
npm test

# Rodar com cobertura de código
npm run test:coverage
```

**Nota**: Testes de integração requerem PostgreSQL rodando com as tabelas criadas.

---

## 🔑 Primeiro Acesso (Autenticação)

1. Faça login para obter o token JWT:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

2. Use o token retornado nas requisições protegidas:

```bash
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
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

3. Ou use o **Swagger UI** em http://localhost:3000/api-docs (clique no botão "Authorize" e cole o token)

---

## 📁 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor em modo produção |
| `npm run dev` | Inicia com hot reload (nodemon) |
| `npm test` | Executa todos os testes |
| `npm run test:coverage` | Executa testes com relatório de cobertura |
| `npm run db:init` | Cria tabelas e usuário admin no banco |

---

> 📅 Última atualização: 07/03/2026
