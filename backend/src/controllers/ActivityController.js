const mongoose = require('mongoose');
const ActivityService = require('../services/activityService');
const EmailService = require('../services/EmailService');
const FileProcessingService = require('../services/FileProcessingService');
const User = require('../models/User');
const Activity = require('../models/Activity');
const AuditLog = require('../models/AuditLog');

class ActivityController {
  
  // ------------------------------------------------------------------------
  // SUBMISSÃO (POST /api/v1/activities)
  // ------------------------------------------------------------------------
  async submitActivity(req, res) {
    try {
      const { courseId, category, hoursClaimed, title, studentId: targetStudentId } = req.body;
      
      let studentId = req.user.id;

      // Se for coordenador submetendo para um aluno
      if (req.user.role === 'COORDINATOR' && targetStudentId) {
        // Validar se o coordenador tem acesso a este aluno/curso
        const userCourseIds = req.user.courses.map(id => String(id));
        if (!userCourseIds.includes(String(courseId))) {
          return res.status(403).json({ error: "FORBIDDEN: Você não gerencia este curso." });
        }
        studentId = targetStudentId;
      }
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
        fileData: req.file ? req.file.buffer : null,
        fileMimetype: req.file ? req.file.mimetype : null
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
  // LISTAR TODAS (GET /api/v1/activities)
  // Aceita query params: ?status=PENDING&courseId=xxx
  // ------------------------------------------------------------------------
  async getAllActivities(req, res) {
    try {
      const user = req.user;
      const query = {};

      // Filtro por status (ex: ?status=PENDING)
      if (req.query.status) {
        query.status = req.query.status.toUpperCase();
      }

      // Filtro por curso
      if (req.query.courseId) {
        query.course = req.query.courseId;
      }

      // NOVO: Filtro por Aluno (Histórico)
      if (req.query.studentId) {
        query.student = req.query.studentId;
      }

      // Estudante só vê suas próprias atividades
      if (user.role === 'STUDENT') {
        query.student = user.id;
      }

      // Coordenador vê atividades dos cursos que gerencia
      if (user.role === 'COORDINATOR' && user.courses) {
        // Se um curso específico foi pedido, verifica se o coord tem acesso a ele
        if (req.query.courseId) {
          const userCourseIds = user.courses.map(id => id.toString());
          if (userCourseIds.includes(req.query.courseId)) {
            query.course = new mongoose.Types.ObjectId(req.query.courseId);
          } else {
            // Se ele tentou acessar um curso que não é dele, forçamos um filtro vazio por segurança
            query.course = { $in: [] };
          }
        } else {
          // Se não pediu um curso específico, mostra todos os que ele gerencia
          query.course = { $in: user.courses };
        }
      }

      const activities = await Activity.find(query)
        .populate('student', 'name email matricula')
        .populate('course', 'name')
        .sort({ createdAt: -1 });

      // Gerar URL dinâmica para visualização dos certificados salvos no MongoDB
      const protocol = req.protocol;
      const host = req.get('host');
      const backendUrl = `${protocol}://${host}/api/v1/activities`;

      const formattedActivities = activities.map(act => {
        const obj = act.toObject();
        // Se tiver dados no banco, a URL aponta para a nossa rota de download
        if (act.fileData) {
          obj.certificateUrl = `${backendUrl}/${act._id}/certificate`;
        }
        // Remove os dados binários do JSON de listagem para não pesar a resposta
        delete obj.fileData;
        return obj;
      });

      return res.status(200).json(formattedActivities);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // BUSCAR POR ID (GET /api/v1/activities/:id)
  // ------------------------------------------------------------------------
  async getActivityById(req, res) {
    try {
      const activity = await Activity.findById(req.params.id)
        .populate('student', 'name email matricula')
        .populate('course', 'name');

      if (!activity) {
        return res.status(404).json({ error: "NOT_FOUND: Atividade não encontrada." });
      }

      const obj = activity.toObject();
      if (activity.fileData) {
        const protocol = req.protocol;
        const host = req.get('host');
        obj.certificateUrl = `${protocol}://${host}/api/v1/activities/${activity._id}/certificate`;
      }
      delete obj.fileData;

      return res.status(200).json(obj);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // ATUALIZAR (PUT /api/v1/activities/:id)
  // Aluno pode atualizar apenas se status for PENDING
  // ------------------------------------------------------------------------
  async updateActivity(req, res) {
    try {
      const activity = await Activity.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({ error: "NOT_FOUND: Atividade não encontrada." });
      }

      if (activity.status !== 'PENDING') {
        return res.status(400).json({ 
          error: "BAD_REQUEST: Apenas atividades pendentes podem ser editadas." 
        });
      }

      // Só o dono pode editar
      if (activity.student.toString() !== req.user.id) {
        return res.status(403).json({ error: "FORBIDDEN: Acesso negado." });
      }

      const { title, hoursClaimed, category } = req.body;
      if (title) activity.title = title;
      if (hoursClaimed) activity.hoursClaimed = Number(hoursClaimed);
      if (category) activity.category = category;

      if (req.file) {
        const extractedText = await FileProcessingService.extractText(
          req.file.buffer, req.file.mimetype
        );
        activity.ocrText = extractedText;
      }

      await activity.save();
      return res.status(200).json(activity);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // DELETAR (DELETE /api/v1/activities/:id)
  // Aluno pode deletar apenas se status for PENDING
  // ------------------------------------------------------------------------
  async deleteActivity(req, res) {
    try {
      const activity = await Activity.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({ error: "NOT_FOUND: Atividade não encontrada." });
      }

      if (activity.status !== 'PENDING') {
        return res.status(400).json({ 
          error: "BAD_REQUEST: Não é possível excluir atividades já avaliadas." 
        });
      }

      if (activity.student.toString() !== req.user.id) {
        return res.status(403).json({ error: "FORBIDDEN: Acesso negado." });
      }

      await Activity.findByIdAndDelete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // AVALIAR (PUT /api/v1/activities/:id/evaluate)
  // Coordenador aprova ou rejeita
  // ------------------------------------------------------------------------
  async evaluateActivity(req, res) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const coordinator = req.user;

      const activity = await Activity.findById(id).populate('student', 'name email');
      if (!activity) {
        return res.status(404).json({ error: "NOT_FOUND: Atividade não encontrada." });
      }

      if (!['APPROVED', 'REJECTED', 'NEEDS_REVISION'].includes(status)) {
         return res.status(400).json({ error: "BAD_REQUEST: Status inválido. Use APPROVED, REJECTED ou NEEDS_REVISION." });
      }

      // Validação de permissão do coordenador
      if (coordinator.role === 'COORDINATOR') {
        const userCourseIds = coordinator.courses.map(id => String(id));
        const activityCourseId = activity.course._id ? String(activity.course._id) : String(activity.course);
        if (!userCourseIds.includes(activityCourseId)) {
          return res.status(403).json({ error: "FORBIDDEN: Você não tem permissão para avaliar certificados deste curso." });
        }
      }
      
      activity.status = status;
      if (rejectionReason) {
        activity.feedback = rejectionReason;
      }
      await activity.save();

      let auditAction = 'ACTIVITY_REJECTED';
      if (status === 'APPROVED') auditAction = 'ACTIVITY_APPROVED';
      if (status === 'NEEDS_REVISION') auditAction = 'ACTIVITY_REVISION_REQUESTED';

      await AuditLog.create({
        action: auditAction,
        performedBy: coordinator.id,
        targetResource: 'Activity',
        resourceId: activity._id,
        details: { 
          studentId: activity.student._id,
          reason: rejectionReason || null 
        }
      });

      // Notificação por e-mail (assíncrona, sem bloquear resposta)
      EmailService.sendStatusUpdate(activity.student.email, activity.title, status).catch(console.error);

      return res.status(200).json({ 
        message: "Atividade avaliada com sucesso.", 
        activity 
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // AJUSTAR HORAS (PUT /api/v1/activities/:id/adjust-hours)
  // Coordenador altera carga horária com justificativa
  // ------------------------------------------------------------------------
  async adjustHours(req, res) {
    try {
      const { id } = req.params;
      const { newHours, reason } = req.body;
      const coordinator = req.user;

      if (!newHours || !reason) {
        return res.status(400).json({ error: "BAD_REQUEST: Nova carga horária e justificativa são obrigatórias." });
      }

      const activity = await Activity.findById(id);
      if (!activity) {
        return res.status(404).json({ error: "NOT_FOUND: Atividade não encontrada." });
      }

      // Validação de permissão do coordenador
      if (coordinator.role === 'COORDINATOR') {
        const userCourseIds = coordinator.courses.map(id => String(id));
        const activityCourseId = String(activity.course);
        if (!userCourseIds.includes(activityCourseId)) {
          return res.status(403).json({ error: "FORBIDDEN: Você não tem permissão para ajustar certificados deste curso." });
        }
      }

      const oldHours = activity.hoursClaimed;
      activity.hoursClaimed = Number(newHours);
      activity.feedback = `[Ajuste de Horas]: ${reason} (Anterior: ${oldHours}h)`;
      
      await activity.save();

      await AuditLog.create({
        action: 'ACTIVITY_HOURS_ADJUSTED',
        performedBy: coordinator.id,
        targetResource: 'Activity',
        resourceId: activity._id,
        details: { 
          oldHours,
          newHours,
          reason 
        }
      });

      return res.status(200).json({ 
        message: "Carga horária ajustada com sucesso.", 
        activity 
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ------------------------------------------------------------------------
  // VISUALIZAR ARQUIVO (GET /api/v1/activities/:id/certificate)
  // Serve o arquivo binário diretamente do MongoDB
  // ------------------------------------------------------------------------
  async viewCertificate(req, res) {
    try {
      const activity = await Activity.findById(req.params.id);

      if (!activity || !activity.fileData) {
        return res.status(404).json({ error: "NOT_FOUND: Arquivo não encontrado." });
      }

      // Define o tipo do arquivo (PDF, Image, etc) e envia o buffer
      res.set('Content-Type', activity.fileMimetype || 'application/pdf');
      // Opcional: Forçar download em vez de abrir no navegador
      // res.set('Content-Disposition', `inline; filename="certificado_${activity._id}"`);
      
      return res.send(activity.fileData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ActivityController();