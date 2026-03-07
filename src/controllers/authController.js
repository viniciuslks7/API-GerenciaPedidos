/**
 * @fileoverview Controller de autenticação — gerencia login e geração de tokens JWT.
 * @author Vinicius (viniciuslks7)
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
require('dotenv').config();

/**
 * Autentica o usuário e retorna um token JWT.
 * POST /auth/login
 * @param {Object} req - Express request (body com username e password)
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Valida campos obrigatórios
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Os campos username e password são obrigatórios',
        error: 'VALIDATION_ERROR'
      });
    }

    // Busca o usuário no banco de dados
    const result = await query(
      'SELECT id, username, password FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique username e password.',
        error: 'INVALID_CREDENTIALS'
      });
    }

    const user = result.rows[0];

    // Verifica a senha com bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique username e password.',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        username: user.username
      },
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};
