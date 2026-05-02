const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Course = require('../models/Course');

class ActivityService {
  async validateAndSubmit(data) {
    // Nota: Adicionada a dependência da propriedade 'semester' no payload
    const { student, course: courseId, category, hoursClaimed, semester } = data;

    // 1. Busca as regras do curso (Domínio)
    const courseRules = await Course.findById(courseId);
    if (!courseRules) throw new Error("NOT_FOUND: Curso não localizado.");

    const categoryRule = courseRules.categories.find(c => c.name === category);
    if (!categoryRule) throw new Error("BAD_REQUEST: Categoria inválida para este curso.");

    // 2. Agregação de Dados via MongoDB Aggregation Pipeline
    // Justificativa: Delega a complexidade de tempo O(N) e espaço para o BD, reduzindo overhead de rede.
    const [stats] = await Activity.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(student),
          course: new mongoose.Types.ObjectId(courseId),
          status: { $in: ['APPROVED', 'PENDING'] } // * Ver nota técnica abaixo
        }
      },
      {
        $group: {
          _id: null,
          totalCourse: { $sum: "$hoursClaimed" },
          totalCourseSemester: {
            $sum: { $cond: [{ $eq: ["$semester", semester] }, "$hoursClaimed", 0] }
          },
          totalCategory: {
            $sum: { $cond: [{ $eq: ["$category", category] }, "$hoursClaimed", 0] }
          },
          totalCategorySemester: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$category", category] }, { $eq: ["$semester", semester] }] },
                "$hoursClaimed",
                0
              ]
            }
          }
        }
      }
    ]);

    // Trata o caso de ser a primeira atividade cadastrada (stats será undefined)
    const currentStats = stats || {
      totalCourse: 0,
      totalCourseSemester: 0,
      totalCategory: 0,
      totalCategorySemester: 0
    };

    // 3. Validações das Regras de Negócio (Requisitos do Sistema)

    // 3.1 - Limite Global da Categoria
    if (currentStats.totalCategory + hoursClaimed > categoryRule.maxHours) {
      throw new Error(`UNPROCESSABLE_ENTITY: O limite total de ${categoryRule.maxHours}h para a categoria '${category}' será excedido.`);
    }

    // 3.2 - Limite Semestral da Categoria (Ignora se for 0)
    if (categoryRule.semesterMaxHours > 0 && currentStats.totalCategorySemester + hoursClaimed > categoryRule.semesterMaxHours) {
      throw new Error(`UNPROCESSABLE_ENTITY: O limite semestral de ${categoryRule.semesterMaxHours}h para a categoria '${category}' será excedido no semestre ${semester}.`);
    }

    // 3.3 - Limite Global do Curso
    if (currentStats.totalCourse + hoursClaimed > courseRules.totalHoursRequired) {
      throw new Error(`UNPROCESSABLE_ENTITY: O envio excederá a carga horária total exigida pelo curso (${courseRules.totalHoursRequired}h).`);
    }

    // 3.4 - Limite Semestral do Curso (Ignora se for 0)
    if (courseRules.semesterMaxHours > 0 && currentStats.totalCourseSemester + hoursClaimed > courseRules.semesterMaxHours) {
      throw new Error(`UNPROCESSABLE_ENTITY: O envio excederá o limite máximo de ${courseRules.semesterMaxHours}h permitidas por semestre para este curso.`);
    }

    // 4. Persistência
    const activity = new Activity(data);
    return await activity.save();
  }
}

module.exports = new ActivityService();