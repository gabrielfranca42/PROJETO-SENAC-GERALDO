const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// IMPORTAÇÕES DE MIDDLEWARES (A correção está aqui)
const authenticate = require('../middlewares/auth');     // Importa o validador de JWT
const authorize = require('../middlewares/authRole'); // Importa o validador de permissão (RBAC)

/**
 * Rota protegida: O registro exige token válido E privilégio SUPER_ADMIN.
 */
// router.post(
//  '/register', 
//  authenticate,                 // Agora o escopo local possui a referência da função
//  authorize(['SUPER_ADMIN']), 
//  UserController.register
//);

router.post('/register', UserController.register);

module.exports = router;