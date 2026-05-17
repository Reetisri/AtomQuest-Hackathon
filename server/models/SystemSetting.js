const mongoose = require('mongoose');

// We will only ever have one document in this collection
const systemSettingSchema = new mongoose.Schema({
  activePhase: { 
    type: String, 
    enum: ['GOAL_SETTING', 'Q1_CHECKIN', 'Q2_CHECKIN', 'Q3_CHECKIN', 'Q4_CHECKIN', 'CLOSED'], 
    default: 'GOAL_SETTING' 
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
