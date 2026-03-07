/**
 * @fileoverview Script de inicialização do banco de dados.
 * Cria as tabelas 'orders' e 'items' e insere um usuário admin padrão.
 * Deve ser executado com: npm run db:init
 * @author Vinicius (viniciuslks7)
 */

const { pool } = require('./database');
const bcrypt = require('bcryptjs');

/**
 * SQL para criação das tabelas do banco de dados.
 * Utiliza IF NOT EXISTS para ser idempotente.
 */
const createTablesSQL = `
  -- Tabela principal de pedidos
  CREATE TABLE IF NOT EXISTS orders (
    "orderId"       VARCHAR(100) PRIMARY KEY,
    "value"         NUMERIC(12,2) NOT NULL,
    "creationDate"  TIMESTAMPTZ NOT NULL
  );

  -- Tabela de itens do pedido (FK com CASCADE)
  CREATE TABLE IF NOT EXISTS items (
    id              SERIAL PRIMARY KEY,
    "orderId"       VARCHAR(100) NOT NULL REFERENCES orders("orderId") ON DELETE CASCADE,
    "productId"     INTEGER NOT NULL,
    quantity        INTEGER NOT NULL,
    price           NUMERIC(12,2) NOT NULL
  );

  -- Tabela de usuários para autenticação JWT
  CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    "createdAt"     TIMESTAMPTZ DEFAULT NOW()
  );
`;

/**
 * Inicializa o banco de dados: cria tabelas e insere usuário admin.
 * @returns {Promise<void>}
 */
const initDatabase = async () => {
  try {
    console.log('[DB:Init] Iniciando criação das tabelas...');
    await pool.query(createTablesSQL);
    console.log('[DB:Init] Tabelas criadas com sucesso!');

    // Verifica se o usuário admin já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (existingUser.rows.length === 0) {
      // Cria usuário admin padrão para demonstração
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2)',
        ['admin', hashedPassword]
      );
      console.log('[DB:Init] Usuário admin criado (senha: admin123)');
    } else {
      console.log('[DB:Init] Usuário admin já existe, pulando criação');
    }

    console.log('[DB:Init] Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('[DB:Init] Erro ao inicializar banco de dados:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

// Executa apenas quando chamado diretamente (npm run db:init)
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initDatabase };
