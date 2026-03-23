const Activity = require('../models/Activity');
const Course = require('../models/Course');

class ActivityService {
  async validateAndSubmit(data) {
    const { studentId, courseId, category, hoursClaimed } = data;

    // 1. Busca as regras do curso
    const course = await Course.findById(courseId);
    const categoryRule = course.categories.find(c => c.name === category);

    if (!categoryRule) throw new Error("CATEGORIA_INVALIDA");

    // 2. Soma horas já aprovadas nesta categoria
    const approvedActivities = await Activity.find({
      student: studentId,
      course: courseId,
      category: category,
      status: 'APPROVED'
    });

    const currentHours = approvedActivities.reduce((sum, act) => sum + act.hoursClaimed, 0);

    // 3. Validação de Limite (Requisito PDF Pág 2)
    if (currentHours + hoursClaimed > categoryRule.maxHours) {
      throw new Error(`LIMITE_EXCEDIDO: Máximo de ${categoryRule.maxHours}h para esta categoria.`);
    }

    // 4. Persistência
    const activity = new Activity(data);
    return await activity.save();
  }
}

module.exports = new ActivityService();