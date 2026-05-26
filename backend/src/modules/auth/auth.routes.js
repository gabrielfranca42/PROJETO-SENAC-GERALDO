const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

/**
 * POST /api/v1/auth/login
 * Rota pública para autenticação de usuários (Geração de Access Token).
 */
router.post('/login', authController.login.bind(authController));

module.exports = router;