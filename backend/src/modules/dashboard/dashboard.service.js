const dashboardRepository = require('./dashboard.repository');

class DashboardService {
  async getDashboardStats() {
    const totalAlunos = await dashboardRepository.countStudents();
    const totalAtividadesPendentes = await dashboardRepository.countPendingActivities();
    const totalAtividadesAprovadas = await dashboardRepository.countApprovedActivities();

    return {
      totalAlunos,
      totalAtividadesPendentes,
      totalAtividadesAprovadas
    };
  }
}

module.exports = new DashboardService();
