const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  action:   { type: String, required: true },
  oldValue: { type: String, default: null },
  newValue: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
