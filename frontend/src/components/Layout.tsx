import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import OceanBackground from './OceanBackground';
import {
  Bell, Languages, ArrowLeftRight, Menu, X, LayoutDashboard,
  CalendarCheck, Ship, Compass, MoreHorizontal
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../lib/i18n';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const { user, switchRole } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, toggle } = useI18n();

  // Universal Device & Viewport Tracking
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      // Auto-collapse sidebar on smaller laptop viewports
      if (width < 1280 && width >= 1024) {
        setCollapsed(true);
      }
      // Auto-close mobile drawer when screen widens to desktop
      if (width >= 1024) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const notifPath = user?.role === 'admin' ? '/admin/notifications' : '/manager/notifications';

  const handleRoleSwitch = () => {
    const nextRole = user?.role === 'admin' ? 'manager' : 'admin';
    switchRole(nextRole);
    navigate(nextRole === 'admin' ? '/admin/dashboard' : '/manager/dashboard');
  };

  const isAdmin = user?.role === 'admin';

  // Mobile Bottom Bar Primary Tabs
  const mobileBottomTabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      path: isAdmin ? '/admin/dashboard' : '/manager/dashboard',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      path: isAdmin ? '/admin/attendance' : '/manager/attendance',
    },
    {
      id: 'boats',
      label: 'Boats',
      icon: Ship,
      path: isAdmin ? '/admin/boats' : '/manager/boats',
    },
    {
      id: 'trips',
      label: 'Trips',
      icon: Compass,
      path: isAdmin ? '/admin/trips' : '/manager/trips',
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden relative select-none bg-[#063B5C]">
      {/* Background visual ocean layers */}
      <OceanBackground />

      <div className="flex w-full h-full relative z-10 overflow-hidden">
        {/* ── DESKTOP PERSISTENT SIDEBAR (>= 1024px) ── */}
        <div className="hidden lg:flex h-full flex-shrink-0">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* ── MOBILE / TABLET OFF-CANVAS DRAWER (< 1024px) ── */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <div className="lg:hidden fixed inset-0 z-[100] flex">
              {/* Dimmed Blurred Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                aria-hidden="true"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                className="relative z-10 h-full flex flex-col shadow-2xl"
              >
                <Sidebar
                  collapsed={false}
                  onToggle={() => {}}
                  mobile={true}
                  onClose={() => setMobileDrawerOpen(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── MAIN WORKSPACE VIEWPORT ── */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {/* Universal Responsive Top Navigation Bar */}
          <header
            className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 flex-shrink-0 z-20"
            style={{
              background: 'rgba(6,59,92,0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Left: Mobile Menu Trigger + Brand / User Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Hamburger Button (< 1024px) */}
              <button
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white transition-all active:scale-95"
                aria-label="Toggle Navigation Menu"
              >
                {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="truncate">
                <div className="text-white font-semibold text-xs sm:text-sm truncate">
                  {user?.name || 'Marine System'}
                </div>
                <div className="text-[10px] sm:text-xs capitalize font-medium flex items-center gap-1.5" style={{ color: '#27C5C1' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27C5C1] animate-pulse"></span>
                  {user?.role} Panel
                </div>
              </div>
            </div>

            {/* Right: Actions, Role Switcher, Language & Alerts */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* Role Quick Switch (Adaptive) */}
              <button
                onClick={handleRoleSwitch}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                style={{
                  background: user?.role === 'admin' ? 'rgba(54,185,155,0.2)' : 'rgba(255,135,94,0.2)',
                  border: user?.role === 'admin' ? '1px solid rgba(54,185,155,0.4)' : '1px solid rgba(255,135,94,0.4)',
                  color: user?.role === 'admin' ? '#36B99B' : '#FF875E',
                }}
                title="Click to switch role"
              >
                <ArrowLeftRight size={13} />
                <span className="hidden md:inline">Switch to </span>
                <span>{user?.role === 'admin' ? 'Manager' : 'Admin'}</span>
              </button>

              {/* Date display (Desktop only) */}
              <div className="text-xs text-white/40 hidden xl:block font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>

              {/* Language toggle */}
              <button
                onClick={toggle}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all hover:bg-white/10"
                style={{ background: 'rgba(39,197,193,0.12)', border: '1px solid rgba(39,197,193,0.25)', color: '#27C5C1' }}
                title="Switch language"
              >
                <Languages size={13} />
                <span className="hidden sm:inline">{t.languageToggle}</span>
              </button>

              {/* Notification icon */}
              <button
                className="btn-icon w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl relative hover:bg-white/15"
                onClick={() => navigate(notifPath)}
                aria-label="View notifications"
              >
                <Bell size={16} />
              </button>
            </div>
          </header>

          {/* Page Dynamic Scrollable Workspace */}
          <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 lg:pb-8 overscroll-contain">
            <div className="max-w-[1720px] mx-auto w-full transition-all">
              {children}
            </div>
          </main>

          {/* ── MOBILE QUICK BOTTOM NAVIGATION BAR (< 640px) ── */}
          <nav
            className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 px-2 border-t border-white/10 shadow-2xl"
            style={{
              background: 'rgba(6,59,92,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {mobileBottomTabs.map((tab) => {
              const active = location.pathname === tab.path;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px]"
                  style={{
                    color: active ? '#27C5C1' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <tab.icon size={20} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[10px] font-medium mt-1 tracking-tight">
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* "More" Menu Button triggers Drawer */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[44px] text-white/50 hover:text-white"
            >
              <MoreHorizontal size={20} />
              <span className="text-[10px] font-medium mt-1 tracking-tight">
                Menu
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Layout;
