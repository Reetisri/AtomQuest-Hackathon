import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Trash2 } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'EMPLOYEE',
    department: '',
    managerId: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchManagers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get('/users/managers');
      setManagers(response.data);
    } catch (err) {
      console.error('Failed to fetch managers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.role === 'EMPLOYEE' && !formData.managerId) {
      setError('Employees must have an assigned manager.');
      return;
    }

    try {
      await api.post('/users', formData);
      setFormData({ name: '', email: '', role: 'EMPLOYEE', department: '', managerId: '' });
      await fetchUsers();
      await fetchManagers(); // Refresh managers list in case a new manager was added
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        await fetchUsers();
        await fetchManagers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">Create and manage accounts for the portal.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Create User Form */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-primary" /> Create New User
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              required
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. Sales, Engineering"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {formData.role === 'EMPLOYEE' && (
            <div>
              <label className="block text-sm font-medium mb-1">Assign Manager</label>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/50"
                required
              >
                <option value="">Select a Manager...</option>
                {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-end lg:col-start-3">
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Create Account
            </button>
          </div>
          <div className="md:col-span-2 lg:col-span-3 text-xs text-muted-foreground mt-2">
            * Note: New users are created with the default password: <b>Welcome123</b>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 font-semibold">Name & Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Manager</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-secondary rounded-full text-xs font-semibold">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{user.department}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.managerId ? user.managerId.name : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-destructive hover:text-destructive/80 p-1"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
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

export default AdminUsers;
