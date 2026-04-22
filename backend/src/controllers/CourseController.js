const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');

/**
 * @class CourseController
 * @description Orquestrador de requisições HTTP para a entidade Course.
 * Implementa validações de acesso baseadas em RBAC e Multitenancy.
 */
class CourseController {
  
  // ------------------------------------------------------------------------
  // CREATE (POST /api/v1/courses)
  // ------------------------------------------------------------------------
  async createCourse(req, res) {
    try {
      const { name, totalHoursRequired, semesterMaxHours, categories } = req.body;
      const user = req.user; // Injetado pelo middleware JWT

      // Validação de Segurança: Apenas SUPER_ADMIN deve criar novos domínios (Cursos).
      if (user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ 
          error: "FORBIDDEN: Apenas administradores globais podem criar novos cursos." 
        });
      }

      // 1. Criação do Curso com os novos limites semestrais bidimensionais
      const course = new Course({
        name,
        totalHoursRequired,
        semesterMaxHours, 
        categories // Espera array contendo { name, maxHours, semesterMaxHours }
      });
      
      await course.save();

      // 2. Rastreabilidade (AuditLog)
      await AuditLog.create({
        action: 'COURSE_CREATED',
        performedBy: user.id, 
        targetResource: 'Course',
        resourceId: course._id,
        details: { courseName: name }
      });

      // Retorna 201 Created (RFC 9110)
      return res.status(201).json(course);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // READ ALL (GET /api/v1/courses)
  // ------------------------------------------------------------------------
  async getAllCourses(req, res) {
    try {
      const user = req.user;
      let query = {};

      // Filtragem por Multitenancy: Coordenadores só enxergam os cursos que gerenciam
      if (user.role === 'COORDINATOR') {
        query = { _id: { $in: user.courses } };
      }

      const courses = await Course.find(query).select('-__v'); // Exclui version key interna do Mongoose
      return res.status(200).json(courses);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // READ ONE (GET /api/v1/courses/:id)
  // ------------------------------------------------------------------------
  async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Proteção contra IDOR (Insecure Direct Object Reference)
      if (user.role === 'COORDINATOR' && !user.courses.includes(id)) {
        return res.status(403).json({ 
          error: "FORBIDDEN: Acesso negado a este curso." 
        });
      }

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ error: "NOT_FOUND: Curso não localizado." });
      }

      return res.status(200).json(course);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // UPDATE (PUT /api/v1/courses/:id)
  // ------------------------------------------------------------------------
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = req.user;

      // 1. Validação Multitenancy Estrita (Aprovado na análise anterior)
      if (user.role !== 'SUPER_ADMIN' && !user.courses.includes(id)) {
        return res.status(403).json({ 
          error: "FORBIDDEN: Você não possui autorização para alterar as regras deste curso." 
        });
      }

      // 2. Atualização Atômica via Mongoose
      // { new: true } garante o retorno do documento atualizado
      // { runValidators: true } força a revalidação do Schema (ex: checar required fields)
      const updatedCourse = await Course.findByIdAndUpdate(id, updates, { 
        new: true, 
        runValidators: true 
      });

      if (!updatedCourse) {
        return res.status(404).json({ error: "NOT_FOUND: Curso não localizado para atualização." });
      }

      // 3. Rastreabilidade (AuditLog)
      await AuditLog.create({
        action: 'COURSE_UPDATED',
        performedBy: user.id,
        targetResource: 'Course',
        resourceId: updatedCourse._id,
        details: { updatedFields: Object.keys(updates) }
      });

      return res.status(200).json(updatedCourse);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // DELETE (DELETE /api/v1/courses/:id)
  // ------------------------------------------------------------------------
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Segurança: Destruição de recursos arquiteturais restrita ao SUPER_ADMIN
      if (user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ 
          error: "FORBIDDEN: Apenas administradores globais podem excluir cursos." 
        });
      }

      const course = await Course.findByIdAndDelete(id);
      
      if (!course) {
        return res.status(404).json({ error: "NOT_FOUND: Curso não localizado." });
      }

      await AuditLog.create({
        action: 'COURSE_DELETED',
        performedBy: user.id,
        targetResource: 'Course',
        resourceId: id,
        details: { courseName: course.name }
      });

      // Retorna 204 No Content (RFC 9110) para deleções bem-sucedidas
      return res.status(204).send(); 
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CourseController();