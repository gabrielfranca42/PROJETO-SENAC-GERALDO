const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  /**
   * POST /api/v1/auth/login
   * Autenticação de usuários — gera JWT.
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: "BAD_REQUEST: E-mail e senha são obrigatórios." 
        });
      }

      // Busca do usuário (incluindo a senha para comparação)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ 
          error: "UNAUTHORIZED: Credenciais inválidas." 
        });
      }

      // Validação da senha
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          error: "UNAUTHORIZED: Credenciais inválidas." 
        });
      }

      // Payload do JWT
      const payload = {
        id: user._id,
        role: user.role,
        courses: user.courses 
      };

      // Assinatura do Token (8 horas)
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

      // Resposta
      return res.status(200).json({
        message: "Autenticação bem-sucedida",
        token,
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
      return res.status(500).json({ 
        error: `INTERNAL_SERVER_ERROR: Falha na autenticação. Detalhes: ${error.message}` 
      });
    }
  }
}

module.exports = new AuthController();