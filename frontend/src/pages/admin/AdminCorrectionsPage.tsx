import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { getCorrections, approveCorrection, rejectCorrection, populateCorrection } from '../../lib/store';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../lib/i18n';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminCorrectionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const [corrections, setCorrections] = useState<any[]>([]);
  const [filter, setFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('Pending');
  const [actionModal, setActionModal] = useState<{ open: boolean; item: any; action: 'approve' | 'reject' } | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');

  const load = () => {
    const all = getCorrections(filter !== 'All' ? { status: filter } : undefined);
    setCorrections(all.map(populateCorrection));
  };
  useEffect(() => { load(); }, [filter]);

  const handleAction = () => {
    if (!actionModal) return;
    if (!adminRemarks.trim() && actionModal.action === 'reject') {
      toast.error('Please provide a reason for rejection');
      return;
    }
    if (actionModal.action === 'approve') {
      approveCorrection(actionModal.item._id, user!._id, adminRemarks);
      toast.success('Correction approved and attendance updated ✓');
    } else {
      rejectCorrection(actionModal.item._id, user!._id, adminRemarks);
      toast.success('Correction rejected');
    }
    setActionModal(null);
    setAdminRemarks('');
    load();
  };

  const pending = getCorrections({ status: 'Pending' }).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <AlertCircle size={24} style={{ color: '#FF875E' }} />
              {t.pendingCorrections}
              {pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(255,135,94,0.25)', color: '#FF875E' }}>{pending}</span>
              )}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Manager-submitted attendance correction requests — Admin approval required
            </p>
          </div>
          <div className="flex gap-2">
            {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-xl text-sm transition-all"
                style={{
                  background: filter === f ? (f === 'Pending' ? 'rgba(255,135,94,0.2)' : f === 'Approved' ? 'rgba(54,185,155,0.2)' : f === 'Rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(39,197,193,0.2)') : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${filter === f ? (f === 'Pending' ? 'rgba(255,135,94,0.4)' : f === 'Approved' ? 'rgba(54,185,155,0.4)' : f === 'Rejected' ? 'rgba(239,68,68,0.4)' : 'rgba(39,197,193,0.4)') : 'rgba(255,255,255,0.1)'}`,
                  color: filter === f ? (f === 'Pending' ? '#FF875E' : f === 'Approved' ? '#36B99B' : f === 'Rejected' ? '#ef4444' : '#27C5C1') : 'rgba(255,255,255,0.6)',
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {corrections.length === 0 ? (
          <div className="glass-card p-12 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <CheckCircle size={36} className="mx-auto mb-3 opacity-40" />
            <p>No {filter.toLowerCase()} correction requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {corrections.map((c: any) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                      style={{ background: 'rgba(255,135,94,0.15)', color: '#FF875E' }}>
                      {c.employee?.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{c.employee?.fullName}</h3>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {c.employee?.employeeId} · {c.employee?.jobRole}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: c.status === 'Pending' ? 'rgba(255,135,94,0.2)' : c.status === 'Approved' ? 'rgba(54,185,155,0.2)' : 'rgba(239,68,68,0.2)',
                      color: c.status === 'Pending' ? '#FF875E' : c.status === 'Approved' ? '#36B99B' : '#ef4444',
                    }}>
                    {c.status === 'Pending' ? <Clock size={11} className="inline mr-1" /> : c.status === 'Approved' ? <CheckCircle size={11} className="inline mr-1" /> : <XCircle size={11} className="inline mr-1" />}
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.correctionDate}</div>
                    <div className="text-sm text-white">{c.date ? format(new Date(c.date), 'dd MMM yyyy') : '—'}</div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.originalStatus}</div>
                    <StatusBadge status={c.originalStatus || '—'} size="sm" />
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(39,197,193,0.06)' }}>
                    <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.requestedStatus}</div>
                    <StatusBadge status={c.requestedStatus} size="sm" />
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Submitted By</div>
                    <div className="text-sm text-white">{c.submittedByUser?.name || '—'}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.createdAt ? format(new Date(c.createdAt), 'dd MMM, HH:mm') : ''}</div>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.correctionReason}</div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.reason}</p>
                </div>

                {c.adminRemarks && (
                  <div className="mt-2 p-3 rounded-xl" style={{ background: 'rgba(54,185,155,0.06)', border: '1px solid rgba(54,185,155,0.15)' }}>
                    <div className="text-xs mb-1" style={{ color: '#36B99B' }}>{t.adminRemarks}</div>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{c.adminRemarks}</p>
                  </div>
                )}

                {c.status === 'Pending' && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => { setActionModal({ open: true, item: c, action: 'approve' }); setAdminRemarks(''); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{ background: 'rgba(54,185,155,0.2)', border: '1px solid rgba(54,185,155,0.4)', color: '#36B99B' }}>
                      <CheckCircle size={15} /> {t.approve}
                    </button>
                    <button onClick={() => { setActionModal({ open: true, item: c, action: 'reject' }); setAdminRemarks(''); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                      <XCircle size={15} /> {t.reject}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!actionModal?.open} onClose={() => setActionModal(null)} title={actionModal?.action === 'approve' ? `${t.approve} Correction` : `${t.reject} Correction`} size="sm">
        {actionModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl" style={{ background: actionModal.action === 'approve' ? 'rgba(54,185,155,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${actionModal.action === 'approve' ? 'rgba(54,185,155,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
              <p className="text-sm text-white font-medium">{actionModal.item.employee?.fullName}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {actionModal.item.date ? format(new Date(actionModal.item.date), 'dd MMM yyyy') : '—'} ·
                {actionModal.item.originalStatus} → {actionModal.item.requestedStatus}
              </p>
            </div>
            <div>
              <label className="form-label">{t.adminRemarks} {actionModal.action === 'reject' ? '*' : '(optional)'}</label>
              <textarea className="form-input" rows={3} value={adminRemarks} onChange={e => setAdminRemarks(e.target.value)}
                placeholder={actionModal.action === 'approve' ? 'Approved — correction applied' : 'Reason for rejection...'} />
            </div>
            {actionModal.action === 'approve' && (
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                ✓ Approving will update the attendance record immediately.
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={handleAction}
                className="flex-1 justify-center flex items-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all"
                style={{ background: actionModal.action === 'approve' ? 'rgba(54,185,155,0.25)' : 'rgba(239,68,68,0.2)', border: `1px solid ${actionModal.action === 'approve' ? 'rgba(54,185,155,0.4)' : 'rgba(239,68,68,0.35)'}`, color: actionModal.action === 'approve' ? '#36B99B' : '#ef4444' }}>
                {actionModal.action === 'approve' ? <CheckCircle size={15} /> : <XCircle size={15} />}
                {actionModal.action === 'approve' ? t.approve : t.reject}
              </button>
              <button onClick={() => setActionModal(null)} className="btn-secondary">{t.cancel}</button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default AdminCorrectionsPage;
