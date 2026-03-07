/**
 * @fileoverview Model de pedidos — único ponto de acesso ao banco de dados.
 * Contém todas as queries SQL para operações CRUD na tabela orders e items.
 * Utiliza transações para garantir integridade dos dados.
 * @author Vinicius (viniciuslks7)
 */

const { query, getClient } = require('../config/database');

/**
 * Cria um novo pedido com seus itens no banco de dados.
 * Utiliza transação para garantir que order e items sejam inseridos atomicamente.
 * @param {Object} orderData - Dados do pedido já mapeados (formato EN)
 * @param {string} orderData.orderId - ID único do pedido
 * @param {number} orderData.value - Valor total do pedido
 * @param {string} orderData.creationDate - Data de criação em ISO 8601
 * @param {Array} orderData.items - Lista de itens do pedido
 * @returns {Promise<Object>} Pedido criado com seus itens
 */
const createOrder = async (orderData) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Insere o pedido na tabela orders
    const orderResult = await client.query(
      'INSERT INTO orders ("orderId", "value", "creationDate") VALUES ($1, $2, $3) RETURNING *',
      [orderData.orderId, orderData.value, orderData.creationDate]
    );

    // Insere cada item na tabela items
    const insertedItems = [];
    for (const item of orderData.items) {
      const itemResult = await client.query(
        'INSERT INTO items ("orderId", "productId", quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [orderData.orderId, item.productId, item.quantity, item.price]
      );
      insertedItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    return {
      order: orderResult.rows[0],
      items: insertedItems
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Busca um pedido pelo ID com todos os seus itens.
 * @param {string} orderId - ID do pedido a ser buscado
 * @returns {Promise<Object|null>} Pedido com itens ou null se não encontrado
 */
const getOrderById = async (orderId) => {
  // Busca o pedido
  const orderResult = await query(
    'SELECT "orderId", "value", "creationDate" FROM orders WHERE "orderId" = $1',
    [orderId]
  );

  if (orderResult.rows.length === 0) {
    return null;
  }

  // Busca os itens do pedido
  const itemsResult = await query(
    'SELECT "productId", quantity, price FROM items WHERE "orderId" = $1',
    [orderId]
  );

  return {
    order: orderResult.rows[0],
    items: itemsResult.rows
  };
};

/**
 * Lista todos os pedidos com seus respectivos itens.
 * @returns {Promise<Array>} Lista de pedidos com itens
 */
const getAllOrders = async () => {
  // Busca todos os pedidos ordenados por data de criação
  const ordersResult = await query(
    'SELECT "orderId", "value", "creationDate" FROM orders ORDER BY "creationDate" DESC',
    []
  );

  // Para cada pedido, busca seus itens
  const orders = [];
  for (const order of ordersResult.rows) {
    const itemsResult = await query(
      'SELECT "productId", quantity, price FROM items WHERE "orderId" = $1',
      [order.orderId]
    );
    orders.push({
      order,
      items: itemsResult.rows
    });
  }

  return orders;
};

/**
 * Atualiza um pedido existente e seus itens.
 * Utiliza transação: atualiza order, remove items antigos e insere novos.
 * @param {string} orderId - ID do pedido a ser atualizado
 * @param {Object} orderData - Novos dados do pedido (formato EN)
 * @returns {Promise<Object|null>} Pedido atualizado ou null se não encontrado
 */
const updateOrder = async (orderId, orderData) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Verifica se o pedido existe
    const existingOrder = await client.query(
      'SELECT "orderId" FROM orders WHERE "orderId" = $1',
      [orderId]
    );

    if (existingOrder.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // Atualiza o pedido
    const orderResult = await client.query(
      'UPDATE orders SET "value" = $1, "creationDate" = $2 WHERE "orderId" = $3 RETURNING *',
      [orderData.value, orderData.creationDate, orderId]
    );

    // Remove itens antigos e insere os novos
    await client.query('DELETE FROM items WHERE "orderId" = $1', [orderId]);

    const insertedItems = [];
    for (const item of orderData.items) {
      const itemResult = await client.query(
        'INSERT INTO items ("orderId", "productId", quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [orderId, item.productId, item.quantity, item.price]
      );
      insertedItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    return {
      order: orderResult.rows[0],
      items: insertedItems
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Deleta um pedido e seus itens do banco de dados.
 * Os itens são removidos automaticamente pelo ON DELETE CASCADE.
 * @param {string} orderId - ID do pedido a ser deletado
 * @returns {Promise<boolean>} true se deletado, false se não encontrado
 */
const deleteOrder = async (orderId) => {
  const result = await query(
    'DELETE FROM orders WHERE "orderId" = $1 RETURNING "orderId"',
    [orderId]
  );

  return result.rows.length > 0;
};

/**
 * Verifica se um pedido já existe no banco de dados.
 * @param {string} orderId - ID do pedido a verificar
 * @returns {Promise<boolean>} true se existe, false caso contrário
 */
const orderExists = async (orderId) => {
  const result = await query(
    'SELECT 1 FROM orders WHERE "orderId" = $1',
    [orderId]
  );
  return result.rows.length > 0;
};

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  deleteOrder,
  orderExists
};
