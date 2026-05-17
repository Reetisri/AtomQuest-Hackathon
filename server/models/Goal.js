const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  thrustArea:  { type: String, required: true },
  uomType:     { type: String, enum: ['NUMERIC_MIN', 'NUMERIC_MAX', 'TIMELINE', 'ZERO'], required: true },
  target:      { type: Number, required: true },
  weightage:   { type: Number, required: true },
  status:      { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'LOCKED'], default: 'DRAFT' },
  isShared:    { type: Boolean, default: false },
  sharedFromId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  employeeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
