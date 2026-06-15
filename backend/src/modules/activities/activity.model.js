const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true }, // Título da atividade/certificado
  hoursClaimed: { type: Number, required: true }, // Quantidade de horas solicitadas pelo aluno
  category: { type: String, required: true }, // Categoria da atividade (ex: 'Estágio Obrigatório')
  certificateUrl: { type: String }, // Agora opcional, pois o dado real está no fileData
  fileUrl: { type: String },       // Mantido por questões de retrocompatibilidade
  fileData: { type: String },      // BASE64 da imagem - armazenamento permanente direto no MongoDB
  fileMimeType: { type: String },  // Tipo MIME do arquivo (Ex: image/jpeg, application/pdf)
  fileName: { type: String },   // Armazena o nome original do arquivo anexado
  semester: { type: String },       // Semestre da atividade (ex: 2024.1)
  ocrText: { type: String }, // Armazena o texto extraído (via OCR) para auditoria e validação automática
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'], 
    default: 'PENDING' 
  },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);