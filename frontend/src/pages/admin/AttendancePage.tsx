import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { getAttendance, bulkMarkAttendance, updateAttendance, getTodayAttendanceSummary, getEmployees, populateAttendance } from '../../lib/store';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const STATUSES = ['Present', 'Absent', 'Half Day', 'Late Arrival', 'On Leave', 'At Sea', 'Returned from Sea', 'Weekly Off'];

const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({ employee: '', status: 'Present', checkIn: '', checkOut: '', workingLocation: 'Harbour', managerRemarks: '' });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>({});

  const fetchRecords = () => {
    const filter: any = { date };
    if (filterStatus) filter.status = filterStatus;
    const raw = getAttendance(filter);
    setRecords(raw.map(r => populateAttendance(r)));
    setSummary(getTodayAttendanceSummary());
  };

  useEffect(() => { fetchRecords(); }, [date, filterStatus]);
  useEffect(() => { setEmployees(getEmployees()); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      if (editRecord) {
        updateAttendance(editRecord._id, form);
        toast.success('Attendance updated');
      } else {
        bulkMarkAttendance([{ employee: form.employee, status: form.status, checkIn: form.checkIn, checkOut: form.checkOut, workingLocation: form.workingLocation, remarks: form.managerRemarks }], new Date(date), user?._id || 'admin1');
        toast.success('Attendance recorded');
      }
      setShowModal(false); setEditRecord(null);
      fetchRecords();
    } catch (err: any) { toast.error(err.message || 'Error'); }
    finally { setLoading(false); }
  };

  const openEdit = (rec: any) => {
    setEditRecord(rec);
    setForm({ employee: rec.employee?._id || '', status: rec.status, checkIn: rec.checkIn || '', checkOut: rec.checkOut || '', workingLocation: rec.workingLocation || '', managerRemarks: rec.managerRemarks || '' });
    setShowModal(true);
  };

  const summaryColors: any = { Present: '#36B99B', Absent: '#ef4444', 'At Sea': '#27C5C1', 'On Leave': '#fbbf24', 'Late Arrival': '#f59e0b', 'Weekly Off': '#6b7280', 'Returned from Sea': '#36B99B', 'Half Day': '#818cf8' };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Attendance Management</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Daily attendance tracking</p>
          </div>
          <button onClick={() => { setEditRecord(null); setForm({ employee: '', status: 'Present', checkIn: '', checkOut: '', workingLocation: 'Harbour', managerRemarks: '' }); setShowModal(true); }} className="btn-primary">
            <Plus size={16} /> Mark Attendance
          </button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(summary).map(([status, count]) => (
            <div key={status} className="glass-card p-3 text-center">
              <div className="text-2xl font-bold" style={{ color: summaryColors[status] || '#fff' }}>{count as number}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{status}</div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4 flex flex-wrap gap-3">
          <div>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
          </div>
          <div>
            <label className="form-label">Status Filter</label>
            <select className="form-input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <motion.div className="glass-card overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Category</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Location</th><th>Remarks</th><th>Action</th></tr></thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(39,197,193,0.2)', color: '#27C5C1' }}>{rec.employee?.fullName?.charAt(0)}</div>
                        <div>
                          <div className="font-medium text-white">{rec.employee?.fullName}</div>
                          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{rec.employee?.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.65)' }}>{rec.employee?.category}</td>
                    <td><StatusBadge status={rec.status} size="sm" /></td>
                    <td style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>{rec.checkIn || '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>{rec.checkOut || '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{rec.workingLocation || '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{rec.managerRemarks || '—'}</td>
                    <td><button className="btn-icon" onClick={() => openEdit(rec)}><Edit size={14} /></button></td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={8} className="text-center py-10" style={{ color: 'rgba(255,255,255,0.4)' }}>No attendance records for this date</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditRecord(null); }} title={editRecord ? 'Edit Attendance' : 'Mark Attendance'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editRecord && (
            <div>
              <label className="form-label">Employee *</label>
              <select className="form-input" value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} required>
                <option value="">Select Employee</option>
                {employees.map((e: any) => <option key={e._id} value={e._id}>{e.fullName} ({e.employeeId})</option>)}
              </select>
            </div>
          )}
          {editRecord && <div className="p-3 rounded-xl mb-2" style={{ background: 'rgba(39,197,193,0.1)' }}><p className="text-sm text-white font-medium">{editRecord.employee?.fullName}</p></div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Status *</label>
              <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="form-label">Working Location</label><input className="form-input" value={form.workingLocation} onChange={e => setForm({ ...form, workingLocation: e.target.value })} /></div>
            <div><label className="form-label">Check In Time</label><input className="form-input" type="time" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} /></div>
            <div><label className="form-label">Check Out Time</label><input className="form-input" type="time" value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} /></div>
          </div>
          <div><label className="form-label">Remarks</label><textarea className="form-input" rows={2} value={form.managerRemarks} onChange={e => setForm({ ...form, managerRemarks: e.target.value })} /></div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : editRecord ? 'Update' : 'Save'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default AttendancePage;
