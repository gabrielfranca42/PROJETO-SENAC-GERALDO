const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    enum: [
      'ACTIVITY_APPROVED', 
      'ACTIVITY_REJECTED', 
      'COURSE_CREATED', 
      'COURSE_UPDATED',
      'COURSE_DELETED',
      'USER_ROLE_UPDATED',
      'CATEGORY_ADDED',
      'CATEGORY_REMOVED'
    ]
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  targetResource: { 
    type: String, 
    required: true
  },
  resourceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true
  },
  details: { 
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  }
});

// Índices para performance
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ resourceId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);