const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  hours: { type: Number, required: true },
  category: { type: String, required: true }, // Ex: Extensão, Pesquisa, Ensino
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  certificateUrl: { type: String }, // URL para o Storage (Supabase/S3)
  feedback: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);