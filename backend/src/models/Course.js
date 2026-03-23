const mongoose = require('mongoose');

const CategoryRuleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ex: Extensão, Pesquisa
  maxHours: { type: Number, required: true } // Limite definido pela coordenação
});

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  totalHoursRequired: { type: Number, required: true },
  categories: [CategoryRuleSchema]
});

module.exports = mongoose.model('Course', CourseSchema);