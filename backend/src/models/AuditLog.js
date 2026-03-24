const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    enum: ['ACTIVITY_APPROVED', 'ACTIVITY_REJECTED', 'COURSE_CREATED', 'USER_ROLE_UPDATED']
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true // ID do Coordenador ou Super Admin que fez a ação
  },
  targetResource: { 
    type: String, 
    required: true // Coleção afetada (Ex: 'Activity', 'Course')
  },
  resourceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true // ID do documento alterado
  },
  details: { 
    type: mongoose.Schema.Types.Mixed // Campo flexível para guardar o motivo de reprovação ou payload antigo
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true // Logs não podem ser editados após a criação
  }
});

// Criação de índices para garantir performance em consultas do dashboard do Super Admin
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ resourceId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);