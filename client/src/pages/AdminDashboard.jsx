import React, { useState, useEffect } from 'react';
import api from '../api';
import { Check, X, Download } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Basic CSV export implementation
    const headers = ['Employee Name', 'Department', 'Goals Submitted', 'Manager Approved'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + stats.map(s => `${s.name},${s.department},${s.goalsSubmitted ? 'Yes' : 'No'},${s.goalsApproved ? 'Yes' : 'No'}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "completion_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Completion Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of goal setting and tracking progress.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold text-center">Goals Submitted</th>
                <th className="px-4 py-3 font-semibold text-center">Manager Approved</th>
                <th className="px-4 py-3 font-semibold text-center">Q1 Completed</th>
                <th className="px-4 py-3 font-semibold text-center">Q2 Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.map((stat) => (
                <tr key={stat.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{stat.name}</td>
                  <td className="px-4 py-3">{stat.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {stat.goalsSubmitted ? <Check className="text-green-500" size={18} /> : <X className="text-red-500" size={18} />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {stat.goalsApproved ? <Check className="text-green-500" size={18} /> : <X className="text-red-500" size={18} />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center text-muted-foreground">
                      -
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center text-muted-foreground">
                      -
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
