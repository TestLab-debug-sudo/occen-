import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Ship, CalendarCheck, Anchor, MapPin, Clock, TrendingUp,
  AlertCircle, CheckCircle, Waves, Navigation, UserCheck, Compass
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import {
  getDashboardStats, getBoats, getEmployees, getTrips,
  populateBoat, populateTrip, populateEmployee
} from '../../lib/store';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

const WEEKLY_ATTENDANCE = [
  { day: 'Mon', present: 15, absent: 2, atSea: 5 },
  { day: 'Tue', present: 14, absent: 3, atSea: 7 },
  { day: 'Wed', present: 16, absent: 1, atSea: 6 },
  { day: 'Thu', present: 13, absent: 2, atSea: 8 },
  { day: 'Fri', present: 15, absent: 2, atSea: 7 },
  { day: 'Sat', present: 10, absent: 5, atSea: 4 },
  { day: 'Today', present: 15, absent: 2, atSea: 7 },
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>({});
  const [boats, setBoats] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const refresh = () => {
    setStats(getDashboardStats(user?.role || 'admin', user?._id));
    setBoats(getBoats().map(b => populateBoat(b._id)).filter(Boolean).slice(0, 5) as any[]);
    setEmployees(getEmployees().map(e => populateEmployee(e._id)).filter(Boolean).slice(0, 8) as any[]);
    setTrips(getTrips().map(t => populateTrip(t._id)).filter(Boolean) as any[]);
  };

  useEffect(() => { refresh(); }, []);

  const empPieData = [
    { name: 'At Sea', value: stats.atSea || 0, color: '#27C5C1' },
    { name: 'On Shore', value: stats.available || 0, color: '#36B99B' },
    { name: 'On Leave', value: stats.onLeave || 0, color: '#fbbf24' },
    { name: 'Absent', value: stats.absentToday || 0, color: '#ef4444' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-white">
              Marine Operations Dashboard
            </motion.h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {format(new Date(), 'EEEE, MMMM d yyyy')} • Live Operations Overview
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <StatCard title="Total Employees" value={stats.totalEmployees || 0} icon={<Users size={18} />} color="#27C5C1" delay={0} />
          <StatCard title="Present Today" value={stats.presentToday || 0} icon={<CheckCircle size={18} />} color="#36B99B" delay={0.05} />
          <StatCard title="Absent Today" value={stats.absentToday || 0} icon={<AlertCircle size={18} />} color="#ef4444" delay={0.1} />
          <StatCard title="On Leave" value={stats.onLeave || 0} icon={<CalendarCheck size={18} />} color="#fbbf24" delay={0.15} />
          <StatCard title="At Sea" value={stats.atSea || 0} icon={<Waves size={18} />} color="#27C5C1" subtitle="Currently sailing" delay={0.2} />
          <StatCard title="On Shore" value={stats.available || 0} icon={<UserCheck size={18} />} color="#36B99B" subtitle="Available" delay={0.25} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <StatCard title="Total Boats" value={stats.totalBoats || 0} icon={<Ship size={18} />} color="#27C5C1" delay={0.3} />
          <StatCard title="Boats at Sea" value={stats.boatsAtSea || 0} icon={<Navigation size={18} />} color="#27C5C1" delay={0.35} />
          <StatCard title="Boats Docked" value={stats.boatsDocked || 0} icon={<Anchor size={18} />} color="#36B99B" delay={0.4} />
          <StatCard title="Active Trips" value={stats.activeTrips || 0} icon={<MapPin size={18} />} color="#fbbf24" delay={0.45} />
          <StatCard title="Completed Trips" value={stats.completedTrips || 0} icon={<CheckCircle size={18} />} color="#36B99B" delay={0.5} />
          <StatCard title="Pending Leave" value={stats.pendingLeave || 0} icon={<Clock size={18} />} color="#FF875E" delay={0.55} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={16} style={{ color: '#27C5C1' }} />
              Weekly Attendance Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={WEEKLY_ATTENDANCE}>
                <defs>
                  <linearGradient id="present" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#36B99B" stopOpacity={0.4} /><stop offset="95%" stopColor="#36B99B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="atSea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27C5C1" stopOpacity={0.4} /><stop offset="95%" stopColor="#27C5C1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(8,47,73,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                <Area type="monotone" dataKey="present" stroke="#36B99B" fill="url(#present)" strokeWidth={2} name="Present" />
                <Area type="monotone" dataKey="atSea" stroke="#27C5C1" fill="url(#atSea)" strokeWidth={2} name="At Sea" />
                <Area type="monotone" dataKey="absent" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="3 3" name="Absent" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users size={16} style={{ color: '#27C5C1' }} /> Employee Status
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={empPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                  {empPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(8,47,73,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {empPieData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />{item.name}
                  </div>
                  <span className="text-sm font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Live Boats + Active Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Ship size={16} style={{ color: '#27C5C1' }} /> Live Boat Status
            </h3>
            <div className="space-y-3">
              {boats.map((boat: any) => (
                <div key={boat._id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(39,197,193,0.15)' }}>
                      <Ship size={14} style={{ color: '#27C5C1' }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{boat.boatName}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{boat.boatId} • {boat.captain?.fullName || 'No Captain'}</div>
                    </div>
                  </div>
                  <StatusBadge status={boat.status} size="sm" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Compass size={16} style={{ color: '#27C5C1' }} /> Active & Upcoming Trips
            </h3>
            <div className="space-y-3">
              {trips.slice(0, 4).map((trip: any) => (
                <div key={trip._id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-white">{trip.boat?.boatName}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{trip.tripId} • To: {trip.destination}</div>
                    </div>
                    <StatusBadge status={trip.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span>Capt. {trip.captain?.fullName}</span>
                    <span>Return: {trip.expectedReturnDate ? format(new Date(trip.expectedReturnDate), 'MMM d') : 'TBD'}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Employee Roster */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users size={16} style={{ color: '#27C5C1' }} /> Employee Roster — Today
          </h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Employee</th><th>ID</th><th>Category</th><th>Status</th><th>Assignment</th></tr></thead>
              <tbody>
                {employees.map((emp: any) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(39,197,193,0.2)', color: '#27C5C1' }}>{emp.fullName?.charAt(0)}</div>
                        <span>{emp.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: '#27C5C1', fontFamily: 'monospace', fontSize: '0.8rem' }}>{emp.employeeId}</td>
                    <td style={{ color: 'rgba(255,255,255,0.65)' }}>{emp.category}</td>
                    <td><StatusBadge status={emp.currentStatus} size="sm" /></td>
                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{emp.currentStatus === 'At Sea' ? 'Active Trip' : emp.currentStatus === 'On Leave' ? 'On Leave' : 'Shore Duty'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
