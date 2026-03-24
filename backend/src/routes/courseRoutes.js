const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/CourseController');
const authorize = require('../middlewares/authRole');

// POST /api/v1/courses
// Blindagem explícita: Apenas tokens com role 'SUPER_ADMIN' passam desta linha
router.post(
  '/', 
  authorize(['SUPER_ADMIN']), 
  CourseController.createCourse
);

module.exports = router;