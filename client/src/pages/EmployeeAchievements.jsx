import React, { useState, useEffect } from 'react';
import api from '../api';
import { Save } from 'lucide-react';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

const EmployeeAchievements = () => {
  const [goals, setGoals] = useState([]);
  const [quarter, setQuarter] = useState('Q1');
  const [achievements, setAchievements] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchGoalsAndAchievements();
  }, [quarter]);

  const fetchGoalsAndAchievements = async () => {
    setLoading(true);
    try {
      // Fetch goals
      const goalsRes = await api.get('/goals');
      // Only keep LOCKED goals for achievements
      const lockedGoals = goalsRes.data.filter(g => g.status === 'LOCKED');
      setGoals(lockedGoals);

      // Fetch achievements for these goals for the selected quarter
      // We will fetch achievements for each goal
      const achvs = {};
      for (const goal of lockedGoals) {
        const achvRes = await api.get(`/achievements/${goal._id}`);
        const currentQuarterAchv = achvRes.data.find(a => a.quarter === quarter);
        if (currentQuarterAchv) {
          achvs[goal._id] = {
            actual: currentQuarterAchv.actual,
            status: currentQuarterAchv.status,
            progressScore: currentQuarterAchv.progressScore
          };
        } else {
          achvs[goal._id] = { actual: '', status: 'NOT_STARTED', progressScore: null };
        }
      }
      setAchievements(achvs);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementChange = (goalId, field, value) => {
    setAchievements(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }));
  };

  const handleSave = async (goalId) => {
    setError('');
    setSuccess('');
    try {
      const data = achievements[goalId];
      if (data.actual === '') {
        setError('Please enter an actual achievement value.');
        return;
      }
      
      await api.post('/achievements', {
        goalId,
        quarter,
        actual: Number(data.actual),
        status: data.status
      });
      setSuccess('Progress saved successfully!');
      // Refetch to get updated score
      fetchGoalsAndAchievements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save progress');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Quarterly Achievements</h1>
          <p className="text-muted-foreground mt-1">Update your progress for each locked goal.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-right">Select Quarter</label>
          <select 
            value={quarter} 
            onChange={(e) => setQuarter(e.target.value)}
            className="px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="bg-card border border-border p-8 rounded-lg text-center text-muted-foreground">
          You don't have any locked goals yet. Your goals must be approved by your manager first.
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => (
            <div key={goal._id} className="bg-card border border-border rounded-lg shadow-sm p-5">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <div><span className="font-medium text-foreground">Target:</span> {goal.target} {goal.uomType.split('_')[1] || goal.uomType}</div>
                    <div><span className="font-medium text-foreground">Weightage:</span> {goal.weightage}%</div>
                  </div>
                  
                  {achievements[goal._id]?.progressScore !== null && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">Progress Score</span>
                        <span>{Math.round(achievements[goal._id].progressScore)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${achievements[goal._id].progressScore >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(achievements[goal._id].progressScore || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-96 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                  <div>
                    <label className="block text-xs font-medium mb-1">Actual Achievement</label>
                    <input
                      type="number"
                      value={achievements[goal._id]?.actual}
                      onChange={(e) => handleAchievementChange(goal._id, 'actual', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                      placeholder="Enter current actual..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1">Status</label>
                      <select
                        value={achievements[goal._id]?.status}
                        onChange={(e) => handleAchievementChange(goal._id, 'status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="ON_TRACK">On Track</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleSave(goal._id)}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
                      >
                        <Save size={16} /> Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeAchievements;
