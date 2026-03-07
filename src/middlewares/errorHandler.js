/**
 * @fileoverview Middleware global de tratamento de erros.
 * Captura erros lançados pelos controllers/services e retorna
 * respostas JSON padronizadas conforme a Seção 5 da Constituição.
 * @author Vinicius (viniciuslks7)
 */

/**
 * Middleware de tratamento de erros do Express.
 * Intercepta todos os erros e retorna resposta padronizada.
 * Em produção, não expõe stack traces.
 * @param {Error} err - Erro capturado
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next (obrigatório para o Express reconhecer como error handler)
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Define o código de status HTTP (padrão: 500)
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Log do erro no servidor (sempre)
  console.error(`[ERROR] ${statusCode} - ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Resposta padronizada de erro
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500
      ? 'Erro interno do servidor'
      : err.message,
    error: errorCode
  });
};

module.exports = errorHandler;
