# 🏛️ Constituição do Projeto — jitterbit-order-api

> **Este documento é a fonte única de verdade para todos os padrões, regras e convenções do projeto.**
> Qualquer código, commit, documentação ou decisão técnica DEVE obedecer às regras aqui definidas.
> Revisado e mantido por: **Vinicius** (`viniciuslks7`)

---

## 📌 Seção 1 — Identidade do Projeto

| Campo            | Valor                                                    |
| ---------------- | -------------------------------------------------------- |
| **Nome**         | `jitterbit-order-api`                                    |
| **Descrição**    | API REST para gerenciamento de pedidos (Teste Técnico Jitterbit) |
| **Stack**        | Node.js, Express.js, PostgreSQL, JWT, Swagger, Jest      |
| **Linguagem**    | JavaScript (ES6+)                                        |
| **Porta padrão** | `3000`                                                   |
| **Repositório**  | `github.com/viniciuslks7/jitterbit-order-api`            |
| **Responsável**  | Vinicius (`viniciuslks7` / `vinicius.oliveiratwt@gmail.com`) |

---

## 🏗️ Seção 2 — Arquitetura Obrigatória

### Padrão em Camadas

```
Request → Routes → Controllers → Services → Models → PostgreSQL
```

**Regras invioláveis:**

1. **Routes** (`src/routes/`): Apenas definem rotas e associam middlewares. Nenhuma lógica aqui.
2. **Controllers** (`src/controllers/`): Recebem o request, chamam o service, e enviam a response. Sem lógica de negócio.
3. **Services** (`src/services/`): Contêm toda a lógica de negócio. Orquestram mappers e models.
4. **Models** (`src/models/`): Único ponto de acesso ao banco de dados. Queries SQL parametrizadas.
5. **Middlewares** (`src/middlewares/`): Funções intermediárias (auth, validação, erros). Nunca inline nas rotas.
6. **Utils** (`src/utils/`): Funções utilitárias puras (mapper, helpers). Sem side effects.

### Estrutura de Pastas

```
jitterbit-order-api/
├── .github/
│   └── copilot-instructions.md    # Esta constituição
├── docs/                          # Documentação centralizada
│   ├── CHANGELOG.md
│   ├── DECISIONS.md
│   ├── API.md
│   └── SETUP.md
├── src/
│   ├── config/                    # Configurações (banco, variáveis)
│   ├── middlewares/                # Auth, erros, validação
│   ├── models/                    # Queries SQL
│   ├── controllers/               # Orquestração request/response
│   ├── routes/                    # Definição de rotas
│   ├── services/                  # Lógica de negócio
│   ├── utils/                     # Mapper e helpers
│   ├── swagger/                   # Configuração Swagger/OpenAPI
│   └── app.js                     # Entry point Express
├── tests/
│   ├── unit/                      # Testes unitários
│   └── integration/               # Testes de integração
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── jest.config.js
└── README.md
```

> ⚠️ **Proibido**: Criar arquivos fora dessa estrutura sem atualizar esta constituição.

---

## 💻 Seção 3 — Padrão de Código

### Linguagem e Estilo

- **JavaScript ES6+** (não TypeScript)
- **Nomes de variáveis, funções e classes**: inglês, `camelCase`
- **Nomes de arquivos**: inglês, `camelCase.js`
- **Comentários**: sempre em **português (PT-BR)**, claros e descritivos
- **Funções assíncronas**: sempre `async/await` (nunca callbacks ou `.then()`)
- **Módulos**: `require`/`module.exports` (CommonJS)
- **Strings**: aspas simples (`'texto'`), exceto em JSON
- **Ponto e vírgula**: obrigatório ao final de cada statement
- **Indentação**: 2 espaços

### Cabeçalho de Arquivo

Todo arquivo `.js` deve começar com um comentário de cabeçalho:

```javascript
/**
 * @fileoverview Descrição clara do propósito do arquivo em PT-BR.
 * @author Vinicius (viniciuslks7)
 */
```

### JSDoc

Toda função exportada deve ter JSDoc completo:

```javascript
/**
 * Descrição da função em PT-BR.
 * @param {string} orderId - ID do pedido
 * @returns {Promise<Object>} Dados do pedido encontrado
 * @throws {Error} Quando o pedido não é encontrado
 */
async function getOrderById(orderId) { ... }
```

### Tratamento de Erros

- Todo `async/await` deve estar envolvido em `try/catch` ou usar middleware de erros
- Erros customizados devem ter `statusCode` e `message` claros
- Nunca expor stack traces em produção

---

## 📝 Seção 4 — Padrão de Commits

### Formato

```
tipo: mensagem descritiva em PT-BR no imperativo
```

### Tipos Permitidos

| Tipo         | Uso                                              |
| ------------ | ------------------------------------------------ |
| `feat:`      | Nova funcionalidade                              |
| `fix:`       | Correção de bug                                  |
| `docs:`      | Apenas documentação                              |
| `test:`      | Adição ou correção de testes                     |
| `refactor:`  | Refatoração sem mudar comportamento              |
| `chore:`     | Tarefas de manutenção (deps, configs, CI)        |
| `style:`     | Formatação, espaçamento (sem mudança de lógica)  |

### Regras

1. Mensagens **sempre em português** (PT-BR)
2. Usar o **imperativo**: "implementa", "adiciona", "corrige" (não "implementado", "adicionando")
3. Primeira letra minúscula após o tipo
4. Sem ponto final na mensagem
5. **Um commit por fase/funcionalidade** — commits atômicos
6. Máximo de ~72 caracteres na primeira linha

### Exemplos

```
feat: implementa endpoint de criação de pedido com validação
fix: corrige conversão de tipo no mapeamento de idItem
docs: adiciona documentação Swagger para endpoint de listagem
test: adiciona testes unitários para o mapper de pedidos
refactor: extrai lógica de transação para função auxiliar
chore: atualiza dependências de segurança
```

---

## 🌐 Seção 5 — Padrão de API REST

### Estrutura de Resposta (Sucesso)

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem descritiva em PT-BR"
}
```

### Estrutura de Resposta (Erro)

```json
{
  "success": false,
  "message": "Descrição clara do erro em PT-BR",
  "error": "CODIGO_DO_ERRO"
}
```

### Códigos HTTP Obrigatórios

| Código | Uso                                    |
| ------ | -------------------------------------- |
| `200`  | GET/PUT/DELETE bem-sucedido            |
| `201`  | POST (criação) bem-sucedido            |
| `400`  | Body inválido / campos faltando        |
| `401`  | Token JWT ausente ou inválido          |
| `404`  | Recurso não encontrado                 |
| `409`  | Conflito (ex: pedido duplicado)        |
| `429`  | Rate limit excedido                    |
| `500`  | Erro interno do servidor               |

### Endpoints da API

| Método   | Rota                  | Descrição                          |
| -------- | --------------------- | ---------------------------------- |
| `POST`   | `/order`              | Criar novo pedido                  |
| `GET`    | `/order/list`         | Listar todos os pedidos            |
| `GET`    | `/order/:orderId`     | Obter pedido por ID                |
| `PUT`    | `/order/:orderId`     | Atualizar pedido por ID            |
| `DELETE` | `/order/:orderId`     | Deletar pedido por ID              |
| `POST`   | `/auth/login`         | Autenticar e obter token JWT       |
| `GET`    | `/health`             | Health check do servidor           |
| `GET`    | `/api-docs`           | Swagger UI (documentação interativa) |

### Headers Obrigatórios

- **Request**: `Content-Type: application/json`
- **Auth**: `Authorization: Bearer <token>` (exceto `/auth/login`, `/health`, `/api-docs`)
- **Response**: `Content-Type: application/json`

---

## 🧪 Seção 6 — Padrão de Testes

### Estrutura

- **Unitários** (`tests/unit/`): Testam funções isoladas com mocks
- **Integração** (`tests/integration/`): Testam endpoints completos com `supertest`

### Nomenclatura

- Arquivos: `nomeDoModulo.test.js`
- `describe`: nome do módulo/função sendo testada
- `it`: descrição clara do comportamento em PT-BR

### Exemplo

```javascript
describe('OrderMapper', () => {
  describe('mapOrderInput', () => {
    it('deve transformar numeroPedido para orderId', () => { ... });
    it('deve converter idItem de string para integer', () => { ... });
    it('deve normalizar dataCriacao para ISO 8601', () => { ... });
  });
});
```

### Cobertura

- Meta mínima: **80%** de cobertura total
- Testar cenários de sucesso E de erro
- Testar edge cases (campos nulos, arrays vazios, tipos incorretos)

---

## 🔄 Seção 7 — Transformação de Dados (Mapping)

### De: JSON de Entrada (PT-BR)

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

### Para: JSON do Banco (EN)

```json
{
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
}
```

### Regras de Transformação

| Campo Entrada     | Campo Banco      | Transformação                  |
| ----------------- | ---------------- | ------------------------------ |
| `numeroPedido`    | `orderId`        | Direto (string)                |
| `valorTotal`      | `value`          | Direto (number)                |
| `dataCriacao`     | `creationDate`   | Normalizar para ISO 8601 UTC  |
| `idItem`          | `productId`      | Converter `string` → `integer` |
| `quantidadeItem`  | `quantity`       | Direto (integer)               |
| `valorItem`       | `price`          | Direto (number)                |

> ⚠️ **A transformação DEVE ser feita exclusivamente em `src/utils/mapper.js`.**

---

## 🗄️ Seção 8 — Banco de Dados (PostgreSQL)

### Tabelas

```sql
-- Tabela principal de pedidos
CREATE TABLE orders (
  "orderId"       VARCHAR(100) PRIMARY KEY,
  "value"         NUMERIC(12,2) NOT NULL,
  "creationDate"  TIMESTAMPTZ NOT NULL
);

-- Tabela de itens do pedido
CREATE TABLE items (
  id              SERIAL PRIMARY KEY,
  "orderId"       VARCHAR(100) NOT NULL REFERENCES orders("orderId") ON DELETE CASCADE,
  "productId"     INTEGER NOT NULL,
  quantity        INTEGER NOT NULL,
  price           NUMERIC(12,2) NOT NULL
);
```

### Regras

1. **Pool de conexões** via `pg.Pool` (não conexões individuais)
2. **Queries parametrizadas** — NUNCA concatenar valores na SQL (prevenir SQL Injection)
3. **Transações** obrigatórias em operações que envolvem orders + items (CREATE, UPDATE, DELETE)
4. **ON DELETE CASCADE** na FK para manter integridade referencial
5. **Variáveis de ambiente** para configuração (host, port, user, password, database)

---

## 🔒 Seção 9 — Segurança

### JWT (JSON Web Token)

- **Algoritmo**: HS256
- **Expiração**: 24 horas
- **Payload**: `{ userId, username }`
- **Secret**: variável de ambiente `JWT_SECRET`

### Endpoints Protegidos

Todos os endpoints EXCETO:
- `POST /auth/login`
- `GET /health`
- `GET /api-docs` (e seus assets)

### Boas Práticas

- `helmet` para headers de segurança
- `cors` configurável via `.env`
- `express-rate-limit` para proteção contra abuso
- Senhas hasheadas com `bcryptjs` (salt rounds: 10)
- `.env` no `.gitignore` — nunca commitado

---

## 📖 Seção 10 — Documentação

### Estrutura

| Arquivo              | Propósito                                               |
| -------------------- | ------------------------------------------------------- |
| `README.md`          | Ponto de entrada público — overview, setup, uso         |
| `docs/CHANGELOG.md`  | Registro de alterações revisadas por Vinicius            |
| `docs/DECISIONS.md`  | Decisões técnicas com justificativas                     |
| `docs/API.md`        | Documentação complementar dos endpoints                  |
| `docs/SETUP.md`      | Guia detalhado de instalação e execução                  |

### Regras

1. Toda alteração significativa deve ser registrada no `CHANGELOG.md`
2. Decisões técnicas (escolha de lib, padrão, etc.) devem ser documentadas em `DECISIONS.md`
3. Documentação sempre em **português (PT-BR)**
4. Alterações no `docs/` são revisadas por **Vinicius**
5. `README.md` deve conter: descrição, tecnologias, requisitos, instalação, endpoints, exemplos, e como rodar testes

---

## 🐳 Seção 11 — Docker

### Regras

- `Dockerfile` com multi-stage build para imagem otimizada
- `docker-compose.yml` com serviços `api` e `db`
- Volume persistente para dados do PostgreSQL
- Variáveis de ambiente via `.env`
- **Comando único para subir tudo**: `docker-compose up`

---

## ✅ Checklist de Qualidade

Antes de qualquer push, verificar:

- [ ] Todos os testes passam (`npm test`)
- [ ] Código segue os padrões desta constituição
- [ ] Comentários em PT-BR estão presentes
- [ ] JSDoc em todas as funções exportadas
- [ ] Mensagem de commit segue o padrão da Seção 4
- [ ] Nenhum dado sensível exposto (senhas, secrets, .env)
- [ ] Respostas da API seguem o padrão da Seção 5
- [ ] Erros retornam mensagens claras e status HTTP corretos
- [ ] Swagger está atualizado com as alterações

---

> 📅 **Última atualização**: 07/03/2026
> 👤 **Mantido por**: Vinicius (viniciuslks7)
