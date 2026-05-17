import React, { useState, useEffect } from 'react';
import api from '../api';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

const ManagerCheckins = () => {
  const [teamGoals, setTeamGoals] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [quarter, setQuarter] = useState('Q1');
  const [achievements, setAchievements] = useState({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamGoals();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchAchievementsForEmployee();
    }
  }, [selectedEmployeeId, quarter]);

  const fetchTeamGoals = async () => {
    try {
      const response = await api.get('/goals');
      const lockedGoals = response.data.filter(g => g.status === 'LOCKED');
      
      const grouped = lockedGoals.reduce((acc, goal) => {
        if (!acc[goal.employeeId._id]) {
          acc[goal.employeeId._id] = {
            employee: goal.employeeId,
            goals: []
          };
        }
        acc[goal.employeeId._id].goals.push(goal);
        return acc;
      }, {});
      
      const employeesList = Object.values(grouped);
      setTeamGoals(employeesList);
      if (employeesList.length > 0) {
        setSelectedEmployeeId(employeesList[0].employee._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievementsForEmployee = async () => {
    const employeeData = teamGoals.find(t => t.employee._id === selectedEmployeeId);
    if (!employeeData) return;

    try {
      const achvs = {};
      for (const goal of employeeData.goals) {
        const achvRes = await api.get(`/achievements/${goal._id}`);
        const currentQuarterAchv = achvRes.data.find(a => a.quarter === quarter);
        achvs[goal._id] = currentQuarterAchv || null;
      }
      setAchievements(achvs);
      // Ideally fetch existing check-in comment here
      setComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCheckIn = () => {
    // In a full implementation, this would save the CheckIn model to the DB.
    alert('Check-in comment saved! (Mock Implementation)');
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const employeeData = teamGoals.find(t => t.employee._id === selectedEmployeeId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-heading font-bold text-foreground">Quarterly Check-ins</h1>
      
      <div className="flex gap-4 p-4 bg-card border border-border rounded-lg shadow-sm">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Select Team Member</label>
          <select 
            value={selectedEmployeeId} 
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md bg-background"
          >
            {teamGoals.length === 0 && <option value="">No members with locked goals</option>}
            {teamGoals.map(t => (
              <option key={t.employee._id} value={t.employee._id}>{t.employee.name}</option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium mb-1">Select Quarter</label>
          <select 
            value={quarter} 
            onChange={(e) => setQuarter(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md bg-background"
          >
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
      </div>

      {employeeData && (
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold">Goal Title</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Actual ({quarter})</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employeeData.goals.map((goal) => {
                  const achv = achievements[goal._id];
                  return (
                    <tr key={goal._id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{goal.title}</td>
                      <td className="px-4 py-3">{goal.target}</td>
                      <td className="px-4 py-3 font-semibold">
                        {achv ? achv.actual : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        {achv && achv.progressScore !== null ? `${Math.round(achv.progressScore)}%` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-secondary rounded-full text-xs font-semibold">
                          {achv ? achv.status.replace('_', ' ') : 'NO DATA'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-border bg-muted/20">
            <label className="block text-sm font-medium mb-2">Manager's Check-in Comment</label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[100px] focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder={`Enter your feedback for ${employeeData.employee.name} for ${quarter}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleSaveCheckIn}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90"
              >
                Save Check-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCheckins;
