const express = require('express');
const router = express.Router();
// Importa o AuthController (certifique-se de que este ficheiro também existe na pasta controllers)
const AuthController = require('../controllers/AuthController');

// Define a rota pública de login
router.post('/login', AuthController.login);

// Exporta as rotas para serem usadas no app.js
module.exports = router;2