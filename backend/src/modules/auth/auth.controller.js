const authService = require('./auth.service');

class AuthController {
  /**
   * POST /api/v1/auth/login
   * Autenticação de usuários — gera JWT.
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      return res.status(200).json({
        message: "Autenticação bem-sucedida",
        token: result.token,
        user: result.user
      });
    } catch (error) {
      const status = error.status || 500;
      const message = status === 500 ? `INTERNAL_SERVER_ERROR: Falha na autenticação. Detalhes: ${error.message}` : error.message;
      return res.status(status).json({ error: message });
    }
  }
}

module.exports = new AuthController();