import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, Users, CalendarCheck, Ship, MapPin, Compass,
  UserCheck, FileText, Bell, Settings, ChevronLeft, ChevronRight,
  LogOut, Anchor, ClipboardList, BarChart3, UserCog, History, AlertCircle, X
} from 'lucide-react';

export const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Employees', path: '/admin/employees' },
  { icon: CalendarCheck, label: 'Attendance', path: '/admin/attendance' },
  { icon: History, label: 'Att. History', path: '/admin/attendance-history' },
  { icon: CalendarCheck, label: 'Att. Approval', path: '/admin/attendance-approval', attendanceBadge: true },
  { icon: AlertCircle, label: 'Corrections', path: '/admin/corrections', badge: true },
  { icon: Ship, label: 'Boats', path: '/admin/boats' },
  { icon: MapPin, label: 'Boat Tracking', path: '/admin/tracking' },
  { icon: Compass, label: 'Sea Trips', path: '/admin/trips' },
  { icon: UserCheck, label: 'Crew', path: '/admin/crew' },
  { icon: FileText, label: 'Leave', path: '/admin/leave' },
  { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
  { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
  { icon: UserCog, label: 'Managers', path: '/admin/managers' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const managerNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
  { icon: Users, label: 'My Employees', path: '/manager/employees' },
  { icon: CalendarCheck, label: 'Attendance', path: '/manager/attendance' },
  { icon: History, label: 'Att. History', path: '/manager/attendance-history' },
  { icon: Ship, label: 'Boat Ops', path: '/manager/boats' },
  { icon: Compass, label: 'Sea Trips', path: '/manager/trips' },
  { icon: UserCheck, label: 'Crew', path: '/manager/crew' },
  { icon: Anchor, label: 'Departure & Arrival', path: '/manager/departures' },
  { icon: ClipboardList, label: 'Leave Requests', path: '/manager/leave' },
  { icon: BarChart3, label: 'Reports', path: '/manager/reports' },
  { icon: Bell, label: 'Notifications', path: '/manager/notifications' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, mobile = false, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = user?.role === 'admin' ? adminNavItems : managerNavItems;

  // Live badge counts for admin
  const [corrCount, setCorrCount] = React.useState(0);
  const [pendingAttCount, setPendingAttCount] = React.useState(0);
  React.useEffect(() => {
    const update = () => {
      try {
        const corrs = JSON.parse(localStorage.getItem('marine_corrections') || '[]');
        setCorrCount(corrs.filter((c: any) => c.status === 'Pending').length);
        const atts = JSON.parse(localStorage.getItem('marine_attendance') || '[]');
        const dateSet = new Set(atts.filter((a: any) => a.approvalStatus === 'Pending').map((a: any) => new Date(a.date).toDateString()));
        setPendingAttCount(dateSet.size);
      } catch { setCorrCount(0); setPendingAttCount(0); }
    };
    update();
    const timer = setInterval(update, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    if (mobile && onClose) onClose();
  };

  const isExpanded = mobile || !collapsed;

  return (
    <motion.aside
      animate={{ width: mobile ? 280 : collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={`flex-shrink-0 h-full flex flex-col relative select-none ${mobile ? 'w-[280px] max-w-[85vw]' : ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(8,47,73,0.98) 0%, rgba(6,59,92,0.96) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        zIndex: 50,
      }}
    >
      {/* Logo Header */}
      <div className="flex items-center justify-between px-4 py-4 sm:py-5 border-b border-white/[0.08] flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #27C5C1, #36B99B)' }}
          >
            <Anchor size={20} color="white" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="truncate"
              >
                <div className="text-white font-bold text-sm tracking-tight leading-tight">Marine Ops</div>
                <div className="text-xs" style={{ color: '#27C5C1' }}>Management System</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile close button */}
        {mobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1 overscroll-contain">
        {navItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNav(item.path)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left min-h-[44px]"
              style={{
                background: active ? 'rgba(39,197,193,0.15)' : 'transparent',
                color: active ? '#27C5C1' : 'rgba(255,255,255,0.7)',
                border: active ? '1px solid rgba(39,197,193,0.3)' : '1px solid transparent',
              }}
            >
              <div className="relative flex-shrink-0">
                <item.icon size={19} />
                {(item as any).badge && corrCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-white flex items-center justify-center font-bold"
                    style={{ background: '#FF875E', fontSize: '9px' }}>{corrCount}</span>
                )}
                {(item as any).attendanceBadge && pendingAttCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-white flex items-center justify-center font-bold"
                    style={{ background: '#fbbf24', fontSize: '9px' }}>{pendingAttCount}</span>
                )}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium truncate flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-white/[0.08] space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03]">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #27C5C1, #36B99B)' }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden flex-1"
              >
                <div className="text-white text-xs font-medium truncate">{user?.name}</div>
                <div className="text-[11px] capitalize font-semibold" style={{ color: '#27C5C1' }}>{user?.role}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => { logout(); if (mobile && onClose) onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors min-h-[44px]"
          style={{ color: 'rgba(255,100,100,0.85)' }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,100,100,0.12)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={17} className="flex-shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Desktop Collapse Toggle Chevron */}
      {!mobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hidden lg:flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          style={{ background: '#27C5C1', color: 'white', border: '2px solid rgba(8,47,73,0.8)', zIndex: 60 }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}
    </motion.aside>
  );
};

export default Sidebar;
