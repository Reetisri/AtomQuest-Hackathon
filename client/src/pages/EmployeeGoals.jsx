import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, Send } from 'lucide-react';
import { cn } from '../utils/cn';

const THRUST_AREAS = ['Strategy', 'Operations', 'Finance', 'People', 'Customer', 'Innovation'];
const UOM_TYPES = [
  { value: 'NUMERIC_MIN', label: 'Numeric (Higher is better)' },
  { value: 'NUMERIC_MAX', label: 'Numeric (Lower is better)' },
  { value: 'TIMELINE', label: 'Timeline (Date-based)' },
  { value: 'ZERO', label: 'Zero (Zero is success)' }
];

const EmployeeGoals = () => {
  const [goals, setGoals] = useState([]);
  const [submittedGoals, setSubmittedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setSubmittedGoals(response.data);
      if (response.data.length === 0) {
        // Add one empty goal row if no submitted goals exist
        setGoals([getEmptyGoal()]);
      }
    } catch (err) {
      setError('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const getEmptyGoal = () => ({
    title: '',
    description: '',
    thrustArea: 'Strategy',
    uomType: 'NUMERIC_MIN',
    target: '',
    weightage: 10,
    tempId: Date.now() + Math.random() // for React keys
  });

  const handleAddRow = () => {
    if (goals.length >= 8) {
      setError('Maximum 8 goals allowed');
      return;
    }
    setGoals([...goals, getEmptyGoal()]);
  };

  const handleRemoveRow = (tempId) => {
    setGoals(goals.filter(g => g.tempId !== tempId));
    setError('');
  };

  const handleGoalChange = (tempId, field, value) => {
    setGoals(goals.map(g => {
      if (g.tempId === tempId) {
        return { ...g, [field]: value };
      }
      return g;
    }));
  };

  const totalWeightage = goals.reduce((acc, g) => acc + Number(g.weightage || 0), 0);

  const handleSubmit = async () => {
    setError('');
    if (totalWeightage !== 100) {
      setError(`Total weightage must be exactly 100%. Current: ${totalWeightage}%`);
      return;
    }

    try {
      // Remove tempId before sending to backend
      const payload = goals.map(({ tempId, ...rest }) => rest);
      await api.post('/goals', { goals: payload });
      await fetchGoals();
      setGoals([]); // clear form
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit goals');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const isLocked = submittedGoals.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Goal Sheet</h1>
          <p className="text-muted-foreground mt-1">Define your objectives for the current cycle.</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Submitted Goals Table */}
      {isLocked && (
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
            <h2 className="font-semibold text-lg">Submitted Goals</h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
              Status: {submittedGoals[0]?.status}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title & Desc</th>
                  <th className="px-4 py-3 font-semibold">Thrust Area</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold text-right">Weightage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submittedGoals.map((goal) => (
                  <tr key={goal._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{goal.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">{goal.description}</div>
                    </td>
                    <td className="px-4 py-3">{goal.thrustArea}</td>
                    <td className="px-4 py-3">
                      {goal.target} <span className="text-xs text-muted-foreground">({goal.uomType.split('_')[1] || goal.uomType})</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{goal.weightage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Goals Form */}
      {!isLocked && (
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <div key={goal.tempId} className="bg-card border border-border rounded-lg shadow-sm p-5 relative group">
              <button 
                onClick={() => handleRemoveRow(goal.tempId)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-12">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Goal Details</h3>
                  </div>
                </div>
                
                <div className="md:col-span-8">
                  <label className="block text-xs font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={goal.title}
                    onChange={(e) => handleGoalChange(goal.tempId, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Enter goal title..."
                  />
                </div>
                
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium mb-1">Thrust Area</label>
                  <select
                    value={goal.thrustArea}
                    onChange={(e) => handleGoalChange(goal.tempId, 'thrustArea', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    {THRUST_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>
                
                <div className="md:col-span-12">
                  <label className="block text-xs font-medium mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={goal.description}
                    onChange={(e) => handleGoalChange(goal.tempId, 'description', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Briefly describe how you will achieve this..."
                  />
                </div>

                <div className="md:col-span-5">
                  <label className="block text-xs font-medium mb-1">Unit of Measurement (UoM)</label>
                  <select
                    value={goal.uomType}
                    onChange={(e) => handleGoalChange(goal.tempId, 'uomType', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    {UOM_TYPES.map(uom => <option key={uom.value} value={uom.value}>{uom.label}</option>)}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium mb-1">Target</label>
                  <input
                    type="number"
                    value={goal.target}
                    onChange={(e) => handleGoalChange(goal.tempId, 'target', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="e.g. 100"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    value={goal.weightage}
                    min="10"
                    max="90"
                    onChange={(e) => handleGoalChange(goal.tempId, 'weightage', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between mt-6 bg-card border border-border p-4 rounded-lg shadow-sm">
            <button
              onClick={handleAddRow}
              disabled={goals.length >= 8}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Add Another Goal
            </button>
            
            <div className="flex items-center gap-4">
              <div className={cn(
                "text-sm font-bold",
                totalWeightage === 100 ? "text-green-600" : "text-destructive"
              )}>
                Total Weightage: {totalWeightage}% / 100%
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={totalWeightage !== 100 || goals.length === 0}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} /> Submit Goals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeGoals;
