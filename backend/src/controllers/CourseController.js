const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const Activity = require('../models/Activity');
const AuditLog = require('../models/AuditLog');

/**
 * @class CourseController
 * @description Orquestrador de requisições HTTP para a entidade Course.
 */
class CourseController {
  
  // ------------------------------------------------------------------------
  // CREATE (POST /api/v1/courses)
  // ------------------------------------------------------------------------
  async createCourse(req, res) {
    try {
      const { name, totalHoursRequired, semesterMaxHours, categories, coordinator } = req.body;
      const user = req.user;

      const course = new Course({
        name,
        totalHoursRequired,
        semesterMaxHours: semesterMaxHours || 0,
        categories: categories || [],
        coordinator: coordinator || null
      });
      
      await course.save();

      await AuditLog.create({
        action: 'COURSE_CREATED',
        performedBy: user.id, 
        targetResource: 'Course',
        resourceId: course._id,
        details: { courseName: name }
      });

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

      // Filtragem por Multitenancy: Coordenadores só enxergam seus cursos
      if (user.role === 'COORDINATOR') {
        query = { _id: { $in: user.courses || [] } };
      }

      const courses = await Course.find(query).select('-__v');
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

      const updatedCourse = await Course.findByIdAndUpdate(id, updates, { 
        new: true, 
        runValidators: true 
      });

      if (!updatedCourse) {
        return res.status(404).json({ error: "NOT_FOUND: Curso não localizado para atualização." });
      }

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
  // PATCH (PATCH /api/v1/courses/:id)
  // ------------------------------------------------------------------------
  async patchCourse(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedCourse = await Course.findByIdAndUpdate(id, { $set: updates }, { 
        new: true, 
        runValidators: true 
      });

      if (!updatedCourse) {
        return res.status(404).json({ error: "NOT_FOUND: Curso não localizado." });
      }

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

      return res.status(204).send(); 
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // =========================================================================
  // CRUD DE CATEGORIAS (REGRAS) DENTRO DE UM CURSO
  // =========================================================================

  /**
   * POST /api/v1/courses/:id/categories
   * Adiciona uma categoria/regra ao curso.
   * Body: { name: "Pesquisa", maxHours: 60, semesterMaxHours: 30 }
   */
  async addCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, maxHours, semesterMaxHours } = req.body;
      const user = req.user;

      if (!name || maxHours === undefined) {
        return res.status(400).json({ 
          error: "BAD_REQUEST: 'name' e 'maxHours' são obrigatórios." 
        });
      }

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ error: "NOT_FOUND: Curso não localizado." });
      }

      const newCategory = {
        name,
        maxHours: Number(maxHours),
        semesterMaxHours: Number(semesterMaxHours) || 0
      };

      course.categories.push(newCategory);
      await course.save();

      // Retorna a categoria recém-adicionada (última do array)
      const addedCategory = course.categories[course.categories.length - 1];

      await AuditLog.create({
        action: 'CATEGORY_ADDED',
        performedBy: user.id,
        targetResource: 'Course',
        resourceId: course._id,
        details: { categoryName: name, maxHours }
      });

      return res.status(201).json(addedCategory);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/v1/courses/:id/categories/:categoryId
   * Remove uma categoria/regra do curso.
   */
  async removeCategory(req, res) {
    try {
      const { id, categoryId } = req.params;
      const user = req.user;

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ error: "NOT_FOUND: Curso não localizado." });
      }

      const categoryIndex = course.categories.findIndex(
        c => c._id.toString() === categoryId
      );

      if (categoryIndex === -1) {
        return res.status(404).json({ error: "NOT_FOUND: Categoria não encontrada neste curso." });
      }

      const removedCategory = course.categories[categoryIndex];
      course.categories.splice(categoryIndex, 1);
      await course.save();

      await AuditLog.create({
        action: 'CATEGORY_REMOVED',
        performedBy: user.id,
        targetResource: 'Course',
        resourceId: course._id,
        details: { categoryName: removedCategory.name }
      });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/courses/:id/stats
   * Retorna estatísticas de um curso (ou todos gerenciados) para o dashboard do coordenador.
   */
  async getCourseStats(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      let courseIds = [];

      if (id === 'all') {
        // Se for 'all', pega todos os cursos do coordenador (ou todos se for ADMIN)
        if (user.role === 'COORDINATOR') {
          courseIds = user.courses.map(cId => new mongoose.Types.ObjectId(cId));
        } else {
          const allCourses = await Course.find({});
          courseIds = allCourses.map(c => c._id);
        }
      } else {
        // Verificar se curso existe
        const course = await Course.findById(id);
        if (!course) {
          return res.status(404).json({ error: "NOT_FOUND: Curso não localizado." });
        }

        // Verificação de permissão: Coordenador só vê stats dos seus cursos
        if (user.role === 'COORDINATOR' && !user.courses.includes(id)) {
          return res.status(403).json({ error: "FORBIDDEN: Você não tem permissão para ver estatísticas deste curso." });
        }
        courseIds = [new mongoose.Types.ObjectId(id)];
      }

      // 1. Total de Alunos nos cursos selecionados
      const totalAlunos = await User.countDocuments({ 
        role: 'STUDENT', 
        courses: { $in: courseIds } 
      });

      // 2. Estatísticas de Atividades
      const activitiesStats = await Activity.aggregate([
        { $match: { course: { $in: courseIds } } },
        { 
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalHours: { $sum: "$hoursClaimed" }
          }
        }
      ]);

      // Formatar estatísticas de atividades
      const stats = {
        totalAlunos,
        pendentes: 0,
        aprovadas: 0,
        rejeitadas: 0,
        totalHorasAprovadas: 0
      };

      activitiesStats.forEach(item => {
        if (item._id === 'PENDING') stats.pendentes = item.count;
        if (item._id === 'APPROVED') {
          stats.aprovadas = item.count;
          stats.totalHorasAprovadas = item.totalHours;
        }
        if (item._id === 'REJECTED') stats.rejeitadas = item.count;
      });

      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CourseController();