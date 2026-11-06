import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Calendar, TrendingUp, Ship, Users, FileText } from 'lucide-react';
import Layout from '../../components/Layout';
import { getAttendance, getTrips, getLeaves, getBoats, populateAttendance, populateTrip, populateLeave } from '../../lib/store';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import StatusBadge from '../../components/StatusBadge';

const REPORT_TYPES = [
  { id: 'attendance', label: 'Attendance Report', icon: <Users size={16} />, color: '#36B99B' },
  { id: 'trips', label: 'Sea Trip Report', icon: <Ship size={16} />, color: '#27C5C1' },
  { id: 'leave', label: 'Leave Report', icon: <Calendar size={16} />, color: '#fbbf24' },
];

const CHART_COLORS = ['#27C5C1', '#36B99B', '#fbbf24', '#FF875E', '#818cf8'];

const buildMonthlyAttendanceData = () => {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const from = startOfMonth(d);
    const to = endOfMonth(d);
    const recs = getAttendance({ from: from.toISOString(), to: to.toISOString() });
    result.push({
      month: format(d, 'MMM'),
      present: recs.filter((r: any) => r.status === 'Present' || r.status === 'Late Arrival').length,
      atSea: recs.filter((r: any) => r.status === 'At Sea').length,
      absent: recs.filter((r: any) => r.status === 'Absent').length,
    });
  }
  return result;
};

const buildMonthlyTripData = () => {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const from = startOfMonth(d);
    const to = endOfMonth(d);
    const allTrips = getTrips();
    const inRange = allTrips.filter((t: any) => {
      const dep = new Date(t.departureDate);
      return dep >= from && dep <= to;
    });
    result.push({
      month: format(d, 'MMM'),
      completed: inRange.filter((t: any) => t.status === 'Completed').length,
      delayed: inRange.filter((t: any) => t.status === 'Delayed').length,
      cancelled: inRange.filter((t: any) => t.status === 'Cancelled').length,
    });
  }
  return result;
};

const buildBoatUtilizationData = () => {
  const boats = getBoats();
  const trips = getTrips();
  return boats.map((b: any, i: number) => ({
    name: b.boatName,
    trips: trips.filter((t: any) => t.boat === b._id).length,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
};

const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState('attendance');
  const [reportData, setReportData] = useState<any[]>([]);
  const [from, setFrom] = useState(format(new Date(Date.now() - 30 * 86400000), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceChart, setAttendanceChart] = useState<any[]>([]);
  const [tripChart, setTripChart] = useState<any[]>([]);
  const [boatChart, setBoatChart] = useState<any[]>([]);

  useEffect(() => {
    setAttendanceChart(buildMonthlyAttendanceData());
    setTripChart(buildMonthlyTripData());
    setBoatChart(buildBoatUtilizationData());
  }, []);

  useEffect(() => {
    const fromDate = new Date(from);
    const toDate = new Date(to); toDate.setHours(23, 59, 59, 999);

    if (activeReport === 'attendance') {
      const recs = getAttendance({ from: fromDate.toISOString(), to: toDate.toISOString() });
      setReportData(recs.map(populateAttendance));
    } else if (activeReport === 'trips') {
      const trips = getTrips().filter((t: any) => {
        const d = new Date(t.departureDate);
        return d >= fromDate && d <= toDate;
      });
      setReportData(trips.map((t: any) => populateTrip(t._id)));
    } else if (activeReport === 'leave') {
      const leaves = getLeaves().filter((l: any) => {
        const d = new Date(l.createdAt);
        return d >= fromDate && d <= toDate;
      });
      setReportData(leaves.map(populateLeave));
    }
  }, [activeReport, from, to]);

  const exportCSV = () => {
    if (reportData.length === 0) { alert('No data to export'); return; }
    let rows: string[] = [];
    if (activeReport === 'attendance') {
      rows = ['Employee,Date,Status,Check In,Check Out,Location',
        ...reportData.map(r => [r.employee?.fullName, r.date ? format(new Date(r.date), 'yyyy-MM-dd') : '', r.status, r.checkIn || '', r.checkOut || '', r.workingLocation || ''].join(','))];
    } else if (activeReport === 'trips') {
      rows = ['Trip ID,Boat,Captain,Destination,Departure,Status',
        ...reportData.filter(Boolean).map((r: any) => [r.tripId, r.boat?.boatName, r.captain?.fullName, r.destination, r.departureDate ? format(new Date(r.departureDate), 'yyyy-MM-dd') : '', r.status].join(','))];
    } else {
      rows = ['Employee,Leave Type,From,To,Days,Status',
        ...reportData.map((r: any) => [r.employee?.fullName, r.leaveType, r.fromDate ? format(new Date(r.fromDate), 'yyyy-MM-dd') : '', r.toDate ? format(new Date(r.toDate), 'yyyy-MM-dd') : '', r.numberOfDays, r.status].join(','))];
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${activeReport}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const allTrips = getTrips();
  const totalTrips = allTrips.filter((t: any) => t.status === 'Completed').length;
  const delayedTotal = allTrips.filter((t: any) => t.status === 'Delayed').length;
  const cancelledTotal = allTrips.filter((t: any) => t.status === 'Cancelled').length;
  const allAtt = getAttendance();
  const presentAtt = allAtt.filter((a: any) => ['Present', 'At Sea', 'Late Arrival'].includes(a.status)).length;
  const attRate = allAtt.length ? ((presentAtt / allAtt.length) * 100).toFixed(1) + '%' : '—';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Data insights and operational reports</p>
          </div>
          <button onClick={exportCSV} className="btn-secondary">
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Charts Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={16} style={{ color: '#27C5C1' }} />
              Monthly Attendance Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(8,47,73,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="present" name="Present" fill="#36B99B" radius={[3,3,0,0]} />
                <Bar dataKey="atSea" name="At Sea" fill="#27C5C1" radius={[3,3,0,0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Ship size={16} style={{ color: '#27C5C1' }} />
              Monthly Sea Trips
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={tripChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(8,47,73,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                <Line type="monotone" dataKey="completed" stroke="#36B99B" strokeWidth={2} name="Completed" dot={{ fill: '#36B99B' }} />
                <Line type="monotone" dataKey="delayed" stroke="#FF875E" strokeWidth={2} name="Delayed" dot={{ fill: '#FF875E' }} />
                <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Cancelled" dot={{ fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={16} style={{ color: '#27C5C1' }} />
              Boat Utilization
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={boatChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: 'rgba(8,47,73,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="trips" name="Trips">
                  {boatChart.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Completed Trips', value: totalTrips, color: '#27C5C1' },
                { label: 'Delayed Trips', value: delayedTotal, color: '#FF875E' },
                { label: 'Attendance Rate', value: attRate, color: '#36B99B' },
                { label: 'Total Attendance Records', value: allAtt.length, color: '#36B99B' },
                { label: 'Pending Leave Requests', value: getLeaves({ status: 'Pending' }).length, color: '#fbbf24' },
                { label: 'Cancelled Trips', value: cancelledTotal, color: '#ef4444' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="glass-card p-5">
          <div className="flex items-center flex-wrap gap-4 mb-5">
            <h3 className="text-white font-semibold">Detailed Report</h3>
            <div className="flex gap-2 flex-wrap">
              {REPORT_TYPES.map(rt => (
                <button key={rt.id} onClick={() => setActiveReport(rt.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all"
                  style={{ background: activeReport === rt.id ? `${rt.color}20` : 'rgba(255,255,255,0.06)', border: `1px solid ${activeReport === rt.id ? rt.color + '40' : 'rgba(255,255,255,0.1)'}`, color: activeReport === rt.id ? rt.color : 'rgba(255,255,255,0.7)' }}>
                  {rt.icon} {rt.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-3 flex-wrap">
              <input type="date" className="form-input" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 'auto' }} />
              <input type="date" className="form-input" value={to} onChange={e => setTo(e.target.value)} style={{ width: 'auto' }} />
            </div>
          </div>

          {reportData.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    {activeReport === 'attendance' && <><th>Employee</th><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Location</th></>}
                    {activeReport === 'trips' && <><th>Trip ID</th><th>Boat</th><th>Captain</th><th>Destination</th><th>Departure</th><th>Status</th></>}
                    {activeReport === 'leave' && <><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></>}
                  </tr>
                </thead>
                <tbody>
                  {reportData.filter(Boolean).slice(0, 20).map((row: any, i: number) => (
                    <tr key={i}>
                      {activeReport === 'attendance' && (
                        <><td>{row.employee?.fullName}</td><td>{row.date ? format(new Date(row.date), 'MMM d, yyyy') : '—'}</td><td><StatusBadge status={row.status} size="sm" /></td><td>{row.checkIn || '—'}</td><td>{row.checkOut || '—'}</td><td>{row.workingLocation || '—'}</td></>
                      )}
                      {activeReport === 'trips' && (
                        <><td style={{ color: '#27C5C1' }}>{row.tripId}</td><td>{row.boat?.boatName}</td><td>{row.captain?.fullName}</td><td>{row.destination}</td><td>{row.departureDate ? format(new Date(row.departureDate), 'MMM d, yyyy') : '—'}</td><td><StatusBadge status={row.status} size="sm" /></td></>
                      )}
                      {activeReport === 'leave' && (
                        <><td>{row.employee?.fullName}</td><td>{row.leaveType}</td><td>{row.fromDate ? format(new Date(row.fromDate), 'MMM d, yyyy') : '—'}</td><td>{row.toDate ? format(new Date(row.toDate), 'MMM d, yyyy') : '—'}</td><td>{row.numberOfDays}</td><td><StatusBadge status={row.status} size="sm" /></td></>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.length > 20 && (
                <p className="text-xs text-center mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Showing 20 of {reportData.length} records. Export CSV for full data.</p>
              )}
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <FileText size={32} className="mx-auto mb-3 opacity-40" />
              <p>No records found for the selected filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
