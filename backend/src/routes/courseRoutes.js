const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/CourseController');
const authorize = require('../middlewares/authRole');

/**
 * POST /api/v1/courses
 * Criação de curso.
 * Blindagem explícita: Apenas tokens com role 'SUPER_ADMIN' passam desta linha.
 */
router.post(
  '/', 
  authorize(['SUPER_ADMIN']), 
  CourseController.createCourse
);

/**
 * GET /api/v1/courses
 * Listagem de todos os cursos.
 * Decisão Técnica: Geralmente, a listagem é permitida para múltiplos perfis (ex: alunos e administradores).
 * Você deve ajustar a array de roles conforme a sua regra de negócio.
 */
router.get(
  '/',
  authorize(['SUPER_ADMIN', 'ADMIN', 'STUDENT']),
  CourseController.getAllCourses
);

/**
 * GET /api/v1/courses/:id
 * Busca de um curso específico pelo ID.
 * Decisão Técnica: O uso do parâmetro de rota ':id' é o padrão do Express para identificação de recursos específicos.
 */
router.get(
  '/:id',
  authorize(['SUPER_ADMIN', 'ADMIN', 'STUDENT']),
  CourseController.getCourseById
);

/**
 * PUT /api/v1/courses/:id
 * Atualização completa de um curso.
 * Decisão Técnica: PUT implica em substituir o recurso inteiro. Acesso restrito a administradores.
 */
router.put(
  '/:id',
  authorize(['SUPER_ADMIN', 'ADMIN']),
  CourseController.updateCourse
);

/**
 * PATCH /api/v1/courses/:id
 * Atualização parcial de um curso.
 * Decisão Técnica: PATCH é usado para modificar apenas alguns campos (ex: mudar o status do curso). 
 */
router.patch(
  '/:id',
  authorize(['SUPER_ADMIN', 'ADMIN']),
  CourseController.patchCourse
);

/**
 * DELETE /api/v1/courses/:id
 * Remoção de um curso.
 * Decisão Técnica: Operações destrutivas devem ter a blindagem máxima. Mantive apenas 'SUPER_ADMIN' 
 * como no método POST para garantir a segurança da exclusão.
 */
router.delete(
  '/:id',
  authorize(['SUPER_ADMIN']),
  CourseController.deleteCourse
);

module.exports = router;