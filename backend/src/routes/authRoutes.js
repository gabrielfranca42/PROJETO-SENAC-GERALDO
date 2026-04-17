const express = require('express');
const router = express.Router();
// Importa o AuthController
const AuthController = require('../controllers/AuthController');
// Importa o middleware de autorização para proteger a rota de logout (se necessário)
const authorize = require('../middlewares/authRole');

/**
 * POST /api/v1/auth/login
 * Rota pública para autenticação de usuários (Geração de Access Token).
 */
router.post('/login', AuthController.login);

/**
 * POST /api/v1/auth/register
 * Rota pública para criação de uma nova conta de usuário.
 * Decisão Técnica: Em sistemas abertos, o registro é público. Se o seu sistema for fechado 
 * (apenas admins criam usuários), esta rota deverá receber o middleware 'authorize'.
 */
router.post('/register', AuthController.register);

/**
 * POST /api/v1/auth/refresh-token
 * Rota pública (requer envio do refresh token no body ou cookie seguro).
 * Decisão Técnica: Essencial para segurança em arquiteturas baseadas em JWT para 
 * emitir um novo access token sem exigir novo login do usuário.
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * POST /api/v1/auth/forgot-password
 * Rota pública para solicitar a redefinição de senha (geralmente envia um e-mail com link/token).
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * POST /api/v1/auth/reset-password
 * Rota pública para efetivar a troca de senha recebendo o token enviado por e-mail e a nova senha.
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * POST /api/v1/auth/logout
 * Invalida o token atual do usuário.
 * Decisão Técnica: O ideal é que apenas usuários logados possam fazer logout. Como não conheço
 * a implementação exata do seu middleware para "qualquer usuário logado", adicionei os roles padrões.
 * Se o seu middleware aceitar um parâmetro diferente para "qualquer autenticado", ajuste a array.
 */
router.post(
  '/logout', 
  authorize(['SUPER_ADMIN', 'ADMIN', 'STUDENT']), 
  AuthController.logout
);

module.exports = router;