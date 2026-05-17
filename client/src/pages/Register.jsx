import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api';
import { Target } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'EMPLOYEE',
    managerId: ''
  });
  
  const [managers, setManagers] = useState([]);
  const { login, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'EMPLOYEE') navigate('/employee/dashboard');
      else if (user.role === 'MANAGER') navigate('/manager/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Fetch managers for the dropdown
    const fetchManagers = async () => {
      try {
        // Use a public or unprotected endpoint if possible. 
        // For hackathon, if unprotected endpoint doesn't exist, we just let them type it or we create an unprotected one.
        // Actually, since it's a public form, we can't easily fetch managers if the endpoint is protected.
        // Let's create an unprotected route or just assume they know the manager email for the demo.
        // I'll fetch them using a new public endpoint or just skip managerId for now if it fails.
        const res = await api.get('/auth/managers-public'); // We will add this endpoint
        setManagers(res.data);
      } catch (err) {
        console.error('Failed to fetch managers', err);
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (formData.role === 'EMPLOYEE' && !formData.managerId) {
      setLocalError('Please select a manager.');
      return;
    }

    try {
      const response = await api.post('/auth/register', formData);
      login(response.data, response.data.token);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 shadow-md">
            <Target size={24} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-center">Create an Account</h1>
          <p className="text-muted-foreground text-sm mt-2">Join the Goal Tracking Portal</p>
        </div>

        {localError && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="Create a password"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                required
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="e.g. Sales"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {formData.role === 'EMPLOYEE' && (
            <div>
              <label className="block text-sm font-medium mb-1">Reporting Manager</label>
              <select
                required
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              >
                <option value="">Select your manager...</option>
                {managers.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-md hover:bg-primary/90 transition-colors mt-2"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
