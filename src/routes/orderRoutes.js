/**
 * @fileoverview Rotas de pedidos — define endpoints CRUD para gerenciamento de pedidos.
 * Associa middlewares de autenticação e validação às rotas.
 * Nenhuma lógica de negócio é implementada aqui.
 * @author Vinicius (viniciuslks7)
 */

const { Router } = require('express');
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middlewares/auth');
const { orderValidationRules, validate } = require('../middlewares/validator');

const router = Router();

/**
 * @route POST /order
 * @desc Cria um novo pedido com transformação de dados PT→EN
 * @access Protegido (JWT)
 */
router.post(
  '/',
  authenticateToken,
  orderValidationRules,
  validate,
  orderController.createOrder
);

/**
 * @route GET /order/list
 * @desc Lista todos os pedidos cadastrados
 * @access Protegido (JWT)
 * @note Esta rota DEVE vir antes de /:orderId para evitar conflito
 */
router.get(
  '/list',
  authenticateToken,
  orderController.getAllOrders
);

/**
 * @route GET /order/:orderId
 * @desc Obtém um pedido pelo ID (número do pedido)
 * @access Protegido (JWT)
 */
router.get(
  '/:orderId',
  authenticateToken,
  orderController.getOrderById
);

/**
 * @route PUT /order/:orderId
 * @desc Atualiza um pedido existente pelo ID
 * @access Protegido (JWT)
 */
router.put(
  '/:orderId',
  authenticateToken,
  orderValidationRules,
  validate,
  orderController.updateOrder
);

/**
 * @route DELETE /order/:orderId
 * @desc Deleta um pedido pelo ID
 * @access Protegido (JWT)
 */
router.delete(
  '/:orderId',
  authenticateToken,
  orderController.deleteOrder
);

module.exports = router;
