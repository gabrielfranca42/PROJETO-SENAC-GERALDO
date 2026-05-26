const express = require('express');
const router = express.Router();

// Importações de Controllers e Middlewares
const userController = require('./users.controller');
const authenticate = require('../../middlewares/auth');
const authorize = require('../../middlewares/authRole');

// =========================================================================
// DEFINIÇÃO DE ROTAS HTTP
// =========================================================================

/**
 * POST /api/v1/users/register
 * Delega a requisição ao método 'register' do UserController.
 */
router.post('/register', userController.register);

/**
 * GET /api/v1/users/me
 * Injeta o middleware de autenticação antes de buscar o perfil.
 */
router.get(
  '/me',
  authenticate,
  userController.getProfile 
);

/**
 * GET /api/v1/users
 * Restrito a administradores. Aceita query param ?role= para filtrar.
 */
router.get(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']),
  userController.getAllUsers
);

/**
 * GET /api/v1/users/:id
 * Busca por ID (Restrito).
 */
router.get(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']),
  userController.getUserById
);

/**
 * PUT /api/v1/users/:id
 * Atualização (Restrito).
 */
router.put(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']),
  userController.updateUser
);

/**
 * DELETE /api/v1/users/:id
 * Remoção (Restrito a Super Admin).
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'COORDINATOR']),
  userController.deleteUser
);

module.exports = router;