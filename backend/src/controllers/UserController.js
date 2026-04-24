const User = require('../models/User');

class UserController {
  register = async (req, res, next) => {
    try {
      const { name, email, password, role, courses } = req.body;

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
        courses: courses || []
      });

      await user.save();

      return res.status(201).json({
        message: "Usuário registrado com sucesso.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          courses: user.courses
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

  // =========================================================================
  // Implementação de Stubs (Esboços) para os métodos faltante
  //  O Express.Router exige que os handlers sejam do 
  // tipo 'Function'. A ausência desses métodos na classe resultava em 'undefined'.
  // O status HTTP 501 (Not Implemented) sinaliza pela RFC 7231 que o servidor 
  // não suporta a funcionalidade requerida no momento.
  // =========================================================================

  getProfile = async (req, res, next) => {
    return res.status(501).json({ error: "NOT_IMPLEMENTED: Método getProfile em desenvolvimento." });
  }

  getAllUsers = async (req, res, next) => {
    return res.status(501).json({ error: "NOT_IMPLEMENTED: Método getAllUsers em desenvolvimento." });
  }

  getUserById = async (req, res, next) => {
    return res.status(501).json({ error: "NOT_IMPLEMENTED: Método getUserById em desenvolvimento." });
  }

  updateUser = async (req, res, next) => {
    return res.status(501).json({ error: "NOT_IMPLEMENTED: Método updateUser em desenvolvimento." });
  }

  deleteUser = async (req, res, next) => {
    return res.status(501).json({ error: "NOT_IMPLEMENTED: Método deleteUser em desenvolvimento." });
  }
  // =========================================================================
  // FIM DA ALTERAÇÃO
  // =========================================================================
}

module.exports = new UserController();