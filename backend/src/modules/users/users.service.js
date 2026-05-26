const userRepository = require('./users.repository');
const EmailService = require('../../utils/EmailService');

class UserService {
  async register(data) {
    const { name, email, role, courses, matricula } = data;
    let { password } = data;

    if (!name || !email) throw Object.assign(new Error("BAD_REQUEST: Nome e e-mail são obrigatórios."), { status: 400 });

    const isGeneratedPassword = !password;
    if (!password) password = Math.random().toString(36).slice(-8);

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) throw Object.assign(new Error("CONFLICT: Este e-mail já está cadastrado no sistema."), { status: 409 });

    const user = await userRepository.save({
      name, email, password, role: role || 'STUDENT', courses: courses || [], matricula: matricula || null
    });

    EmailService.sendWelcomeEmail(email, name, password).catch(console.error);
    return {
      id: user._id, name: user.name, email: user.email, role: user.role, courses: user.courses, matricula: user.matricula
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw Object.assign(new Error("NOT_FOUND: Usuário não encontrado."), { status: 404 });
    return user;
  }

  async getAllUsers(currentUser, queryParams) {
    const query = {};
    if (queryParams.role) query.role = queryParams.role.toUpperCase();

    if (currentUser.role === 'COORDINATOR') {
      const userCourseIds = currentUser.courses || [];
      if (queryParams.courseId) {
        if (!userCourseIds.includes(queryParams.courseId)) throw Object.assign(new Error("FORBIDDEN: Você não tem permissão para acessar este curso."), { status: 403 });
        query.courses = queryParams.courseId;
      } else {
        query.courses = { $in: userCourseIds };
      }
      query.role = 'STUDENT';
    } else if (queryParams.courseId) {
      query.courses = queryParams.courseId;
    }
    return await userRepository.find(query);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw Object.assign(new Error("NOT_FOUND: Usuário não encontrado."), { status: 404 });
    return user;
  }

  async updateUser(id, updates) {
    delete updates.password;
    const user = await userRepository.update(id, updates);
    if (!user) throw Object.assign(new Error("NOT_FOUND: Usuário não encontrado."), { status: 404 });
    return user;
  }

  async deleteUser(id, currentUser) {
    const userToDelete = await userRepository.findByIdWithPassword(id);
    if (!userToDelete) throw Object.assign(new Error("NOT_FOUND: Usuário não encontrado."), { status: 404 });

    if (currentUser.role === 'COORDINATOR') {
      if (userToDelete.role !== 'STUDENT') throw Object.assign(new Error("FORBIDDEN: Coordenadores só podem excluir alunos."), { status: 403 });
      const isStudentInMyCourse = userToDelete.courses.some(cId => currentUser.courses.includes(String(cId)));
      if (!isStudentInMyCourse) throw Object.assign(new Error("FORBIDDEN: Este aluno não pertence aos seus cursos gerenciados."), { status: 403 });
    } else if (currentUser.role === 'ADMIN' && userToDelete.role === 'SUPER_ADMIN') {
      throw Object.assign(new Error("FORBIDDEN: Administradores não podem excluir Super Administradores."), { status: 403 });
    }

    await userRepository.delete(id);
  }
}
module.exports = new UserService();
