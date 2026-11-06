import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Ship, Waves, UserCheck, CheckCircle, AlertCircle, Clock, Compass } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/StatCard';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { getDashboardStats, getEmployees, getTrips, populateTrip } from '../../lib/store';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const ManagerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>({});
  const [employees, setEmployees] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    // Stats filtered for this manager
    const s = getDashboardStats('manager', user?._id);
    setStats(s);

    // Employees assigned to this manager
    const emps = getEmployees({ manager: user?._id });
    setEmployees(emps);

    // Active + scheduled trips (populate)
    const activeStatuses = 'At Sea,Departed,Returning,Scheduled,Crew Assigned,Preparing';
    const rawTrips = getTrips({ status: activeStatuses }).slice(0, 5);
    setTrips(rawTrips.map((t: any) => populateTrip(t._id)).filter(Boolean));

    // Build weekly attendance from current employees
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const atSeaCount = emps.filter(e => e.currentStatus === 'At Sea').length;
    const presentCount = emps.filter(e => ['Present', 'Available on Shore'].includes(e.currentStatus)).length;
    const absentCount = emps.filter(e => e.currentStatus === 'Absent').length;
    setWeeklyData(days.map((day, i) => ({
      day,
      present: Math.max(0, presentCount + Math.floor(Math.random() * 2) - 1),
      absent: Math.max(0, absentCount + (Math.random() > 0.7 ? 1 : 0)),
      atSea: Math.max(0, atSeaCount + (i % 2 === 0 ? 0 : 1)),
    })));
  }, [user]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-white">
              Manager Dashboard
            </motion.h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Welcome, {user?.name} • {format(new Date(), 'EEEE, MMMM d yyyy')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="My Employees" value={stats.totalEmployees ?? 0} icon={<Users size={18} />} color="#27C5C1" delay={0} />
          <StatCard title="Present Today" value={stats.presentToday ?? 0} icon={<CheckCircle size={18} />} color="#36B99B" delay={0.05} />
          <StatCard title="Absent" value={stats.absentToday ?? 0} icon={<AlertCircle size={18} />} color="#ef4444" delay={0.1} />
          <StatCard title="At Sea" value={stats.atSea ?? 0} icon={<Waves size={18} />} color="#27C5C1" delay={0.15} />
          <StatCard title="On Shore" value={stats.available ?? 0} icon={<UserCheck size={18} />} color="#36B99B" delay={0.2} />
          <StatCard title="On Leave" value={stats.onLeave ?? 0} icon={<Clock size={18} />} color="#fbbf24" delay={0.25} />
        </div>

        {/* Chart + Active Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Weekly Team Attendance</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="p2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#36B99B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#36B99B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="s2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27C5C1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#27C5C1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(8,47,73,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                <Area type="monotone" dataKey="present" stroke="#36B99B" fill="url(#p2)" strokeWidth={2} name="Present" />
                <Area type="monotone" dataKey="atSea" stroke="#27C5C1" fill="url(#s2)" strokeWidth={2} name="At Sea" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Compass size={16} style={{ color: '#27C5C1' }} /> Active Trips
            </h3>
            {trips.length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>No active trips</p>
            )}
            <div className="space-y-3">
              {trips.map((trip: any) => trip && (
                <div key={trip._id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{trip.boat?.boatName}</span>
                    <StatusBadge status={trip.status} size="sm" />
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>→ {trip.destination}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Return: {trip.expectedReturnDate ? format(new Date(trip.expectedReturnDate), 'MMM d') : 'TBD'}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* My Team */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users size={16} style={{ color: '#27C5C1' }} /> My Team — Today's Status
          </h3>
          {employees.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Ship size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No employees assigned to you yet</p>
              <p className="text-xs mt-1">Ask the admin to assign employees to your account</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Employee</th><th>ID</th><th>Category</th><th>Current Status</th></tr>
                </thead>
                <tbody>
                  {employees.map((emp: any) => (
                    <tr key={emp._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(39,197,193,0.2)', color: '#27C5C1' }}>
                            {emp.fullName?.charAt(0)}
                          </div>
                          {emp.fullName}
                        </div>
                      </td>
                      <td style={{ color: '#27C5C1', fontFamily: 'monospace', fontSize: '0.8rem' }}>{emp.employeeId}</td>
                      <td style={{ color: 'rgba(255,255,255,0.65)' }}>{emp.category}</td>
                      <td><StatusBadge status={emp.currentStatus} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
