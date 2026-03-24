const ActivityService = require('../services/ActivityService');
const EmailService = require('../services/EmailService');
const FileProcessingService = require('../services/FileProcessingService'); // Novo Service Injetado
const User = require('../models/User');

class ActivityController {
  async submitActivity(req, res) {
    try {
      const { courseId, category, hoursClaimed, title } = req.body;
      const studentId = req.user.id; // Proveniente do JWT middleware injetado no authorize

      let extractedText = null;

      // Se houver arquivo (PDF ou Imagem), delega a extração para o Service unificado
      if (req.file) {
        extractedText = await FileProcessingService.extractText(
          req.file.buffer, 
          req.file.mimetype
        );
      }

      // Delegação para o service de domínio validando as regras e limites de negócio
      const activity = await ActivityService.validateAndSubmit({
        studentId,
        courseId,
        category,
        hoursClaimed: Number(hoursClaimed),
        title,
        ocrText: extractedText, // Agora contém o texto do PDF ou do OCR da Imagem
        fileUrl: req.file ? 'url_do_storage_aqui' : null // Omissão de integração S3/GCP por simplicidade
      });

      // Lógica de Notificação Assíncrona via Email (Event-Driven)
      const coordinators = await User.find({ role: 'COORDINATOR', courses: courseId });
      coordinators.forEach(coord => {
        EmailService.sendActivitySubmitted(coord.email, req.user.name, courseId).catch(console.error);
      });

      return res.status(201).json(activity);
    } catch (error) {
      // Retorna erros de negócio (ex: Limite Excedido) ou erros de mídia (ex: Formato não suportado)
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ActivityController();

module.exports = new ActivityController();