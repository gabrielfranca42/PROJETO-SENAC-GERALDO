const User = require('../models/User');

class UserController {
  async register(req, res) {
    try {
      const { name, email, password, role, courses } = req.body;

      // 1. Validação de campos obrigatórios
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: "BAD_REQUEST: Nome, e-mail e senha são obrigatórios." 
        });
      }

      // 2. Prevenção de duplicidade (Index Unique)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ 
          error: "CONFLICT: Este e-mail já está cadastrado no sistema." 
        });
      }

      // 3. Instanciação do Documento
      // O campo "password" será interceptado e transformado em Hash pelo bcryptjs antes de salvar
      const user = new User({
        name,
        email,
        password,
        role: role || 'STUDENT', // Se não enviado, assume STUDENT como fallback seguro
        courses: courses || []   // Array de IDs de cursos associados
      });

      await user.save();

      // 4. Retorno padronizado (omitindo a senha por segurança)
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
      return res.status(500).json({ 
        error: `INTERNAL_SERVER_ERROR: Falha ao registrar usuário. Detalhes: ${error.message}` 
      });
    }
  }
}

module.exports = new UserController();