const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const EmailService = require('../../utils/EmailService');

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      const error = new Error("BAD_REQUEST: E-mail e senha são obrigatórios.");
      error.status = 400;
      throw error;
    }

    const user = await authRepository.findUserByEmailWithPassword(email);
    if (!user) {
      const error = new Error("UNAUTHORIZED: Credenciais inválidas.");
      error.status = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("UNAUTHORIZED: Credenciais inválidas.");
      error.status = 401;
      throw error;
    }

    const payload = {
      id: user._id,
      role: user.role,
      courses: user.courses 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    // Notificação de login assíncrona
    EmailService.sendLoginAlert(user.email, user.name).catch(console.error);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        courses: user.courses,
        matricula: user.matricula
      }
    };
  }
}

module.exports = new AuthService();
