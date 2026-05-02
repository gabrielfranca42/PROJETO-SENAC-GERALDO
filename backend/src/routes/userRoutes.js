const express = require('express');
const router = express.Router();

// Importações de Controllers e Middlewares
const UserController = require('../controllers/UserController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authRole');

// =========================================================================
// DEFINIÇÃO DE ROTAS HTTP
// =========================================================================

/**
 * POST /api/v1/users/register
 * Delega a requisição ao método 'register' do UserController.
 */
router.post('/register', UserController.register);

/**
 * GET /api/v1/users/me
 * Injeta o middleware de autenticação antes de buscar o perfil.
 */
router.get(
  '/me',
  authenticate,
  UserController.getProfile 
);

/**
 * GET /api/v1/users
 * Restrito a administradores. Aceita query param ?role= para filtrar.
 */
router.get(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']),
  UserController.getAllUsers
);

/**
 * GET /api/v1/users/:id
 * Busca por ID (Restrito).
 */
router.get(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']),
  UserController.getUserById
);

/**
 * PUT /api/v1/users/:id
 * Atualização (Restrito).
 */
router.put(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']),
  UserController.updateUser
);

/**
 * DELETE /api/v1/users/:id
 * Remoção (Restrito a Super Admin).
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'COORDINATOR']),
  UserController.deleteUser
);

module.exports = router;