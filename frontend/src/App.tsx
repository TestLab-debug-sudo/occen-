import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeesPage from './pages/admin/EmployeesPage';
import AttendancePage from './pages/admin/AttendancePage';
import BoatsPage from './pages/admin/BoatsPage';
import TrackingPage from './pages/admin/TrackingPage';
import TripsPage from './pages/admin/TripsPage';
import CrewPage from './pages/admin/CrewPage';
import LeavePage from './pages/admin/LeavePage';
import ReportsPage from './pages/admin/ReportsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import ManagersPage from './pages/admin/ManagersPage';
import SettingsPage from './pages/admin/SettingsPage';

// Admin special pages
import EmployeeAttendanceHistoryPage from './pages/admin/EmployeeAttendanceHistoryPage';
import AdminCorrectionsPage from './pages/admin/AdminCorrectionsPage';
import AdminAttendanceApprovalPage from './pages/admin/AdminAttendanceApprovalPage';

// Manager pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import DepartureArrivalPage from './pages/manager/DepartureArrivalPage';
import ManagerAttendancePage from './pages/manager/ManagerAttendancePage';

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'manager';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/manager/dashboard'} replace />;
  }
  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user } = useAuthStore();
  return <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/admin/dashboard'} replace />;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(8,47,73,0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(39,197,193,0.3)',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#36B99B', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute role="admin"><EmployeesPage /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute role="admin"><AttendancePage /></ProtectedRoute>} />
        <Route path="/admin/boats" element={<ProtectedRoute role="admin"><BoatsPage /></ProtectedRoute>} />
        <Route path="/admin/tracking" element={<ProtectedRoute role="admin"><TrackingPage /></ProtectedRoute>} />
        <Route path="/admin/trips" element={<ProtectedRoute role="admin"><TripsPage /></ProtectedRoute>} />
        <Route path="/admin/crew" element={<ProtectedRoute role="admin"><CrewPage /></ProtectedRoute>} />
        <Route path="/admin/leave" element={<ProtectedRoute role="admin"><LeavePage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="admin"><ReportsPage /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><NotificationsPage /></ProtectedRoute>} />
        <Route path="/admin/managers" element={<ProtectedRoute role="admin"><ManagersPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute role="admin"><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin/attendance-history" element={<ProtectedRoute role="admin"><EmployeeAttendanceHistoryPage /></ProtectedRoute>} />
        <Route path="/admin/corrections" element={<ProtectedRoute role="admin"><AdminCorrectionsPage /></ProtectedRoute>} />
        <Route path="/admin/attendance-approval" element={<ProtectedRoute role="admin"><AdminAttendanceApprovalPage /></ProtectedRoute>} />

        {/* Manager Routes — managers can also access most pages */}
        <Route path="/manager/dashboard" element={<ProtectedRoute role="manager"><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/employees" element={<ProtectedRoute role="manager"><EmployeesPage /></ProtectedRoute>} />
        <Route path="/manager/attendance" element={<ProtectedRoute role="manager"><ManagerAttendancePage /></ProtectedRoute>} />
        <Route path="/manager/attendance-history" element={<ProtectedRoute role="manager"><EmployeeAttendanceHistoryPage /></ProtectedRoute>} />
        <Route path="/manager/boats" element={<ProtectedRoute role="manager"><BoatsPage /></ProtectedRoute>} />
        <Route path="/manager/tracking" element={<ProtectedRoute role="manager"><TrackingPage /></ProtectedRoute>} />
        <Route path="/manager/trips" element={<ProtectedRoute role="manager"><TripsPage /></ProtectedRoute>} />
        <Route path="/manager/crew" element={<ProtectedRoute role="manager"><CrewPage /></ProtectedRoute>} />
        <Route path="/manager/departures" element={<ProtectedRoute role="manager"><DepartureArrivalPage /></ProtectedRoute>} />
        <Route path="/manager/leave" element={<ProtectedRoute role="manager"><LeavePage /></ProtectedRoute>} />
        <Route path="/manager/reports" element={<ProtectedRoute role="manager"><ReportsPage /></ProtectedRoute>} />
        <Route path="/manager/notifications" element={<ProtectedRoute role="manager"><NotificationsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
