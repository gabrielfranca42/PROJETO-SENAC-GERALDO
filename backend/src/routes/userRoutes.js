const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// IMPORTAÇÕES DE MIDDLEWARES
const authenticate = require('../middlewares/auth');     // Importa o validador de JWT
const authorize = require('../middlewares/authRole');    // Importa o validador de permissão (RBAC)

/**
 * POST /api/v1/users/register
 * Rota de registro (Criação de Usuário).
  * Esta rota é pública e não exige autenticação, pois é o ponto de entrada para novos usuários.
  * A validação de dados é realizada no controller, e a senha é automaticamente hashada pelo middleware 'pre-save' do Mongoose.
 */
router.post('/register', UserController.register);

/**
 * GET /api/v1/users/me
 * Busca o perfil do próprio usuário autenticado.
 * Inserida ANTES da rota '/:id' para que a string "me" não seja 
 * interpretada pelo Express como um ID de usuário. Não exige role, apenas token válido.
 */
router.get(
  '/me',
  authenticate,
  UserController.getProfile
);

/**
 * GET /api/v1/users
 * Listagem de todos os usuários.
 * Exige autenticação e privilégios administrativos. 
 * A exposição de uma lista de usuários é um risco de segurança e violação de privacidade.
 */
router.get(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  UserController.getAllUsers
);

/**
 * GET /api/v1/users/:id
 * Busca de um usuário específico pelo ID.
 * Acesso restrito a administradores para auditoria ou suporte.
 */
router.get(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  UserController.getUserById
);

/**
 * PUT /api/v1/users/:id
 * Atualização dos dados de um usuário.
 * Modificação de dados de terceiros deve ser restrita à administração.
 */
router.put(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  UserController.updateUser
);

/**
 * DELETE /api/v1/users/:id
 * Remoção de um usuário do sistema.
 * Operação máxima de risco. Restrita exclusivamente ao SUPER_ADMIN.
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN']),
  UserController.deleteUser
);

module.exports = router;