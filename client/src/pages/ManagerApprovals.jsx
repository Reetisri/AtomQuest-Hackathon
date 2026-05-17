import React, { useState, useEffect } from 'react';
import api from '../api';
import { CheckCircle, XCircle } from 'lucide-react';

const ManagerApprovals = () => {
  const [teamGoals, setTeamGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamGoals();
  }, []);

  const fetchTeamGoals = async () => {
    try {
      const response = await api.get('/goals');
      // Group goals by employee
      const grouped = response.data.reduce((acc, goal) => {
        if (!acc[goal.employeeId._id]) {
          acc[goal.employeeId._id] = {
            employee: goal.employeeId,
            goals: []
          };
        }
        acc[goal.employeeId._id].goals.push(goal);
        return acc;
      }, {});
      setTeamGoals(Object.values(grouped));
    } catch (err) {
      setError('Failed to fetch team goals');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (goalId, status) => {
    try {
      await api.put(`/goals/${goalId}/status`, { status });
      await fetchTeamGoals();
    } catch (err) {
      setError('Failed to update goal status');
    }
  };

  const handleApproveAll = async (employeeGoals) => {
     try {
       // Ideally this would be a single API call, but doing sequentially for simplicity here
       for (const goal of employeeGoals) {
         if (goal.status === 'SUBMITTED') {
           await api.put(`/goals/${goal._id}/status`, { status: 'APPROVED' });
         }
       }
       await fetchTeamGoals();
     } catch (err) {
       setError('Failed to approve all goals');
     }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Pending Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve goal sheets submitted by your team.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {teamGoals.length === 0 ? (
        <div className="bg-card border border-border p-8 rounded-lg text-center text-muted-foreground">
          No goals submitted by your team yet.
        </div>
      ) : (
        <div className="space-y-8">
          {teamGoals.map(({ employee, goals }) => {
            const hasPending = goals.some(g => g.status === 'SUBMITTED');
            
            if (!hasPending && goals.length === 0) return null;

            return (
              <div key={employee._id} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">{employee.name}</h2>
                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                  </div>
                  {hasPending && (
                    <button
                      onClick={() => handleApproveAll(goals)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle size={16} /> Approve All
                    </button>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Title</th>
                        <th className="px-4 py-3 font-semibold">Thrust Area</th>
                        <th className="px-4 py-3 font-semibold">Target</th>
                        <th className="px-4 py-3 font-semibold">Weightage</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {goals.map((goal) => (
                        <tr key={goal._id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{goal.title}</td>
                          <td className="px-4 py-3">{goal.thrustArea}</td>
                          <td className="px-4 py-3">{goal.target}</td>
                          <td className="px-4 py-3">{goal.weightage}%</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              goal.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800' :
                              goal.status === 'LOCKED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {goal.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {goal.status === 'SUBMITTED' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(goal._id, 'APPROVED')}
                                  className="text-green-600 hover:text-green-800 p-1"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(goal._id, 'REJECTED')}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Return for Rework"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManagerApprovals;
