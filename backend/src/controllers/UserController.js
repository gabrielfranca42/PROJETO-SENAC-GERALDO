const mongoose = require('mongoose');
const User = require('../models/User');

class UserController {
  /**
   * POST /api/v1/users/register
   * Cadastra um novo usuário (coordenador, aluno, admin).
   */
  register = async (req, res) => {
    try {
      const { name, email, password, role, courses, matricula } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: "BAD_REQUEST: Nome, e-mail e senha são obrigatórios." 
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ 
          error: "CONFLICT: Este e-mail já está cadastrado no sistema." 
        });
      }

      const user = new User({
        name,
        email,
        password,
        role: role || 'STUDENT',
        courses: courses || [],
        matricula: matricula || null
      });

      await user.save();

      return res.status(201).json({
        message: "Usuário registrado com sucesso.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          courses: user.courses,
          matricula: user.matricula
        }
      });

    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: `BAD_REQUEST: Erro de validação. Detalhes: ${error.message}`
        });
      }
      return res.status(500).json({ 
        error: `INTERNAL_SERVER_ERROR: Falha ao registrar usuário. Detalhes: ${error.message}` 
      });
    }
  }

  /**
   * GET /api/v1/users/me
   * Retorna os dados do usuário autenticado.
   */
  getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: "NOT_FOUND: Usuário não encontrado." });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/users
   * Lista todos os usuários. Aceita query param ?role= para filtrar.
   * Ex: GET /api/v1/users?role=COORDINATOR
   */
  getAllUsers = async (req, res) => {
    try {
      const query = {};
      
      // Filtro por role via query string
      if (req.query.role) {
        query.role = req.query.role.toUpperCase();
      }

      // NOVO: Filtro por curso
      if (req.query.courseId) {
        query.courses = new mongoose.Types.ObjectId(req.query.courseId);
      }

      const users = await User.find(query).select('-password -__v');
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/users/:id
   * Busca um usuário por ID.
   */
  getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password -__v');
      if (!user) {
        return res.status(404).json({ error: "NOT_FOUND: Usuário não encontrado." });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Atualiza dados de um usuário.
   */
  updateUser = async (req, res) => {
    try {
      const updates = req.body;
      
      // Não permitir atualização de senha por esta rota
      delete updates.password;

      const user = await User.findByIdAndUpdate(
        req.params.id, 
        updates, 
        { new: true, runValidators: true }
      ).select('-password -__v');

      if (!user) {
        return res.status(404).json({ error: "NOT_FOUND: Usuário não encontrado." });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/v1/users/:id
   * Remove um usuário.
   */
  deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "NOT_FOUND: Usuário não encontrado." });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();