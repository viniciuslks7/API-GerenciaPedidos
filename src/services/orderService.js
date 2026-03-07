/**
 * @fileoverview Service de pedidos — contém toda a lógica de negócio.
 * Orquestra o mapper (transformação de dados) e o model (acesso ao banco).
 * @author Vinicius (viniciuslks7)
 */

const orderModel = require('../models/orderModel');
const { mapOrderInput, mapOrderOutput } = require('../utils/mapper');

/**
 * Cria um novo pedido no banco de dados.
 * Realiza a transformação dos dados de entrada (PT) para o formato do banco (EN).
 * @param {Object} inputData - Dados do pedido no formato de entrada (PT-BR)
 * @returns {Promise<Object>} Pedido criado no formato de resposta (EN)
 * @throws {Error} DUPLICATE_ORDER se o pedido já existir
 */
const createOrder = async (inputData) => {
  // Transforma os dados de entrada para o formato do banco
  const mappedData = mapOrderInput(inputData);

  // Verifica se o pedido já existe (evita duplicatas)
  const exists = await orderModel.orderExists(mappedData.orderId);
  if (exists) {
    const error = new Error('Pedido já existe no banco de dados');
    error.statusCode = 409;
    error.errorCode = 'DUPLICATE_ORDER';
    throw error;
  }

  // Cria o pedido no banco
  const result = await orderModel.createOrder(mappedData);

  // Retorna no formato de resposta
  return mapOrderOutput(result.order, result.items);
};

/**
 * Busca um pedido pelo ID.
 * @param {string} orderId - ID do pedido
 * @returns {Promise<Object>} Pedido encontrado no formato de resposta
 * @throws {Error} ORDER_NOT_FOUND se o pedido não existir
 */
const getOrderById = async (orderId) => {
  const result = await orderModel.getOrderById(orderId);

  if (!result) {
    const error = new Error('Pedido não encontrado');
    error.statusCode = 404;
    error.errorCode = 'ORDER_NOT_FOUND';
    throw error;
  }

  return mapOrderOutput(result.order, result.items);
};

/**
 * Lista todos os pedidos cadastrados.
 * @returns {Promise<Array>} Lista de pedidos no formato de resposta
 */
const getAllOrders = async () => {
  const results = await orderModel.getAllOrders();

  return results.map((result) => mapOrderOutput(result.order, result.items));
};

/**
 * Atualiza um pedido existente.
 * Realiza a transformação dos dados de entrada antes de atualizar.
 * @param {string} orderId - ID do pedido a ser atualizado
 * @param {Object} inputData - Novos dados do pedido no formato de entrada (PT-BR)
 * @returns {Promise<Object>} Pedido atualizado no formato de resposta
 * @throws {Error} ORDER_NOT_FOUND se o pedido não existir
 */
const updateOrder = async (orderId, inputData) => {
  // Transforma os dados de entrada para o formato do banco
  const mappedData = mapOrderInput(inputData);

  // Atualiza o pedido (o model verifica existência)
  const result = await orderModel.updateOrder(orderId, mappedData);

  if (!result) {
    const error = new Error('Pedido não encontrado para atualização');
    error.statusCode = 404;
    error.errorCode = 'ORDER_NOT_FOUND';
    throw error;
  }

  return mapOrderOutput(result.order, result.items);
};

/**
 * Deleta um pedido do banco de dados.
 * @param {string} orderId - ID do pedido a ser deletado
 * @returns {Promise<void>}
 * @throws {Error} ORDER_NOT_FOUND se o pedido não existir
 */
const deleteOrder = async (orderId) => {
  const deleted = await orderModel.deleteOrder(orderId);

  if (!deleted) {
    const error = new Error('Pedido não encontrado para exclusão');
    error.statusCode = 404;
    error.errorCode = 'ORDER_NOT_FOUND';
    throw error;
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  deleteOrder
};
