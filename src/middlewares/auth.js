/**
 * @fileoverview Middleware de autenticação JWT.
 * Verifica a presença e validade do token JWT no header Authorization.
 * Endpoints públicos são definidos por exclusão no arquivo de rotas.
 * @author Vinicius (viniciuslks7)
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware que valida o token JWT nas requisições protegidas.
 * Espera o header: Authorization: Bearer <token>
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
const authenticateToken = (req, res, next) => {
  // Extrai o token do header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido. Envie o header Authorization: Bearer <token>',
      error: 'MISSING_TOKEN'
    });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Disponibiliza dados do usuário no request
    next();
  } catch (error) {
    // Token inválido ou expirado
    const message = error.name === 'TokenExpiredError'
      ? 'Token expirado. Faça login novamente.'
      : 'Token inválido. Verifique suas credenciais.';

    return res.status(401).json({
      success: false,
      message,
      error: 'INVALID_TOKEN'
    });
  }
};

module.exports = authenticateToken;
