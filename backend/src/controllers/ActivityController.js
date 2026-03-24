const ActivityService = require('../services/ActivityService');
const EmailService = require('../services/EmailService');
const User = require('../models/User');
const Tesseract = require('tesseract.js');

class ActivityController {
  async submitActivity(req, res) {
    try {
      const { courseId, category, hoursClaimed, title } = req.body;
      const studentId = req.user.id; // Proveniente do JWT middleware

      let ocrExtractedText = null;

      // Se houver upload de arquivo e for imagem, processa via OCR opcional
      if (req.file && req.file.mimetype.startsWith('image/')) {
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'por');
        ocrExtractedText = text;
      }

      // Delegação para o service existente validando os limites
      const activity = await ActivityService.validateAndSubmit({
        studentId,
        courseId,
        category,
        hoursClaimed: Number(hoursClaimed),
        title,
        ocrText: ocrExtractedText,
        fileUrl: req.file ? 'url_do_storage_aqui' : null // Omissão de integração S3/GCP por simplicidade
      });

      // Lógica de Notificação Assíncrona
      const coordinators = await User.find({ role: 'COORDINATOR', courses: courseId });
      coordinators.forEach(coord => {
        EmailService.sendActivitySubmitted(coord.email, req.user.name, courseId).catch(console.error);
      });

      return res.status(201).json(activity);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ActivityController();