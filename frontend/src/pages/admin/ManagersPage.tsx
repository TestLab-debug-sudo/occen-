import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { getUsers, createUser, updateUser } from '../../lib/store';
import toast from 'react-hot-toast';

const ManagersPage: React.FC = () => {
  const [managers, setManagers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const loadManagers = () => {
    const users = getUsers();
    setManagers(users.filter(u => u.role === 'manager'));
  };

  useEffect(() => { loadManagers(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        updateUser(selected._id, { name: form.name, phone: form.phone });
        toast.success('Manager updated');
      } else {
        // Check duplicate email
        const existing = getUsers().find(u => u.email === form.email);
        if (existing) { toast.error('Email already exists'); setLoading(false); return; }
        createUser({ name: form.name, email: form.email, password: form.password, phone: form.phone, role: 'manager' });
        toast.success('Manager account created');
      }
      setShowModal(false);
      loadManagers();
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = (id: string) => {
    if (!confirm('Deactivate this manager account?')) return;
    updateUser(id, { isActive: false });
    toast.success('Manager deactivated');
    loadManagers();
  };

  const handleReactivate = (id: string) => {
    updateUser(id, { isActive: true });
    toast.success('Manager reactivated');
    loadManagers();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Manager Management</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin only — create and manage manager accounts</p>
          </div>
          <button
            onClick={() => { setIsEdit(false); setSelected(null); setForm({ name: '', email: '', password: '', phone: '' }); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus size={16} /> Add Manager
          </button>
        </div>

        {managers.length === 0 && (
          <div className="glass-card p-10 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Shield size={36} className="mx-auto mb-3 opacity-40" />
            <p>No manager accounts found</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {managers.map((mgr) => (
            <motion.div key={mgr._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(39,197,193,0.3), rgba(54,185,155,0.3))', color: '#27C5C1' }}
                  >
                    {mgr.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{mgr.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Shield size={11} style={{ color: '#27C5C1' }} />
                      <span className="text-xs" style={{ color: '#27C5C1' }}>Manager</span>
                    </div>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: mgr.isActive !== false ? 'rgba(54,185,155,0.2)' : 'rgba(239,68,68,0.2)', color: mgr.isActive !== false ? '#36B99B' : '#ef4444' }}
                >
                  {mgr.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Email</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>{mgr.email}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Phone</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>{mgr.phone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Account ID</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{mgr._id}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  className="btn-icon"
                  onClick={() => {
                    setIsEdit(true);
                    setSelected(mgr);
                    setForm({ name: mgr.name, email: mgr.email, password: '', phone: mgr.phone || '' });
                    setShowModal(true);
                  }}
                >
                  <Edit size={14} />
                </button>
                <button
                  className="btn-icon ml-auto text-xs px-3 py-1.5 rounded-lg"
                  style={{ color: mgr.isActive !== false ? 'rgba(239,68,68,0.7)' : '#36B99B', border: `1px solid ${mgr.isActive !== false ? 'rgba(239,68,68,0.2)' : 'rgba(54,185,155,0.2)'}` }}
                  onClick={() => mgr.isActive !== false ? handleDeactivate(mgr._id) : handleReactivate(mgr._id)}
                >
                  <Trash2 size={14} />
                  {mgr.isActive !== false ? ' Deactivate' : ' Reactivate'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEdit ? 'Edit Manager' : 'Create Manager Account'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          {!isEdit && (
            <>
              <div>
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
              </div>
            </>
          )}
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+60 12 345 6789" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : isEdit ? 'Update Manager' : 'Create Manager'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default ManagersPage;
