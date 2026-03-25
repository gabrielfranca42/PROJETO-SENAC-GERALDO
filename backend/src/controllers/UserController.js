const User = require('../models/User');

class UserController {
  /**
   * Registra um novo usuário no sistema.
   * @param {Object} req - Express Request Object
   * @param {Object} res - Express Response Object
   * @param {Function} next - Express Next Function (para tratamento global de erros)
   */
  register = async (req, res, next) => {
    try {
      const { name, email, password, role, courses } = req.body;

      // 1. Validação de Schema (Campos Obrigatórios)
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: "BAD_REQUEST: Nome, e-mail e senha são obrigatórios." 
        });
      }

      // 2. Verificação de Existência (Prevenção de Duplicate Key Error)
      // Documentação MongoDB: https://www.mongodb.com/docs/manual/core/index-unique/
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ 
          error: "CONFLICT: Este e-mail já está cadastrado no sistema." 
        });
      }

      // 3. Persistência de Dados
      // O middleware 'pre-save' definido no Model User cuidará do hash da senha.
      const user = new User({
        name,
        email,
        password,
        role: role || 'STUDENT',
        courses: courses || []
      });

      await user.save();

      // 4. Resposta com Projeção de Dados (Data Shaping)
      // O campo password já possui 'select: false' no Schema, mas a limpeza manual reforça a segurança.
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
      // Se o erro for de validação do Mongoose (ex: enum inválido), retorna 400 em vez de 500
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: `BAD_REQUEST: Erro de validação. Detalhes: ${error.message}`
        });
      }

      // Encaminha erros inesperados para o Middleware Global de Erros (se configurado)
      // ou retorna 500 conforme sua estrutura atual.
      return res.status(500).json({ 
        error: `INTERNAL_SERVER_ERROR: Falha ao registrar usuário. Detalhes: ${error.message}` 
      });
    }
  }
}

// Exporta uma instância da classe para garantir o padrão Singleton
module.exports = new UserController();