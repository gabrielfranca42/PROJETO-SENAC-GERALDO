const ActivityService = require('../services/activityService');
const EmailService = require('../services/EmailService');
const FileProcessingService = require('../services/FileProcessingService');
const User = require('../models/User');
const Activity = require('../models/Activity'); // Necessário para a busca na avaliação
const AuditLog = require('../models/AuditLog'); // O model que criamos para rastreabilidade

class ActivityController {
  
  // ------------------------------------------------------------------------
  // FLUXO DO ALUNO: Submissão de Atividades
  // ------------------------------------------------------------------------
  async submitActivity(req, res) {
    try {
      const { courseId, category, hoursClaimed, title } = req.body;
      const studentId = req.user.id; 

      let extractedText = null;

      if (req.file) {
        extractedText = await FileProcessingService.extractText(
          req.file.buffer, 
          req.file.mimetype
        );
      }

      const activity = await ActivityService.validateAndSubmit({
        studentId,
        courseId,
        category,
        hoursClaimed: Number(hoursClaimed),
        title,
        ocrText: extractedText,
        fileUrl: req.file ? 'url_do_storage_aqui' : null 
      });

      const coordinators = await User.find({ role: 'COORDINATOR', courses: courseId });
      coordinators.forEach(coord => {
        EmailService.sendActivitySubmitted(coord.email, req.user.name, courseId).catch(console.error);
      });

      return res.status(201).json(activity);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // FLUXO DO COORDENADOR: Avaliação e Auditoria
  // ------------------------------------------------------------------------
  async evaluateActivity(req, res) {
    try {
      const { id } = req.params; // ID da atividade sendo avaliada
      const { status, rejectionReason } = req.body; // 'APPROVED' ou 'REJECTED'
      const coordinator = req.user;

      // 1. Busca da Atividade com os dados do aluno populados para envio de e-mail
      const activity = await Activity.findById(id).populate('student', 'name email');
      if (!activity) {
        return res.status(404).json({ error: "NOT_FOUND: Atividade não encontrada." });
      }

      // 2. Validação de Multitenancy (Segurança Requisitada no PDF)
      // O SUPER_ADMIN tem bypass, mas o COORDINATOR precisa ser validado se pertence ao curso
      if (coordinator.role !== 'SUPER_ADMIN' && !coordinator.courses.includes(activity.course.toString())) {
        return res.status(403).json({ 
          error: "FORBIDDEN: Você não gerencia o curso atrelado a esta atividade." 
        });
      }

      // 3. Atualização do Status
      if (!['APPROVED', 'REJECTED'].includes(status)) {
         return res.status(400).json({ error: "BAD_REQUEST: Status inválido." });
      }
      
      activity.status = status;
      await activity.save();

      // 4. Registro no Log de Auditoria (Rastreabilidade Exigida)
      await AuditLog.create({
        action: status === 'APPROVED' ? 'ACTIVITY_APPROVED' : 'ACTIVITY_REJECTED',
        performedBy: coordinator.id,
        targetResource: 'Activity',
        resourceId: activity._id,
        details: { 
          studentId: activity.student._id,
          reason: rejectionReason || null 
        }
      });

      // 5. Notificação Assíncrona ao Aluno via EmailService
      EmailService.sendStatusUpdate(activity.student.email, activity.title, status).catch(console.error);

      return res.status(200).json({ 
        message: "Atividade avaliada com sucesso.", 
        activity 
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ActivityController(); // Corrigido para uma única exportação