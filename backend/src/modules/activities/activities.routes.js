const express = require('express');
const router = express.Router();
const multer = require('multer');
const activityController = require('./activities.controller');

// IMPORTAÇÕES DE MIDDLEWARES
// Decisão Técnica: Adicionado 'authenticate' para garantir a extração do req.user antes do 'authorize'
const authenticate = require('../../middlewares/auth'); 
const authorize = require('../../middlewares/authRole');

const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

/**
 * POST /api/v1/activities
 * Aluno submete atividade. Exige token de STUDENT e form-data (file).
 * Mantido conforme seu código, com a adição do authenticate.
 */
router.post(
  '/',
  authenticate,
  authorize(['STUDENT', 'COORDINATOR']),
  upload.single('certificate'),
  activityController.submitActivity
);

/**
 * POST /api/v1/activities/extract-ocr
 * Extrai dados (carga horária e assunto) de um certificado.
 * Exige apenas autenticação (qualquer role) para evitar uso anônimo.
 */
router.post(
  '/extract-ocr',
  authenticate,
  upload.single('certificate'),
  activityController.extractOcrData
);

/**
 * GET /api/v1/activities
 * Listagem de atividades.
 * Tanto estudantes quanto coordenadores precisam listar atividades. 
 * O Controller deverá usar o req.user.role para filtrar (Estudante vê as dele, Coordenador vê as do curso).
 */
router.get(
  '/',
  authenticate,
  authorize(['STUDENT', 'COORDINATOR']),
  activityController.getAllActivities
);

/**
 * GET /api/v1/activities/:id
 * Busca os detalhes de uma atividade específica (incluindo o texto do OCR).
 * Aberto para estudantes e coordenadores revisarem os dados da submissão.
 */
router.get(
  '/:id',
  authenticate,
  authorize(['STUDENT', 'COORDINATOR']),
  activityController.getActivityById
);

/**
 * PUT /api/v1/activities/:id
 * Atualização de uma atividade pelo aluno (ex: corrigir horas digitadas errado).
 * Permite o upload de um novo certificado via multer. Deve ser restrito 
 * no Controller para só permitir edição se o status for 'PENDING'.
 */
router.put(
  '/:id',
  authenticate,
  authorize(['STUDENT']),
  upload.single('certificate'),
  activityController.updateActivity
);

/**
 * PUT /api/v1/activities/:id/evaluate
 * Coordenador avalia uma atividade (Aprova ou Rejeita).
 * Mantido conforme seu código, com a adição do authenticate.
 */
router.put(
  '/:id/evaluate',
  authenticate,
  authorize(['COORDINATOR']),
  activityController.evaluateActivity
);

/**
 * DELETE /api/v1/activities/:id
 * Exclusão de uma submissão.
 * O aluno tem o direito de excluir uma submissão enviada por engano. 
 * O Controller deve bloquear a exclusão se o status já for APPROVED ou REJECTED.
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['STUDENT']),
  activityController.deleteActivity
);

/**
 * PUT /api/v1/activities/:id/adjust-hours
 * Coordenador ajusta carga horária de uma atividade.
 */
router.put(
  '/:id/adjust-hours',
  authenticate,
  authorize(['COORDINATOR']),
  activityController.adjustHours
);

module.exports = router;