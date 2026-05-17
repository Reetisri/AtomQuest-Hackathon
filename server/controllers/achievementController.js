const Achievement = require('../models/Achievement');
const Goal = require('../models/Goal');

const calculateScore = (uomType, target, actual) => {
  if (actual == null) return null;
  
  if (uomType === 'NUMERIC_MIN') {
    return (actual / target) * 100;
  } else if (uomType === 'NUMERIC_MAX') {
    return Math.min((target / actual) * 100, 100);
  } else if (uomType === 'ZERO') {
    return actual === 0 ? 100 : 0;
  } else if (uomType === 'TIMELINE') {
    // Simplified timeline calculation
    return actual === 100 ? 100 : 0; 
  }
  return 0;
};

// @desc    Update or create an achievement for a quarter
// @route   POST /api/achievements
// @access  Private (Employee)
const updateAchievement = async (req, res) => {
  try {
    const { goalId, quarter, actual, status } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal || goal.employeeId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    if (goal.status !== 'LOCKED') {
      return res.status(400).json({ message: 'Can only add achievements to locked goals' });
    }

    const progressScore = calculateScore(goal.uomType, goal.target, actual);

    let achievement = await Achievement.findOne({ goalId, quarter });

    if (achievement) {
      achievement.actual = actual;
      achievement.status = status;
      achievement.progressScore = progressScore;
      await achievement.save();
    } else {
      achievement = await Achievement.create({
        goalId,
        quarter,
        actual,
        status,
        progressScore
      });
    }

    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get achievements for a set of goals
// @route   GET /api/achievements/:goalId
// @access  Private
const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ goalId: req.params.goalId });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  updateAchievement,
  getAchievements
};
