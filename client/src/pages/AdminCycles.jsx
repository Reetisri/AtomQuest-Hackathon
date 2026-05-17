import React, { useState, useEffect } from 'react';
import api from '../api';
import { Settings, RefreshCw } from 'lucide-react';

const PHASES = [
  { value: 'GOAL_SETTING', label: 'Goal Setting & Submission', window: 'May' },
  { value: 'Q1_CHECKIN', label: 'Q1 Progress Update', window: 'July' },
  { value: 'Q2_CHECKIN', label: 'Q2 Progress Update', window: 'October' },
  { value: 'Q3_CHECKIN', label: 'Q3 Progress Update', window: 'January' },
  { value: 'Q4_CHECKIN', label: 'Q4 Final Achievement Capture', window: 'March/April' },
  { value: 'CLOSED', label: 'System Closed', window: 'Off-season' },
];

const AdminCycles = () => {
  const [activePhase, setActivePhase] = useState('GOAL_SETTING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCycle();
  }, []);

  const fetchCycle = async () => {
    try {
      const response = await api.get('/admin/cycle');
      setActivePhase(response.data.activePhase || 'GOAL_SETTING');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseChange = async (phase) => {
    // In a real application, this would send an API request to update the SystemSetting collection
    // and trigger the Nodemailer "Check-in window is now open" email to all employees.
    setActivePhase(phase);
    alert(`Cycle updated to ${phase}! Notification emails would be sent to all employees.`);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Manage System Cycles</h1>
          <p className="text-muted-foreground mt-1">Control which forms are active for employees and managers.</p>
        </div>
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Settings size={18} /> Current Phase: {activePhase.replace('_', ' ')}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mt-8">
        <div className="p-4 bg-muted/50 border-b border-border font-semibold text-lg flex items-center gap-2">
          <RefreshCw size={18} className="text-primary" /> Lifecycle Phases
        </div>
        <div className="divide-y divide-border">
          {PHASES.map((phase) => (
            <div key={phase.value} className={`p-4 flex items-center justify-between transition-colors ${activePhase === phase.value ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
              <div>
                <div className="font-medium text-foreground">{phase.label}</div>
                <div className="text-sm text-muted-foreground">Typical Window: {phase.window}</div>
              </div>
              <div>
                {activePhase === phase.value ? (
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Active
                  </span>
                ) : (
                  <button
                    onClick={() => handlePhaseChange(phase.value)}
                    className="text-sm font-medium text-primary hover:text-primary/80 px-4 py-2 border border-primary/30 rounded-md hover:bg-primary/5 transition-colors"
                  >
                    Activate Phase
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCycles;
