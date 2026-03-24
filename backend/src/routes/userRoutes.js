const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// POST /api/v1/users/register
// Rota para criação de novos perfis (Alunos, Coordenadores ou Admins)
router.post('/register', UserController.register);

module.exports = router;