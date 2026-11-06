import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { getLeaves, createLeave, updateLeave, populateLeave, getEmployees } from '../../lib/store';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Emergency Leave', 'Annual Leave', 'Unpaid Leave'];
const emptyForm = { employee: '', leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '' };

const LeavePage: React.FC = () => {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const fetchLeaves = () => {
    const filter: any = {};
    if (filterStatus) filter.status = filterStatus;
    setLeaves(getLeaves(filter).map(l => populateLeave(l)));
  };

  useEffect(() => { fetchLeaves(); }, [filterStatus]);
  useEffect(() => { setEmployees(getEmployees()); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      createLeave(form);
      toast.success('Leave request submitted');
      setShowModal(false); fetchLeaves();
    } catch (err: any) { toast.error(err.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleApprove = (id: string, status: 'Approved' | 'Rejected') => {
    updateLeave(id, { status, adminApproval: { approvedBy: user?._id, remarks: approvalRemarks, approvedAt: new Date().toISOString() } });
    toast.success(`Leave ${status.toLowerCase()}`);
    setViewModal(false); fetchLeaves();
  };

  const handleManagerReview = (id: string, recommendation: string) => {
    updateLeave(id, { managerReview: { reviewedBy: user?._id, recommendation, remarks: approvalRemarks, reviewedAt: new Date().toISOString() } });
    toast.success('Review submitted');
    setViewModal(false); fetchLeaves();
  };

  const counts = { Pending: leaves.filter(l => l.status === 'Pending').length, Approved: leaves.filter(l => l.status === 'Approved').length, Rejected: leaves.filter(l => l.status === 'Rejected').length };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div><h1 className="text-2xl font-bold text-white">Leave Management</h1></div>
          <button onClick={() => { setForm({ ...emptyForm }); setShowModal(true); }} className="btn-primary"><Plus size={16} /> New Leave Request</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center" style={{ borderTop: '3px solid #fbbf24' }}><div className="text-3xl font-bold" style={{ color: '#fbbf24' }}>{counts.Pending}</div><div className="text-sm mt-1 flex items-center justify-center gap-1" style={{ color: 'rgba(255,255,255,0.6)' }}><Clock size={12} /> Pending</div></div>
          <div className="glass-card p-4 text-center" style={{ borderTop: '3px solid #36B99B' }}><div className="text-3xl font-bold" style={{ color: '#36B99B' }}>{counts.Approved}</div><div className="text-sm mt-1 flex items-center justify-center gap-1" style={{ color: 'rgba(255,255,255,0.6)' }}><CheckCircle size={12} /> Approved</div></div>
          <div className="glass-card p-4 text-center" style={{ borderTop: '3px solid #ef4444' }}><div className="text-3xl font-bold" style={{ color: '#ef4444' }}>{counts.Rejected}</div><div className="text-sm mt-1 flex items-center justify-center gap-1" style={{ color: 'rgba(255,255,255,0.6)' }}><XCircle size={12} /> Rejected</div></div>
        </div>

        <div className="glass-card p-4 flex gap-3">
          <select className="form-input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Requests</option>
            {['Pending', 'Approved', 'Rejected', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <motion.div className="glass-card overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(39,197,193,0.2)', color: '#27C5C1' }}>{leave.employee?.fullName?.charAt(0)}</div>
                        <div><div className="font-medium text-white">{leave.employee?.fullName}</div><div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{leave.employee?.employeeId}</div></div>
                      </div>
                    </td>
                    <td>{leave.leaveType}</td>
                    <td style={{ color: 'rgba(255,255,255,0.65)' }}>{format(new Date(leave.fromDate), 'MMM d, yyyy')}</td>
                    <td style={{ color: 'rgba(255,255,255,0.65)' }}>{format(new Date(leave.toDate), 'MMM d, yyyy')}</td>
                    <td className="text-center"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(39,197,193,0.15)', color: '#27C5C1' }}>{leave.numberOfDays}d</span></td>
                    <td style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}><span className="truncate block max-w-[120px]">{leave.reason}</span></td>
                    <td><StatusBadge status={leave.status} size="sm" /></td>
                    <td><button className="btn-icon" onClick={() => { setSelected(leave); setApprovalRemarks(''); setViewModal(true); }}><Eye size={14} /></button></td>
                  </tr>
                ))}
                {leaves.length === 0 && <tr><td colSpan={8} className="text-center py-10" style={{ color: 'rgba(255,255,255,0.4)' }}>No leave requests</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Leave Request" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Employee *</label><select className="form-input" value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} required><option value="">Select Employee</option>{employees.map((e: any) => <option key={e._id} value={e._id}>{e.fullName} ({e.employeeId})</option>)}</select></div>
          <div><label className="form-label">Leave Type *</label><select className="form-input" value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>{LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">From *</label><input type="date" className="form-input" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} required /></div>
            <div><label className="form-label">To *</label><input type="date" className="form-input" value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })} required /></div>
          </div>
          <div><label className="form-label">Reason *</label><textarea className="form-input" rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required /></div>
          <div className="flex gap-3"><button type="submit" disabled={loading} className="btn-primary">{loading ? 'Submitting...' : 'Submit Request'}</button><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button></div>
        </form>
      </Modal>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Leave Request Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold" style={{ background: 'rgba(39,197,193,0.2)', color: '#27C5C1' }}>{selected.employee?.fullName?.charAt(0)}</div>
              <div><h3 className="text-lg font-bold text-white">{selected.employee?.fullName}</h3><p style={{ color: '#27C5C1' }}>{selected.employee?.employeeId}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Leave Type', selected.leaveType], ['From', format(new Date(selected.fromDate), 'MMM d, yyyy')], ['To', format(new Date(selected.toDate), 'MMM d, yyyy')], ['Days', selected.numberOfDays], ['Status', selected.status]].map(([l, v]) => (
                <div key={l as string} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}><div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</div><div className="text-sm text-white">{v}</div></div>
              ))}
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}><div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Reason</div><div className="text-sm text-white">{selected.reason}</div></div>
            {selected.status === 'Pending' && (
              <div>
                <label className="form-label">Remarks</label>
                <textarea className="form-input" rows={2} value={approvalRemarks} onChange={e => setApprovalRemarks(e.target.value)} placeholder="Optional remarks..." />
                <div className="flex gap-3 mt-3">
                  {user?.role === 'admin' ? (
                    <><button onClick={() => handleApprove(selected._id, 'Approved')} className="btn-primary flex-1 justify-center"><CheckCircle size={16} /> Approve</button>
                    <button onClick={() => handleApprove(selected._id, 'Rejected')} className="btn-danger flex-1 justify-center"><XCircle size={16} /> Reject</button></>
                  ) : (
                    <><button onClick={() => handleManagerReview(selected._id, 'Recommend Approve')} className="btn-primary flex-1 justify-center">Recommend Approve</button>
                    <button onClick={() => handleManagerReview(selected._id, 'Recommend Reject')} className="btn-danger flex-1 justify-center">Recommend Reject</button></>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default LeavePage;
