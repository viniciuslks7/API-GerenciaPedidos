/**
 * @fileoverview Rotas de autenticação — endpoint de login para obter token JWT.
 * Rota pública (não requer autenticação).
 * @author Vinicius (viniciuslks7)
 */

const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

/**
 * @route POST /auth/login
 * @desc Autentica o usuário e retorna um token JWT
 * @access Público
 */
router.post('/login', authController.login);

module.exports = router;
