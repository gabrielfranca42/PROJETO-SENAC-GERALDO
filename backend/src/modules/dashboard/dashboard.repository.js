const Activity = require('../../modules/activities/activity.model');
const User = require('../../modules/users/user.model');

class DashboardRepository {
  async countStudents() {
    return await User.countDocuments({ role: 'STUDENT' });
  }

  async countPendingActivities() {
    return await Activity.countDocuments({ status: 'PENDING' });
  }

  async countApprovedActivities() {
    return await Activity.countDocuments({ status: 'APPROVED' });
  }
}

module.exports = new DashboardRepository();
