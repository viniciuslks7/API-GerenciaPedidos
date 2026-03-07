/**
 * @fileoverview Configuração e pool de conexão do banco de dados PostgreSQL.
 * Utiliza pg.Pool para gerenciar conexões de forma eficiente.
 * @author Vinicius (viniciuslks7)
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões com variáveis de ambiente
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'jitterbit_orders',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// Evento de conexão bem-sucedida (apenas para log)
pool.on('connect', () => {
  console.log('[DB] Nova conexão estabelecida com o PostgreSQL');
});

// Evento de erro no pool
pool.on('error', (err) => {
  console.error('[DB] Erro inesperado no pool de conexões:', err.message);
});

/**
 * Executa uma query SQL parametrizada no banco de dados.
 * @param {string} text - Query SQL com placeholders ($1, $2, etc.)
 * @param {Array} params - Parâmetros para a query
 * @returns {Promise<Object>} Resultado da query
 */
const query = async (text, params) => {
  const result = await pool.query(text, params);
  return result;
};

/**
 * Obtém um client do pool para transações manuais.
 * @returns {Promise<Object>} Client do pool de conexões
 */
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = {
  query,
  getClient,
  pool
};
