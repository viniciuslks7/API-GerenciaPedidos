/**
 * @fileoverview Middleware de validação de dados de entrada.
 * Utiliza express-validator para garantir que o body do request
 * contém todos os campos obrigatórios com os tipos corretos.
 * @author Vinicius (viniciuslks7)
 */

const { body, validationResult } = require('express-validator');

/**
 * Regras de validação para criação/atualização de pedido.
 * Verifica campos obrigatórios e tipos conforme a Constituição (Seção 7).
 */
const orderValidationRules = [
  body('numeroPedido')
    .notEmpty()
    .withMessage('O campo numeroPedido é obrigatório')
    .isString()
    .withMessage('O campo numeroPedido deve ser uma string')
    .isLength({ max: 100 })
    .withMessage('O campo numeroPedido deve ter no máximo 100 caracteres'),

  body('valorTotal')
    .notEmpty()
    .withMessage('O campo valorTotal é obrigatório')
    .isNumeric()
    .withMessage('O campo valorTotal deve ser um número')
    .isFloat({ max: 9999999999.99 })
    .withMessage('O campo valorTotal excede o limite máximo permitido (9999999999.99)'),

  body('dataCriacao')
    .notEmpty()
    .withMessage('O campo dataCriacao é obrigatório')
    .isString()
    .withMessage('O campo dataCriacao deve ser uma string de data válida'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('O campo items deve ser um array com pelo menos 1 item'),

  body('items.*.idItem')
    .notEmpty()
    .withMessage('O campo idItem é obrigatório em cada item'),

  body('items.*.quantidadeItem')
    .notEmpty()
    .withMessage('O campo quantidadeItem é obrigatório em cada item')
    .isInt({ min: 1 })
    .withMessage('O campo quantidadeItem deve ser um número inteiro positivo'),

  body('items.*.valorItem')
    .notEmpty()
    .withMessage('O campo valorItem é obrigatório em cada item')
    .isNumeric()
    .withMessage('O campo valorItem deve ser um número')
    .isFloat({ max: 9999999999.99 })
    .withMessage('O campo valorItem excede o limite máximo permitido (9999999999.99)')
];

/**
 * Middleware que verifica o resultado da validação.
 * Se houver erros, retorna 400 com detalhes dos campos inválidos.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      campo: err.path,
      mensagem: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos. Verifique os campos obrigatórios.',
      error: 'VALIDATION_ERROR',
      details: formattedErrors
    });
  }

  next();
};

module.exports = {
  orderValidationRules,
  validate
};
