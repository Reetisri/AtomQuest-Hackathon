const User = require('../models/User');
const Goal = require('../models/Goal');
const Achievement = require('../models/Achievement');
const SystemSetting = require('../models/SystemSetting');
const AuditLog = require('../models/AuditLog');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const employees = await User.find({ role: 'EMPLOYEE' });
    const stats = await Promise.all(employees.map(async (emp) => {
      const goals = await Goal.find({ employeeId: emp._id });
      const submitted = goals.length > 0 && goals.every(g => g.status !== 'DRAFT');
      const approved = goals.length > 0 && goals.every(g => g.status === 'LOCKED' || g.status === 'APPROVED');
      
      return {
        id: emp._id,
        name: emp.name,
        department: emp.department,
        goalsSubmitted: submitted,
        goalsApproved: approved,
        // Mocking check-ins for now
        q1Completed: false,
        q2Completed: false,
        q3Completed: false,
        q4Completed: false,
      };
    }));
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get system cycle
// @route   GET /api/admin/cycle
// @access  Private
const getCycle = async (req, res) => {
  try {
    let setting = await SystemSetting.findOne();
    if (!setting) {
      setting = await SystemSetting.create({ activePhase: 'GOAL_SETTING' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats,
  getCycle
};
