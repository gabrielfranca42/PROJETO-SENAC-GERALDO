const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 1. Validação de presença de dados
      if (!email || !password) {
        return res.status(400).json({ 
          error: "BAD_REQUEST: E-mail e senha são obrigatórios." 
        });
      }

      // 2. Busca do usuário no banco de dados
      const user = await User.findOne({ email });
      if (!user) {
        // Retornamos mensagem genérica por segurança (não revelar se o email existe)
        return res.status(401).json({ 
          error: "UNAUTHORIZED: Credenciais inválidas." 
        });
      }

      // 3. Validação criptográfica da senha (usando o método do Mongoose)
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          error: "UNAUTHORIZED: Credenciais inválidas." 
        });
      }

      // 4. Montagem do Payload do JWT (Injetando a regra de negócio)
      // É ISSO AQUI que o nosso `authRole.js` vai ler no `req.user` depois
      const payload = {
        id: user._id,
        role: user.role,
        courses: user.courses 
      };

      // 5. Assinatura do Token (válido por 8 horas para cobrir um turno acadêmico)
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

      // 6. Resposta de Sucesso
      return res.status(200).json({
        message: "Autenticação bem-sucedida",
        token,
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email,
          role: user.role,
          courses: user.courses
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