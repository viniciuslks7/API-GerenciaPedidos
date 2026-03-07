# 🧠 Decisões Técnicas — jitterbit-order-api

> Registro das decisões técnicas do projeto com justificativas.
> Revisado e mantido por: **Vinicius** (`viniciuslks7`)

---

## DEC-001: PostgreSQL como banco de dados

**Data**: 07/03/2026
**Status**: Aprovado

### Contexto
O teste técnico permite MongoDB, SQL ou PostgreSQL.

### Decisão
Usar **PostgreSQL** como banco de dados relacional.

### Justificativa
- Demonstra habilidade com banco relacional, modelagem de tabelas, FK e transações
- As tabelas `orders` e `items` possuem relacionamento claro (1:N) — ideal para modelo relacional
- PostgreSQL é robusto, amplamente usado em produção, e tem excelente suporte a tipos de dados (NUMERIC, TIMESTAMPTZ)
- Transações ACID garantem integridade ao criar pedido com itens atomicamente
- Queries parametrizadas nativas para segurança contra SQL injection

### Alternativas consideradas
- **MongoDB**: Mais simples mas não demonstra domínio de SQL e modelagem relacional
- **SQLite**: Leve mas limitado para demonstrar habilidades profissionais

---

## DEC-002: Express.js como framework HTTP

**Data**: 07/03/2026
**Status**: Aprovado

### Contexto
Necessidade de escolher um framework HTTP para Node.js.

### Decisão
Usar **Express.js** como framework HTTP.

### Justificativa
- Framework mais popular e maduro do ecossistema Node.js
- Ampla documentação e comunidade ativa
- Excelente ecossistema de middlewares (helmet, cors, rate-limit, etc.)
- Padrão da indústria — familiar para a maioria dos avaliadores
- Suporte nativo a middleware chaining para validação e autenticação

### Alternativas consideradas
- **Fastify**: Mais performático mas menos adotado em testes técnicos

---

## DEC-003: Arquitetura em camadas (Routes → Controllers → Services → Models)

**Data**: 07/03/2026
**Status**: Aprovado

### Contexto
Necessidade de organização clara e separação de responsabilidades.

### Decisão
Adotar padrão de **arquitetura em camadas** com separação estrita de responsabilidades.

### Justificativa
- **Routes**: Apenas definição de rotas e associação de middlewares
- **Controllers**: Orquestração request/response (sem lógica de negócio)
- **Services**: Toda lógica de negócio (transformação, validações de regra)
- **Models**: Único ponto de acesso ao banco (queries SQL)
- Facilita testes unitários (mock de cada camada)
- Código manutenível e extensível
- Demonstra conhecimento de padrões de design profissionais

---

## DEC-004: Transformação de dados (Mapper Pattern)

**Data**: 07/03/2026
**Status**: Aprovado

### Contexto
O JSON de entrada da API usa campos em PT-BR, mas o banco armazena em EN.

### Decisão
Criar módulo dedicado `src/utils/mapper.js` para toda transformação de dados.

### Justificativa
- Centraliza toda lógica de conversão em um único ponto
- Facilita testes (função pura, sem side effects)
- Se o formato de entrada mudar, apenas o mapper precisa ser atualizado
- Conversões incluem: renomeação de campos, normalização de data (ISO 8601), conversão de tipos (string → integer)

---

## DEC-005: JWT para autenticação

**Data**: 07/03/2026
**Status**: Aprovado

### Contexto
O teste sugere autenticação como recurso adicional.

### Decisão
Implementar autenticação com **JSON Web Token (JWT)**.

### Justificativa
- Stateless — não precisa armazenar sessões no servidor
- Padrão amplamente adotado para APIs REST
- Fácil de implementar e testar
- Token expira em 24h (segurança)
- Usuário admin pré-criado para facilitar demonstração

---

## DEC-006: Docker para ambiente de desenvolvimento

**Data**: 07/03/2026
**Status**: Aprovado

### Contexto
Facilitar a execução do projeto pelo avaliador.

### Decisão
Criar **Dockerfile** + **docker-compose.yml** para levantar API + PostgreSQL com um comando.

### Justificativa
- O avaliador pode rodar `docker-compose up` sem instalar Node.js ou PostgreSQL
- Multi-stage build para imagem otimizada em produção
- Volume persistente para dados do PostgreSQL
- Health check configurado para dependência entre serviços
- Demonstra conhecimento de DevOps básico

---

## DEC-007: Constituição do Projeto (.github/copilot-instructions.md)

**Data**: 07/03/2026
**Status**: Aprovado

### Contexto
Necessidade de padronização rigorosa em todas as frentes do projeto.

### Decisão
Criar uma **Constituição do Projeto** que serve como fonte única de verdade.

### Justificativa
- Garante consistência no código, commits, API, testes e documentação
- Funciona como guia para o Copilot e qualquer colaborador futuro
- Define regras invioláveis que previnem desvios de padrão
- Inspirado no padrão spec-kit de governança de projetos

---

> 📅 Última atualização: 07/03/2026
