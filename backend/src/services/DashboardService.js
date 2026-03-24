const Activity = require('../models/Activity');

class DashboardService {
  async getMetricsByCourse(courseId) {
    const pipeline = [
      { $match: { course: mongoose.Types.ObjectId(courseId) } }, // Filtra apenas o curso alvo
      {
        $group: {
          _id: { category: "$category", status: "$status" },
          totalActivities: { $sum: 1 },
          totalHours: { $sum: "$hoursClaimed" }
        }
      },
      {
        $group: {
          _id: "$_id.category",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$totalActivities",
              hours: "$totalHours"
            }
          }
        }
      }
    ];

    return await Activity.aggregate(pipeline);
  }
}

module.exports = new DashboardService();