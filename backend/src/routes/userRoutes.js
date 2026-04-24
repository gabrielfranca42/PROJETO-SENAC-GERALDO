const express = require('express');
const router = express.Router();

// =========================================================================
//  Remoção das múltiplas declarações 'const authenticate'
// e 'const authorize' para adequação à RFC ECMA-262 (Block Scoping). 
// Centralização das importações no topo do arquivo garante a correta
// resolução do grafo de dependências do módulo CommonJS.
// =========================================================================

// 1. Importação da instância Singleton do Controlador
const UserController = require('../controllers/UserController');

// 2. Importações diretas dos Middlewares (Únicas declarações)
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
 * Restrito a administradores.
 */
router.get(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  UserController.getAllUsers
);

/**
 * GET /api/v1/users/:id
 * Busca por ID (Restrito).
 */
router.get(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  UserController.getUserById
);

/**
 * PUT /api/v1/users/:id
 * Atualização (Restrito).
 */
router.put(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  UserController.updateUser
);

/**
 * DELETE /api/v1/users/:id
 * Remoção (Restrito a Super Admin).
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN']),
  UserController.deleteUser
);

module.exports = router;