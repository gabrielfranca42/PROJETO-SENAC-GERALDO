const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  hoursClaimed: { type: Number, required: true },
  category: { type: String, required: true },
  certificateUrl: { type: String, required: true },
  ocrText: { type: String }, // Armazena o texto extraído para auditoria
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'], 
    default: 'PENDING' 
  },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);