import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import EmployeeGoals from './pages/EmployeeGoals';
import ManagerApprovals from './pages/ManagerApprovals';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeAchievements from './pages/EmployeeAchievements';
import ManagerCheckins from './pages/ManagerCheckins';
import AdminCycles from './pages/AdminCycles';
import AdminUsers from './pages/AdminUsers';

// Placeholder components for roles
const EmployeeDashboard = () => <div className="p-8 text-xl font-bold">Employee Dashboard</div>;
const ManagerDashboard = () => <div className="p-8 text-xl font-bold">Manager Dashboard</div>;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user object isn't loaded yet (just token), we might need to fetch it.
  // For now, assuming user is available on login.
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Employee Routes */}
        <Route path="/employee" element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="goals" element={<EmployeeGoals />} />
          <Route path="achievements" element={<EmployeeAchievements />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="approvals" element={<ManagerApprovals />} />
          <Route path="checkins" element={<ManagerCheckins />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* <Route path="reports" element={<AdminReports />} /> */}
          {/* <Route path="audit" element={<AdminAudit />} /> */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="cycles" element={<AdminCycles />} />
        </Route>

        <Route path="/unauthorized" element={<div className="p-8 text-red-500 font-bold">Unauthorized Access</div>} />
        <Route path="*" element={<div className="p-8 font-bold">404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
