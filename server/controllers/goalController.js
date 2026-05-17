const Goal = require('../models/Goal');
const User = require('../models/User');
const { sendGoalSubmissionEmail, sendApprovalEmail, sendReworkEmail } = require('../services/emailService');

// @desc    Get goals (Employee gets own, Manager gets team)
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    if (req.user.role === 'EMPLOYEE') {
      const goals = await Goal.find({ employeeId: req.user.id }).populate('sharedFromId');
      return res.json(goals);
    } else if (req.user.role === 'MANAGER') {
      // Get all employees managed by this manager
      const team = await User.find({ managerId: req.user.id });
      const teamIds = team.map(emp => emp._id);
      const goals = await Goal.find({ employeeId: { $in: teamIds } }).populate('employeeId', 'name email');
      return res.json(goals);
    } else if (req.user.role === 'ADMIN') {
      const goals = await Goal.find().populate('employeeId', 'name email department');
      return res.json(goals);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create/Submit new goals
// @route   POST /api/goals
// @access  Private (Employee)
const createGoals = async (req, res) => {
  try {
    const { goals } = req.body; // Array of goals
    
    if (!Array.isArray(goals) || goals.length === 0) {
      return res.status(400).json({ message: 'No goals provided' });
    }

    if (goals.length > 8) {
      return res.status(400).json({ message: 'Maximum 8 goals allowed' });
    }

    const totalWeightage = goals.reduce((acc, curr) => acc + Number(curr.weightage), 0);
    if (totalWeightage !== 100) {
      return res.status(400).json({ message: 'Total weightage must be exactly 100%' });
    }

    // Add employeeId and set status to SUBMITTED
    const goalsToInsert = goals.map(goal => {
      if (goal.weightage < 10) {
        throw new Error('Minimum weightage per goal is 10%');
      }
      return {
        ...goal,
        employeeId: req.user.id,
        status: 'SUBMITTED'
      };
    });

    const createdGoals = await Goal.insertMany(goalsToInsert);

    // Send Email to Manager
    if (req.user.managerId) {
      const manager = await User.findById(req.user.managerId);
      if (manager) {
        await sendGoalSubmissionEmail(manager.email, req.user.name);
      }
    }
    res.status(201).json(createdGoals);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating goals' });
  }
};

// @desc    Approve/Reject goals
// @route   PUT /api/goals/:id/status
// @access  Private (Manager)
const updateGoalStatus = async (req, res) => {
  try {
    const { status } = req.body; // APPROVED or REJECTED
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Verify manager
    const employee = await User.findById(goal.employeeId);
    if (employee.managerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to approve this goal' });
    }

    goal.status = status;
    if (status === 'APPROVED') {
       goal.status = 'LOCKED'; // Locking it as per requirement
    }

    await goal.save();

    // Notify employee based on status
    if (status === 'APPROVED') {
      await sendApprovalEmail(employee.email);
    } else if (status === 'REJECTED') {
      await sendReworkEmail(employee.email);
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getGoals,
  createGoals,
  updateGoalStatus
};
