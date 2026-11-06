import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Save, AlertCircle, CheckCircle, Send,
  ChevronDown, BarChart3, Calendar, Clock,
} from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import {
  getEmployees, getAttendance, bulkMarkAttendance,
  submitCorrection, getEmployee,
} from '../../lib/store';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../lib/i18n';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['Present', 'Absent', 'On Leave', 'At Sea', 'Half Day', 'Late Arrival', 'Weekly Off', 'Returned from Sea'];

const STATUS_COLOR: Record<string, string> = {
  Present: '#36B99B', Absent: '#ef4444', 'On Leave': '#fbbf24',
  'At Sea': '#27C5C1', 'Half Day': '#818cf8', 'Late Arrival': '#f97316',
  'Weekly Off': '#6b7280', 'Returned from Sea': '#06b6d4',
};

interface AttRow {
  employeeId: string; fullName: string; rank: string;
  existingId: string | null; existingStatus: string; approvalStatus: string;
  status: string; checkIn: string; checkOut: string; remarks: string;
  alreadySaved: boolean;
}

// ─────────────────────── DAILY ATTENDANCE TAB ────────────────────────
const DailyTab: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selDate, setSelDate] = useState(today);
  const [rows, setRows] = useState<AttRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [corrModal, setCorrModal] = useState<{ open: boolean; row: AttRow | null }>({ open: false, row: null });
  const [corrReason, setCorrReason] = useState('');
  const [corrStatus, setCorrStatus] = useState('');

  const loadRows = useCallback(() => {
    const emps = getEmployees();
    const dateObj = new Date(selDate); dateObj.setHours(12, 0, 0, 0);
    const attRecs = getAttendance({ date: dateObj.toISOString() });
    setRows(emps.map(emp => {
      const ex = attRecs.find((a: any) => a.employee === emp._id);
      return {
        employeeId: emp._id, fullName: emp.fullName, rank: emp.jobRole,
        existingId: ex?._id || null, existingStatus: ex?.status || '',
        approvalStatus: ex?.approvalStatus || '',
        status: ex?.status || '', checkIn: ex?.checkIn || '',
        checkOut: ex?.checkOut || '', remarks: ex?.managerRemarks || '',
        alreadySaved: !!ex,
      };
    }));
  }, [selDate]);

  useEffect(() => { loadRows(); }, [loadRows]);

  const upd = (i: number, k: keyof AttRow, v: string) =>
    setRows(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const handleSave = () => {
    const toMark = rows.filter(r => r.status && !r.alreadySaved);
    if (!toMark.length) { toast.error('No new attendance to save'); return; }
    setSaving(true);
    try {
      const d = new Date(selDate); d.setHours(12, 0, 0, 0);
      bulkMarkAttendance(
        toMark.map(r => ({ employee: r.employeeId, status: r.status, checkIn: r.checkIn, checkOut: r.checkOut, workingLocation: 'NAVLAKHI Station', remarks: r.remarks })),
        d, user!._id
      );
      toast.success(`${toMark.length} record(s) submitted — pending Admin approval`);
      loadRows();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const handleResubmit = () => {
    // Manager re-submits rejected attendance
    const toResubmit = rows.filter(r => r.status && r.approvalStatus === 'Rejected');
    if (!toResubmit.length) { toast.error('Nothing to resubmit'); return; }
    const d = new Date(selDate); d.setHours(12, 0, 0, 0);
    bulkMarkAttendance(
      toResubmit.map(r => ({ employee: r.employeeId, status: r.status, checkIn: r.checkIn, checkOut: r.checkOut, workingLocation: 'NAVLAKHI Station', remarks: r.remarks })),
      d, user!._id
    );
    toast.success('Attendance resubmitted to Admin');
    loadRows();
  };

  const pendingCount = rows.filter(r => r.approvalStatus === 'Pending').length;
  const approvedCount = rows.filter(r => r.approvalStatus === 'Approved').length;
  const rejectedCount = rows.filter(r => r.approvalStatus === 'Rejected').length;
  const unsaved = rows.filter(r => r.status && !r.alreadySaved).length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center flex-wrap gap-3">
        <input type="date" className="form-input" value={selDate} max={today}
          onChange={e => setSelDate(e.target.value)} style={{ width: 'auto' }} />

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
            <Clock size={12} /> {pendingCount} records pending Admin approval
          </div>
        )}
        {approvedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'rgba(54,185,155,0.15)', border: '1px solid rgba(54,185,155,0.3)', color: '#36B99B' }}>
            <CheckCircle size={12} /> {approvedCount} approved
          </div>
        )}
        {rejectedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            <AlertCircle size={12} /> {rejectedCount} rejected — please correct &amp; resubmit
          </div>
        )}

        <div className="ml-auto flex gap-2">
          {rejectedCount > 0 && (
            <button onClick={handleResubmit} className="btn-secondary">
              <Send size={15} /> Resubmit
            </button>
          )}
          <button onClick={handleSave} disabled={saving || unsaved === 0} className="btn-primary">
            <Save size={15} />
            {saving ? 'Saving...' : `Submit to Admin (${unsaved})`}
          </button>
        </div>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map(s => (
          <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
            style={{ background: STATUS_COLOR[s] + '20', color: STATUS_COLOR[s] }}>
            {s}
          </span>
        ))}
      </div>

      {/* Attendance table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['#', t.employeeName, t.rank, 'Approval', t.status, t.checkIn, t.checkOut, t.remarks, ''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <motion.tr key={row.employeeId} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.025 }}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    background: row.approvalStatus === 'Approved' ? 'rgba(54,185,155,0.03)'
                      : row.approvalStatus === 'Rejected' ? 'rgba(239,68,68,0.04)' : 'transparent',
                  }}>
                  <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>{idx + 1}</td>

                  {/* Name */}
                  <td style={{ padding: '9px 12px' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(39,197,193,0.2)', color: '#27C5C1' }}>
                        {row.fullName.charAt(0)}
                      </div>
                      <span className="text-sm text-white">{row.fullName}</span>
                    </div>
                  </td>

                  {/* Rank */}
                  <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{row.rank}</td>

                  {/* Approval badge */}
                  <td style={{ padding: '9px 12px' }}>
                    {row.approvalStatus ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: row.approvalStatus === 'Approved' ? 'rgba(54,185,155,0.2)'
                            : row.approvalStatus === 'Rejected' ? 'rgba(239,68,68,0.2)'
                            : 'rgba(251,191,36,0.2)',
                          color: row.approvalStatus === 'Approved' ? '#36B99B'
                            : row.approvalStatus === 'Rejected' ? '#ef4444' : '#fbbf24',
                        }}>
                        {row.approvalStatus}
                      </span>
                    ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>—</span>}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '9px 12px', minWidth: '150px' }}>
                    {row.approvalStatus === 'Approved' ? (
                      <StatusBadge status={row.existingStatus} size="sm" />
                    ) : (
                      <div className="relative">
                        <select className="form-input pr-7 appearance-none"
                          style={{ fontSize: '0.78rem', padding: '4px 24px 4px 8px', minWidth: '140px', background: row.status ? STATUS_COLOR[row.status] + '20' : undefined, color: row.status ? STATUS_COLOR[row.status] : undefined }}
                          value={row.status}
                          onChange={e => upd(idx, 'status', e.target.value)}>
                          <option value="">— Select —</option>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
                      </div>
                    )}
                  </td>

                  {/* Check In / Out */}
                  {['checkIn', 'checkOut'].map(field => (
                    <td key={field} style={{ padding: '9px 12px', minWidth: '90px' }}>
                      {row.approvalStatus === 'Approved' ? (
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{(row as any)[field] || '—'}</span>
                      ) : (
                        <input type="time" className="form-input"
                          style={{ fontSize: '0.78rem', padding: '4px 6px', width: '90px' }}
                          value={(row as any)[field]}
                          onChange={e => upd(idx, field as keyof AttRow, e.target.value)} />
                      )}
                    </td>
                  ))}

                  {/* Remarks */}
                  <td style={{ padding: '9px 12px', minWidth: '120px' }}>
                    {row.approvalStatus === 'Approved' ? (
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{row.remarks || '—'}</span>
                    ) : (
                      <input className="form-input" style={{ fontSize: '0.78rem', padding: '4px 6px', width: '110px' }}
                        value={row.remarks} onChange={e => upd(idx, 'remarks', e.target.value)} placeholder="Remarks" />
                    )}
                  </td>

                  {/* Correction button (for approved records) */}
                  <td style={{ padding: '9px 12px' }}>
                    {row.approvalStatus === 'Approved' && (
                      <button onClick={() => { setCorrModal({ open: true, row }); setCorrReason(''); setCorrStatus(row.existingStatus); }}
                        className="px-2 py-1 rounded-lg text-xs transition-all"
                        style={{ background: 'rgba(255,135,94,0.12)', color: '#FF875E', border: '1px solid rgba(255,135,94,0.2)' }}>
                        <AlertCircle size={11} className="inline mr-1" />{t.submitCorrection}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="p-10 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <CalendarCheck size={30} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No employees found</p>
          </div>
        )}
      </div>

      {/* Correction Modal */}
      <Modal isOpen={corrModal.open} onClose={() => setCorrModal({ open: false, row: null })} title={t.correctionRequest} size="sm">
        {corrModal.row && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,135,94,0.1)', border: '1px solid rgba(255,135,94,0.2)' }}>
              <p className="font-semibold text-white">{corrModal.row.fullName}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Date: {selDate}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">{t.originalStatus}</label>
                <div className="form-input opacity-60">{corrModal.row.existingStatus}</div>
              </div>
              <div>
                <label className="form-label">{t.requestedStatus}</label>
                <select className="form-input" value={corrStatus} onChange={e => setCorrStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">{t.correctionReason} *</label>
              <textarea className="form-input" rows={3} value={corrReason} onChange={e => setCorrReason(e.target.value)} placeholder="Why is this correction needed?" />
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <Send size={11} className="inline mr-1" />This will be sent to Admin for approval before the record changes.
            </p>
            <div className="flex gap-3">
              <button className="btn-primary flex-1 justify-center"
                onClick={() => {
                  if (!corrReason.trim()) { toast.error('Reason required'); return; }
                  submitCorrection({ employee: corrModal.row!.employeeId, attendanceId: corrModal.row!.existingId, date: selDate, originalStatus: corrModal.row!.existingStatus, requestedStatus: corrStatus, reason: corrReason, submittedBy: user!._id });
                  toast.success('Correction sent to Admin');
                  setCorrModal({ open: false, row: null });
                }}>
                <Send size={14} /> {t.submitCorrection}
              </button>
              <button className="btn-secondary" onClick={() => setCorrModal({ open: false, row: null })}>{t.cancel}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─────────────────────── MONTHLY SUMMARY TAB ────────────────────────
const MONTH_NAMES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_NAMES_TA = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];

const MonthlyTab: React.FC = () => {
  const { t, lang } = useI18n();
  const MONTH_NAMES = lang === 'ta' ? MONTH_NAMES_TA : MONTH_NAMES_EN;

  const now2 = new Date();
  const [selYear, setSelYear] = useState(now2.getFullYear());
  const [selMonth, setSelMonth] = useState(now2.getMonth()); // 0-based
  const [employees, setEmployees] = useState<any[]>([]);
  const [summaryRows, setSummaryRows] = useState<any[]>([]);

  const years = Array.from({ length: 3 }, (_, i) => now2.getFullYear() - i);

  useEffect(() => {
    const emps = getEmployees();
    setEmployees(emps);
  }, []);

  useEffect(() => {
    if (!employees.length) return;
    const from = startOfMonth(new Date(selYear, selMonth, 1));
    const to = endOfMonth(new Date(selYear, selMonth, 1));

    const rows = employees.map(emp => {
      // Only Approved records count
      const recs = getAttendance({ employee: emp._id, from: from.toISOString(), to: to.toISOString(), approvalStatus: 'Approved' });
      let present = 0, absent = 0, onLeave = 0, atSea = 0, halfDay = 0, lateArrival = 0, weeklyOff = 0;
      recs.forEach((r: any) => {
        const s = r.status;
        if (s === 'Present') present++;
        else if (s === 'Late Arrival') { lateArrival++; present++; }
        else if (s === 'Absent') absent++;
        else if (s === 'On Leave') onLeave++;
        else if (s === 'At Sea' || s === 'Returned from Sea') atSea++;
        else if (s === 'Half Day') halfDay++;
        else if (s === 'Weekly Off') weeklyOff++;
      });
      return { emp, present, absent, onLeave, atSea, halfDay, lateArrival, weeklyOff, total: recs.length };
    });
    setSummaryRows(rows);
  }, [employees, selYear, selMonth]);

  const downloadCSV = () => {
    const monthLabel = `${MONTH_NAMES_EN[selMonth]} ${selYear}`;
    const lines = [
      `Monthly Attendance Summary — ${monthLabel}`,
      '',
      'Employee,ID,Rank,Present,Late Arrival,Half Day,At Sea,On Leave,Absent,Weekly Off,Total Days',
      ...summaryRows.map(r => [
        r.emp.fullName, r.emp.employeeId, r.emp.jobRole,
        r.present, r.lateArrival, r.halfDay, r.atSea, r.onLeave, r.absent, r.weeklyOff, r.total,
      ].join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `attendance_summary_${monthLabel.replace(' ', '_')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const COLS = [
    { key: 'present', label: t.presentDays, color: '#36B99B' },
    { key: 'lateArrival', label: 'Late', color: '#f97316' },
    { key: 'halfDay', label: t.halfDay, color: '#818cf8' },
    { key: 'atSea', label: t.seaDays, color: '#27C5C1' },
    { key: 'onLeave', label: t.leaveDays, color: '#fbbf24' },
    { key: 'absent', label: t.absentDays, color: '#ef4444' },
    { key: 'weeklyOff', label: 'Off', color: '#6b7280' },
  ];

  return (
    <div className="space-y-4">
      {/* Month / Year picker */}
      <div className="flex items-center gap-3 flex-wrap">
        <select className="form-input" style={{ width: 'auto' }} value={selMonth} onChange={e => setSelMonth(+e.target.value)}>
          {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className="form-input" style={{ width: 'auto' }} value={selYear} onChange={e => setSelYear(+e.target.value)}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={downloadCSV} className="btn-secondary ml-auto">
          <BarChart3 size={14} /> {t.downloadCSV}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Rank</th>
                {COLS.map(c => (
                  <th key={c.key} style={{ padding: '10px 10px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: c.color, textTransform: 'uppercase' }}>{c.label}</th>
                ))}
                <th style={{ padding: '10px 10px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row, i) => (
                <motion.tr key={row.emp._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(39,197,193,0.2)', color: '#27C5C1' }}>{row.emp.fullName.charAt(0)}</div>
                      <span className="text-sm text-white">{row.emp.fullName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{row.emp.jobRole}</td>
                  {COLS.map(c => (
                    <td key={c.key} style={{ padding: '10px 10px', textAlign: 'center' }}>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                        style={{ background: (row as any)[c.key] > 0 ? c.color + '20' : 'transparent', color: (row as any)[c.key] > 0 ? c.color : 'rgba(255,255,255,0.2)' }}>
                        {(row as any)[c.key]}
                      </span>
                    </td>
                  ))}
                  <td style={{ padding: '10px 10px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>{row.total}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {summaryRows.length === 0 && (
          <div className="p-10 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <BarChart3 size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No approved attendance data for this month</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────── MAIN PAGE ─────────────────────────
const ManagerAttendancePage: React.FC = () => {
  const { t } = useI18n();
  const [tab, setTab] = useState<'daily' | 'monthly'>('daily');

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarCheck size={24} style={{ color: '#27C5C1' }} />
            {t.dailyAttendance}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            NAVLAKHI Station — Submit daily attendance to Admin for approval
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {([['daily', t.markAttendance, CalendarCheck], ['monthly', t.monthSummary, BarChart3]] as const).map(([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === k ? 'rgba(39,197,193,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${tab === k ? 'rgba(39,197,193,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: tab === k ? '#27C5C1' : 'rgba(255,255,255,0.6)',
              }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {tab === 'daily' ? <DailyTab /> : <MonthlyTab />}
      </div>
    </Layout>
  );
};

export default ManagerAttendancePage;
