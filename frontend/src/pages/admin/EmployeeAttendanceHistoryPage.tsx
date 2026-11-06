import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Download, ChevronDown, ChevronUp, FileSpreadsheet, BarChart3 } from 'lucide-react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { getEmployees, getEmployee, getEmployeeAttendanceHistory } from '../../lib/store';
import type { MonthSummary } from '../../lib/store';
import { useI18n } from '../../lib/i18n';
import { format } from 'date-fns';

const EmployeeAttendanceHistoryPage: React.FC = () => {
  const { t } = useI18n();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [history, setHistory] = useState<MonthSummary[]>([]);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [emp, setEmp] = useState<any>(null);

  useEffect(() => {
    const emps = getEmployees();
    setEmployees(emps);
    if (emps.length && !selectedEmpId) setSelectedEmpId(emps[0]._id);
  }, []);

  useEffect(() => {
    if (!selectedEmpId) return;
    const e = getEmployee(selectedEmpId);
    setEmp(e);
    const hist = getEmployeeAttendanceHistory(selectedEmpId);
    setHistory(hist);
    setExpandedMonth(hist[0]?.monthLabel || null);
  }, [selectedEmpId]);

  // CSV export for one employee — full record level
  const downloadCSV = () => {
    if (!emp || !history.length) return;
    const rows: string[] = [
      `Employee Attendance Report — ${emp.fullName}`,
      `Employee ID: ${emp.employeeId} | Rank: ${emp.jobRole} | Phone: ${emp.phone}`,
      `Joining Date: ${emp.joiningDate || 'N/A'} | Station: ${emp.station || 'NAVLAKHI'}`,
      '',
      'Month,Date,Status,Check In,Check Out,Location,Remarks',
    ];
    history.forEach(m => {
      m.records.forEach((r: any) => {
        rows.push([
          m.monthLabel,
          r.date ? format(new Date(r.date), 'dd/MM/yyyy') : '—',
          r.status,
          r.checkIn || '—',
          r.checkOut || '—',
          r.workingLocation || '—',
          (r.managerRemarks || '').replace(/,/g, ';'),
        ].join(','));
      });
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `attendance_${emp.fullName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // CSV export monthly summary for one employee
  const downloadSummaryCSV = () => {
    if (!emp || !history.length) return;
    const rows: string[] = [
      `Monthly Summary — ${emp.fullName} (${emp.employeeId})`,
      '',
      'Month,Total Days,Present,Late Arrival,Half Day,At Sea,On Leave,Absent,Weekly Off',
    ];
    history.forEach(m => {
      rows.push([m.monthLabel, m.total, m.present, m.lateArrival, m.halfDay, m.atSea, m.onLeave, m.absent, m.weeklyOff].join(','));
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `summary_${emp.fullName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const SUMMARY_COLS = [
    { key: 'present', label: t.presentDays, color: '#36B99B' },
    { key: 'lateArrival', label: t.lateArrival, color: '#f97316' },
    { key: 'halfDay', label: t.halfDay, color: '#818cf8' },
    { key: 'atSea', label: t.seaDays, color: '#27C5C1' },
    { key: 'onLeave', label: t.leaveDays, color: '#fbbf24' },
    { key: 'absent', label: t.absentDays, color: '#ef4444' },
    { key: 'weeklyOff', label: t.weeklyOff, color: '#6b7280' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 size={24} style={{ color: '#27C5C1' }} />
              {t.attendanceHistory}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Per-employee monthly breakdown — from joining date to today
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={downloadSummaryCSV} className="btn-secondary" disabled={!history.length}>
              <Download size={15} /> {t.monthSummary} CSV
            </button>
            <button onClick={downloadCSV} className="btn-primary" disabled={!history.length}>
              <FileSpreadsheet size={15} /> {t.downloadCSV}
            </button>
          </div>
        </div>

        {/* Employee selector */}
        <div className="glass-card p-5">
          <label className="form-label mb-2 block">{t.selectEmployee}</label>
          <div className="flex flex-wrap gap-3">
            {employees.map(e => (
              <button
                key={e._id}
                onClick={() => setSelectedEmpId(e._id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm"
                style={{
                  background: selectedEmpId === e._id ? 'rgba(39,197,193,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedEmpId === e._id ? 'rgba(39,197,193,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedEmpId === e._id ? '#27C5C1' : 'rgba(255,255,255,0.7)',
                }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(39,197,193,0.25)', color: '#27C5C1' }}>
                  {e.fullName.charAt(0)}
                </div>
                {e.fullName}
              </button>
            ))}
          </div>
        </div>

        {/* Employee profile card */}
        {emp && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, rgba(39,197,193,0.3), rgba(54,185,155,0.3))', color: '#27C5C1' }}>
                {emp.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">{emp.fullName}</h2>
                <div className="flex flex-wrap gap-4 mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span>{emp.employeeId}</span>
                  <span>·</span>
                  <span>{emp.jobRole}</span>
                  <span>·</span>
                  <span>{emp.phone}</span>
                  {emp.joiningDate && <><span>·</span><span>{t.joiningDate}: {emp.joiningDate}</span></>}
                </div>
              </div>
              <StatusBadge status={emp.currentStatus} />
            </div>

            {/* Overall totals */}
            {history.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 mt-5">
                {SUMMARY_COLS.map(col => {
                  const total = history.reduce((sum, m) => sum + (m as any)[col.key], 0);
                  return (
                    <div key={col.key} className="p-3 rounded-xl text-center" style={{ background: col.color + '18', border: `1px solid ${col.color}33` }}>
                      <div className="text-2xl font-bold" style={{ color: col.color }}>{total}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{col.label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Monthly breakdown */}
        {history.length === 0 ? (
          <div className="glass-card p-12 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <User size={36} className="mx-auto mb-3 opacity-40" />
            <p>{t.noRecords}</p>
            <p className="text-xs mt-1">No attendance has been marked for this employee yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(m => (
              <motion.div key={m.monthLabel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
                {/* Month header — click to expand */}
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setExpandedMonth(expandedMonth === m.monthLabel ? null : m.monthLabel)}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-white font-semibold text-base">{m.monthLabel}</span>
                    <div className="flex gap-2 flex-wrap">
                      {SUMMARY_COLS.map(col => (m as any)[col.key] > 0 && (
                        <span key={col.key} className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: col.color + '22', color: col.color }}>
                          {col.label}: {(m as any)[col.key]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{m.total} days</span>
                    {expandedMonth === m.monthLabel ? <ChevronUp size={16} style={{ color: '#27C5C1' }} /> : <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                  </div>
                </button>

                {expandedMonth === m.monthLabel && (
                  <div className="border-t overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          {[t.date, t.status, t.checkIn, t.checkOut, 'Location', t.remarks].map(h => (
                            <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {m.records.map((r: any) => (
                          <tr key={r._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '8px 14px', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                              {r.date ? format(new Date(r.date), 'dd MMM yyyy') : '—'}
                            </td>
                            <td style={{ padding: '8px 14px' }}><StatusBadge status={r.status} size="sm" /></td>
                            <td style={{ padding: '8px 14px', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>{r.checkIn || '—'}</td>
                            <td style={{ padding: '8px 14px', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>{r.checkOut || '—'}</td>
                            <td style={{ padding: '8px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{r.workingLocation || '—'}</td>
                            <td style={{ padding: '8px 14px', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{r.managerRemarks || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeAttendanceHistoryPage;
