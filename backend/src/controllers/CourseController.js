const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');

class CourseController {
  async createCourse(req, res) {
    try {
      const { name, totalHoursRequired, categories } = req.body;

      // 1. Criação do Curso
      const course = new Course({
        name,
        totalHoursRequired,
        categories // Array de CategoryRuleSchema (ex: Extensão: 40h, Pesquisa: 20h)
      });
      
      await course.save();

      // 2. Registro do Log de Auditoria
      await AuditLog.create({
        action: 'COURSE_CREATED',
        performedBy: req.user.id, // Injetado pelo JWT no middleware authorize
        targetResource: 'Course',
        resourceId: course._id,
        details: { courseName: name }
      });

      return res.status(201).json(course);
    } catch (error) {
      // Retorna 400 em caso de falha de validação do Mongoose ou duplicidade
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CourseController();