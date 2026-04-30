const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

/**
 * POST /api/v1/auth/login
 * Rota pública para autenticação de usuários (Geração de Access Token).
 */
router.post('/login', AuthController.login);

module.exports = router;