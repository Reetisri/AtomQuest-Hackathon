const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  managerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quarter:    { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  comment:    { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
