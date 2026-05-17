import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LayoutDashboard, Target, Activity, CheckSquare, Settings, LogOut, Users, BarChart } from 'lucide-react';
import { cn } from '../utils/cn';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeLinks = [
    { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/goals', icon: Target, label: 'My Goals' },
    { to: '/employee/achievements', icon: Activity, label: 'Achievements' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: Users, label: 'Team Dashboard' },
    { to: '/manager/approvals', icon: CheckSquare, label: 'Goal Approvals' },
    { to: '/manager/checkins', icon: Activity, label: 'Quarterly Check-ins' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: BarChart, label: 'Completion Report' },
    { to: '/admin/users', icon: Users, label: 'Manage Users' },
    { to: '/admin/cycles', icon: Settings, label: 'Manage Cycles' },
  ];

  let links = [];
  if (user.role === 'EMPLOYEE') links = employeeLinks;
  else if (user.role === 'MANAGER') links = managerLinks;
  else if (user.role === 'ADMIN') links = adminLinks;

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border flex items-center gap-3 text-primary">
        <Target size={28} />
        <span className="font-heading font-bold text-xl">AtomQuest</span>
      </div>

      <div className="p-4 flex-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
          Menu
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-foreground hover:bg-muted"
              )}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-md bg-muted/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none mb-1">{user.name}</span>
            <span className="text-xs text-muted-foreground leading-none">{user.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
