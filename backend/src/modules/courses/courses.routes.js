const express = require('express');
const router = express.Router();
const courseController = require('./courses.controller');
const authenticate = require('../../middlewares/auth');
const authorize = require('../../middlewares/authRole');

/**
 * POST /api/v1/courses
 * Criação de curso. Apenas SUPER_ADMIN ou ADMIN.
 */
router.post(
  '/', 
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']), 
  courseController.createCourse
);

/**
 * GET /api/v1/courses
 * Listagem de todos os cursos.
 */
router.get(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'STUDENT']),
  courseController.getAllCourses
);

/**
 * GET /api/v1/courses/:id
 * Busca de um curso específico pelo ID.
 */
router.get(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'STUDENT']),
  courseController.getCourseById
);

/**
 * GET /api/v1/courses/:id/stats
 * Estatísticas do curso para o dashboard.
 */
router.get(
  '/:id/stats',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']),
  courseController.getCourseStats
);

/**
 * PUT /api/v1/courses/:id
 * Atualização completa de um curso.
 */
router.put(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  courseController.updateCourse
);

/**
 * PATCH /api/v1/courses/:id
 * Atualização parcial de um curso.
 */
router.patch(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  courseController.patchCourse
);

/**
 * DELETE /api/v1/courses/:id
 * Remoção de um curso.
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN']),
  courseController.deleteCourse
);

// =========================================================================
// ROTAS DE CATEGORIAS (Regras) DENTRO DE UM CURSO
// =========================================================================

/**
 * POST /api/v1/courses/:id/categories
 * Adicionar uma nova categoria/regra a um curso.
 */
router.post(
  '/:id/categories',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  courseController.addCategory
);

/**
 * DELETE /api/v1/courses/:id/categories/:categoryId
 * Remover uma categoria/regra de um curso.
 */
router.delete(
  '/:id/categories/:categoryId',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  courseController.removeCategory
);

module.exports = router;