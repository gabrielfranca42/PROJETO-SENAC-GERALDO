const mongoose = require('mongoose');

const CategoryRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  maxHours: { type: Number, required: true },
  semesterMaxHours: { type: Number, default: 0 }
});

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  totalHoursRequired: { type: Number, required: true },
  semesterMaxHours: { type: Number, default: 0 },
  categories: [CategoryRuleSchema],
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema);