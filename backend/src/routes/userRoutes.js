
// userRoutes.js (Apenas a seção de importações)
const express = require('express');
const router = express.Router();

// Importação da instância da classe (NÃO usar destructuring aqui)
const UserController = require('../controllers/UserController');

// Importação direta da função exportada via module.exports = function_name
const authenticate = require('../middlewares/auth'); // Assumindo o mesmo padrão
const authorize = require('../middlewares/authRole');

// =========================================================================
// ALTERAÇÃO 1: Desestruturação do Controlador (Hipótese de Exportação)
// JUSTIFICATIVA TÉCNICA: Se o UserController exporta um objeto literal contendo 
// as funções de roteamento, extraímos apenas os métodos necessários via ECMAScript 
// Destructuring Assignment para garantir que passemos instâncias de 'Function' ao Router.
// =========================================================================
const { 
  register, 
  getProfile, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} = require('../controllers/UserController');

// =========================================================================
// ALTERAÇÃO 2: Desestruturação de Middlewares
// JUSTIFICATIVA TÉCNICA: Evita o TypeError caso '../middlewares/auth' exporte 
// { authenticate: [Function] } em vez de ser a própria função (module.exports = function...).
// =========================================================================
const { authenticate } = require('../middlewares/auth');     
const { authorize } = require('../middlewares/authRole');    

/**
 * POST /api/v1/users/register
 */
router.post('/register', register); // Alterado de UserController.register para a referência direta da função

/**
 * GET /api/v1/users/me
 */
router.get(
  '/me',
  authenticate,
  getProfile // Alterado de UserController.getProfile para a referência direta
);

/**
 * GET /api/v1/users
 */
router.get(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  getAllUsers
);

/**
 * GET /api/v1/users/:id
 */
router.get(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  getUserById
);

/**
 * PUT /api/v1/users/:id
 */
router.put(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  updateUser
);

/**
 * DELETE /api/v1/users/:id
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN']),
  deleteUser
);

module.exports = router;