const express = require('express');
const router = express.Router();
const multer = require('multer');
const ActivityController = require('../controllers/ActivityController');
const authorize = require('../middlewares/authorize');

const upload = multer({ storage: multer.memoryStorage() });

// POST: Aluno submete atividade. Exige token de STUDENT e form-data (file).
router.post(
  '/',
  authorize(['STUDENT']),
  upload.single('certificate'),
  ActivityController.submitActivity
);

// PUT: Coordenador avalia uma atividade.
router.put(
  '/:id/evaluate',
  authorize(['COORDINATOR']), // Lembrando que nosso authorize já dá bypass para SUPER_ADMIN
  ActivityController.evaluateActivity
);

module.exports = router;