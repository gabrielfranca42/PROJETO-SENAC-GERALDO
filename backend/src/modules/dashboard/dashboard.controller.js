const dashboardService = require('./dashboard.service');

class DashboardController {
  async getStats(req, res) {
    try {
      const stats = await dashboardService.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DashboardController();
