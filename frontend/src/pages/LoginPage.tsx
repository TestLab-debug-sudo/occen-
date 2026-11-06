import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor, Eye, EyeOff, AlertCircle, Shield, UserCheck, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import OceanBackground from '../components/OceanBackground';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, switchRole, user: currentUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const u = useAuthStore.getState().user;
      toast.success(`Welcome back, ${u.name}!`);
      navigate(u.role === 'admin' ? '/admin/dashboard' : '/manager/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const quickLogin = (role: 'admin' | 'manager') => {
    switchRole(role);
    toast.success(`Active as ${role === 'admin' ? 'System Admin' : 'Capt. M. Madhukar Rao'}`);
    navigate(role === 'admin' ? '/admin/dashboard' : '/manager/dashboard');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <OceanBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #27C5C1, #36B99B)' }}
          >
            <Anchor size={36} color="white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Marine Ops</h1>
          <p className="text-sm mt-1" style={{ color: '#27C5C1' }}>Boat Company Management System</p>
        </div>

        {/* Card */}
        <div className="glass-card-light p-6 sm:p-8 rounded-2xl shadow-2xl">
          {/* Quick 1-Click Entry Buttons */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 text-center">
              ⚡ Instant 1-Click Entry (Default Auto-Login)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => quickLogin('admin')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #27C5C1, #36B99B)',
                  color: '#fff',
                }}
              >
                <Shield size={16} />
                <span>Admin Panel</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('manager')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  color: '#fff',
                }}
              >
                <UserCheck size={16} />
                <span>Manager Panel</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-xs text-white/40 uppercase">Or Sign In with Credentials</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl mb-4"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            >
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label text-xs">Email Address</label>
              <input
                type="email"
                className="form-input text-sm"
                placeholder="admin@boatcompany.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label text-xs">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input pr-10 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 text-sm font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          {/* Current Status Indicator */}
          <div className="mt-6 pt-4 text-center border-t border-white/10">
            <p className="text-xs text-white/50">
              Current active session: <span className="text-[#27C5C1] font-medium">{currentUser?.name} ({currentUser?.role})</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
