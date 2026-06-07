const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middlewares/auth');
const authorize = require('../../middlewares/authRole');

router.get('/stats', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']), dashboardController.getStats.bind(dashboardController));

module.exports = router;
