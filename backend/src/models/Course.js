const mongoose = require('mongoose');

const CategoryRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  maxHours: { type: Number, required: true }, // Limite total do curso para a categoria
  semesterMaxHours: { type: Number, required: true } // [NOVO - Requisito UI] Limite semestral da categoria
});

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  totalHoursRequired: { type: Number, required: true },
  semesterMaxHours: { type: Number, required: true }, // [NOVO - Requisito UI] Limite semestral global do curso
  categories: [CategoryRuleSchema]
});

module.exports = mongoose.model('Course', CourseSchema);