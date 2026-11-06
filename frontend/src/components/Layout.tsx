import React, { useState } from 'react';
import Sidebar from './Sidebar';
import OceanBackground from './OceanBackground';
import { Bell, Languages, ArrowLeftRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../lib/i18n';
import { useNavigate } from 'react-router-dom';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, switchRole } = useAuthStore();
  const navigate = useNavigate();
  const { t, toggle } = useI18n();

  const notifPath = user?.role === 'admin' ? '/admin/notifications' : '/manager/notifications';

  const handleRoleSwitch = () => {
    const nextRole = user?.role === 'admin' ? 'manager' : 'admin';
    switchRole(nextRole);
    navigate(nextRole === 'admin' ? '/admin/dashboard' : '/manager/dashboard');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ position: 'relative' }}>
      <OceanBackground />
      <div className="flex w-full h-full relative" style={{ zIndex: 1 }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <div
            className="flex items-center justify-between px-6 py-3 flex-shrink-0"
            style={{
              background: 'rgba(6,59,92,0.6)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <div className="text-white font-semibold text-sm">{user?.name}</div>
              <div className="text-xs capitalize" style={{ color: '#27C5C1' }}>
                {user?.role} Panel
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Role Quick Switch */}
              <button
                onClick={handleRoleSwitch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{
                  background: user?.role === 'admin' ? 'rgba(54,185,155,0.2)' : 'rgba(255,135,94,0.2)',
                  border: user?.role === 'admin' ? '1px solid rgba(54,185,155,0.4)' : '1px solid rgba(255,135,94,0.4)',
                  color: user?.role === 'admin' ? '#36B99B' : '#FF875E',
                }}
                title="Click to switch role"
              >
                <ArrowLeftRight size={13} />
                Switch to {user?.role === 'admin' ? 'Manager' : 'Admin'}
              </button>
              <div className="text-xs text-white/40 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              {/* Language toggle */}
              <button
                onClick={toggle}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'rgba(39,197,193,0.15)', border: '1px solid rgba(39,197,193,0.25)', color: '#27C5C1' }}
                title="Switch language"
              >
                <Languages size={13} /> {t.languageToggle}
              </button>
              <button
                className="btn-icon relative"
                onClick={() => navigate(notifPath)}
              >
                <Bell size={16} />
              </button>
            </div>
          </div>
          {/* Page content */}
          <main className="flex-1 overflow-y-auto px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
