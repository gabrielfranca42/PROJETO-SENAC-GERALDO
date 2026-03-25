const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController'); // Certifique-se da instância
const authorize = require('../middlewares/authRole');

// 1. O middleware 'authorize' RETORNA a função que o Express usará.
// 2. 'UserController.register' deve ser a função final.
router.post('/register', authorize(['SUPER_ADMIN']), UserController.register);

module.exports = router;