const userService = require('./users.service');

class UserController {
  register = async (req, res) => {
    try {
      const user = await userService.register(req.body);
      return res.status(201).json({ message: "Usuário registrado com sucesso.", user });
    } catch (error) {
      if (error.name === 'ValidationError') return res.status(400).json({ error: `BAD_REQUEST: Erro de validação. Detalhes: ${error.message}` });
      return res.status(error.status || 500).json({ error: error.status ? error.message : `INTERNAL_SERVER_ERROR: Falha ao registrar usuário. Detalhes: ${error.message}` });
    }
  }

  getProfile = async (req, res) => {
    try {
      const user = await userService.getProfile(req.user.id);
      return res.status(200).json(user);
    } catch (error) { return res.status(error.status || 500).json({ error: error.message }); }
  }

  getAllUsers = async (req, res) => {
    try {
      const users = await userService.getAllUsers(req.user, req.query);
      return res.status(200).json(users);
    } catch (error) { return res.status(error.status || 500).json({ error: error.message }); }
  }

  getUserById = async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json(user);
    } catch (error) { return res.status(error.status || 500).json({ error: error.message }); }
  }

  updateUser = async (req, res) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json(user);
    } catch (error) { return res.status(error.status || 400).json({ error: error.message }); }
  }

  deleteUser = async (req, res) => {
    try {
      await userService.deleteUser(req.params.id, req.user);
      return res.status(204).send();
    } catch (error) { return res.status(error.status || 500).json({ error: error.message }); }
  }
}
module.exports = new UserController();