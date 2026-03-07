/**
 * @fileoverview Controller de pedidos — orquestra request/response.
 * Recebe o request HTTP, chama o service adequado, e envia a response padronizada.
 * Nenhuma lógica de negócio é implementada aqui.
 * @author Vinicius (viniciuslks7)
 */

const orderService = require('../services/orderService');

/**
 * Cria um novo pedido.
 * POST /order
 * @param {Object} req - Express request (body com dados do pedido em PT-BR)
 * @param {Object} res - Express response
 * @param {Function} next - Middleware next para tratamento de erros
 */
const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);

    return res.status(201).json({
      success: true,
      data: order,
      message: 'Pedido criado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém um pedido pelo ID.
 * GET /order/:orderId
 * @param {Object} req - Express request (params.orderId)
 * @param {Object} res - Express response
 * @param {Function} next - Middleware next para tratamento de erros
 */
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Pedido encontrado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista todos os pedidos.
 * GET /order/list
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Middleware next para tratamento de erros
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();

    return res.status(200).json({
      success: true,
      data: orders,
      message: `${orders.length} pedido(s) encontrado(s)`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza um pedido existente.
 * PUT /order/:orderId
 * @param {Object} req - Express request (params.orderId + body com novos dados)
 * @param {Object} res - Express response
 * @param {Function} next - Middleware next para tratamento de erros
 */
const updateOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.updateOrder(orderId, req.body);

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Pedido atualizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deleta um pedido.
 * DELETE /order/:orderId
 * @param {Object} req - Express request (params.orderId)
 * @param {Object} res - Express response
 * @param {Function} next - Middleware next para tratamento de erros
 */
const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    await orderService.deleteOrder(orderId);

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Pedido deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  deleteOrder
};
