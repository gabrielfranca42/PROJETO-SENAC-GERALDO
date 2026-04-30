const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/CourseController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authRole');

/**
 * POST /api/v1/courses
 * Criação de curso. Apenas SUPER_ADMIN ou ADMIN.
 */
router.post(
  '/', 
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']), 
  CourseController.createCourse
);

/**
 * GET /api/v1/courses
 * Listagem de todos os cursos.
 */
router.get(
  '/',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'STUDENT']),
  CourseController.getAllCourses
);

/**
 * GET /api/v1/courses/:id
 * Busca de um curso específico pelo ID.
 */
router.get(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'STUDENT']),
  CourseController.getCourseById
);

/**
 * PUT /api/v1/courses/:id
 * Atualização completa de um curso.
 */
router.put(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  CourseController.updateCourse
);

/**
 * PATCH /api/v1/courses/:id
 * Atualização parcial de um curso.
 */
router.patch(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  CourseController.patchCourse
);

/**
 * DELETE /api/v1/courses/:id
 * Remoção de um curso.
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['SUPER_ADMIN']),
  CourseController.deleteCourse
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
  CourseController.addCategory
);

/**
 * DELETE /api/v1/courses/:id/categories/:categoryId
 * Remover uma categoria/regra de um curso.
 */
router.delete(
  '/:id/categories/:categoryId',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  CourseController.removeCategory
);

module.exports = router;