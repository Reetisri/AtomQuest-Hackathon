const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  goalId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  quarter:       { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  actual:        { type: Number, required: true },
  status:        { type: String, enum: ['NOT_STARTED', 'ON_TRACK', 'COMPLETED'], default: 'NOT_STARTED' },
  progressScore: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
