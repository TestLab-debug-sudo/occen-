import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, CalendarCheck, Users, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import {
  getPendingAttendanceDates, getAttendance, approveAttendanceBatch,
  rejectAttendanceBatch, populateAttendance, getEmployees,
} from '../../lib/store';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../lib/i18n';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminAttendanceApprovalPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();

  const [pendingDates, setPendingDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    const dates = getPendingAttendanceDates();
    setPendingDates(dates);
    if (!selectedDate && dates.length) setSelectedDate(dates[0]);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedDate) { setRecords([]); return; }
    const recs = getAttendance({ date: selectedDate, approvalStatus: 'Pending' });
    setRecords(recs.map(populateAttendance));
  }, [selectedDate]);

  const handleApprove = () => {
    if (!selectedDate) return;
    approveAttendanceBatch(selectedDate, user!._id);
    toast.success(`✓ Attendance for ${format(new Date(selectedDate), 'dd MMM yyyy')} approved`);
    const remaining = getPendingAttendanceDates();
    setPendingDates(remaining);
    setSelectedDate(remaining[0] || null);
    setRecords([]);
  };

  const handleReject = () => {
    if (!selectedDate || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    rejectAttendanceBatch(selectedDate, user!._id, rejectReason.trim());
    toast.success('Attendance sheet sent back to Manager');
    setRejectModal(false);
    setRejectReason('');
    const remaining = getPendingAttendanceDates();
    setPendingDates(remaining);
    setSelectedDate(remaining[0] || null);
    setRecords([]);
  };

  // Summary counts for selected date
  const summary = records.reduce((acc: any, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <CalendarCheck size={24} style={{ color: '#27C5C1' }} />
              Attendance Approval
              {pendingDates.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-sm font-bold" style={{ background: 'rgba(255,135,94,0.25)', color: '#FF875E' }}>
                  {pendingDates.length} pending
                </span>
              )}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Review and approve manager-submitted attendance sheets
            </p>
          </div>
        </div>

        {pendingDates.length === 0 ? (
          <div className="glass-card p-14 text-center">
            <CheckCircle size={40} className="mx-auto mb-3" style={{ color: '#36B99B', opacity: 0.5 }} />
            <p className="text-white font-medium">No pending attendance sheets</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>All submissions have been reviewed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Date list sidebar */}
            <div className="glass-card p-4 space-y-2">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock size={14} style={{ color: '#FF875E' }} /> Pending Dates
              </h3>
              {pendingDates.map(d => (
                <button key={d} onClick={() => setSelectedDate(d)}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all text-sm"
                  style={{
                    background: selectedDate === d ? 'rgba(39,197,193,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selectedDate === d ? 'rgba(39,197,193,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: selectedDate === d ? '#27C5C1' : 'rgba(255,255,255,0.75)',
                  }}>
                  <div className="font-medium">{format(new Date(d), 'dd MMM yyyy')}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{format(new Date(d), 'EEEE')}</div>
                </button>
              ))}
            </div>

            {/* Main review area */}
            <div className="lg:col-span-3 space-y-4">
              {selectedDate && (
                <>
                  {/* Summary bar */}
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Users size={16} style={{ color: '#27C5C1' }} />
                        {format(new Date(selectedDate), 'EEEE, dd MMMM yyyy')} — {records.length} employees
                      </h3>
                      <div className="flex gap-2">
                        <button onClick={handleApprove}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                          style={{ background: 'rgba(54,185,155,0.2)', border: '1px solid rgba(54,185,155,0.5)', color: '#36B99B' }}>
                          <CheckCircle size={15} /> Approve All
                        </button>
                        <button onClick={() => { setRejectModal(true); setRejectReason(''); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }}>
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>

                    {/* Status summary pills */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(summary).map(([status, count]: [string, any]) => (
                        <span key={status} className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: 'rgba(39,197,193,0.15)', color: '#27C5C1', border: '1px solid rgba(39,197,193,0.25)' }}>
                          {status}: {count}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Records table */}
                  <div className="glass-card overflow-hidden">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          {['#', 'Employee', 'Rank', 'Status', 'Check In', 'Check Out', 'Location', 'Remarks'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((rec: any, i: number) => (
                          <motion.tr key={rec._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.035)' }}>
                            <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>{i + 1}</td>
                            <td style={{ padding: '9px 14px' }}>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background: 'rgba(39,197,193,0.2)', color: '#27C5C1' }}>
                                  {rec.employee?.fullName?.charAt(0)}
                                </div>
                                <span className="text-sm text-white">{rec.employee?.fullName}</span>
                              </div>
                            </td>
                            <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{rec.employee?.jobRole}</td>
                            <td style={{ padding: '9px 14px' }}><StatusBadge status={rec.status} size="sm" /></td>
                            <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>{rec.checkIn || '—'}</td>
                            <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>{rec.checkOut || '—'}</td>
                            <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>{rec.workingLocation || '—'}</td>
                            <td style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{rec.managerRemarks || '—'}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Attendance Sheet" size="sm">
        <div className="space-y-4">
          <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={16} style={{ color: '#ef4444' }} />
            <p className="text-sm text-white">
              This will send the attendance sheet back to Manager for correction.
            </p>
          </div>
          <div>
            <label className="form-label">Rejection Reason *</label>
            <textarea className="form-input" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Missing check-in times, incorrect status for 3 employees..." />
          </div>
          <div className="flex gap-3">
            <button onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
              <XCircle size={15} /> Reject & Return to Manager
            </button>
            <button onClick={() => setRejectModal(false)} className="btn-secondary">{t.cancel}</button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default AdminAttendanceApprovalPage;
