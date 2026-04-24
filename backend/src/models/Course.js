const mongoose = require('mongoose');

const CategoryRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  maxHours: { type: Number, required: true }, // Limite total do curso para a categoria
  semesterMaxHours: { type: Number, required: true } // Limite semestral da categoria
});

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  totalHoursRequired: { type: Number, required: true },
  semesterMaxHours: { type: Number, required: true }, // Limite semestral global do curso
  categories: [CategoryRuleSchema],
  
  // =========================================================================
  // Ao exigir um 'ObjectId' referenciando o model 'User',
  // garantimos a regra "1 Curso tem 1 Coordenador". Para descobrir os "vários
  // cursos de um coordenador", basta fazer uma query: Course.find({ coordinator: id })
  // =========================================================================
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referência exata ao modelo de Usuários
    required: [true, 'Um curso deve obrigatoriamente ter um coordenador vinculado.']
  }
});

module.exports = mongoose.model('Course', CourseSchema);