import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, AlertCircle, Ship, Calendar, User } from 'lucide-react';
import Layout from '../../components/Layout';
import { getNotifications, markNotifRead, markAllNotifsRead } from '../../lib/store';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';

const typeIcons: Record<string, React.ReactNode> = {
  boat_departure: <Ship size={16} style={{ color: '#27C5C1' }} />,
  boat_arrival: <Ship size={16} style={{ color: '#36B99B' }} />,
  leave_request: <Calendar size={16} style={{ color: '#fbbf24' }} />,
  leave_approved: <Calendar size={16} style={{ color: '#36B99B' }} />,
  leave_rejected: <Calendar size={16} style={{ color: '#ef4444' }} />,
  employee_absent: <User size={16} style={{ color: '#ef4444' }} />,
  attendance_correction: <AlertCircle size={16} style={{ color: '#FF875E' }} />,
  trip_delayed: <AlertCircle size={16} style={{ color: '#FF875E' }} />,
  general: <Bell size={16} style={{ color: '#27C5C1' }} />,
};

const NotificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);

  const refresh = () => {
    if (user) setNotifications(getNotifications(user._id, user.role));
  };

  useEffect(() => { refresh(); }, []);

  const unread = notifications.filter(n => !n.readBy?.includes(user?._id)).length;

  const markRead = (id: string) => {
    if (user) { markNotifRead(id, user._id); refresh(); }
  };

  const markAll = () => {
    if (user) { markAllNotifsRead(user._id, user.role); refresh(); }
  };

  const isRead = (n: any) => n.readBy?.includes(user?._id);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              Notifications
              {unread > 0 && <span className="px-2.5 py-0.5 rounded-full text-sm font-bold" style={{ background: '#27C5C1', color: 'white' }}>{unread}</span>}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>System alerts and updates</p>
          </div>
          {unread > 0 && <button onClick={markAll} className="btn-secondary btn-sm"><CheckCheck size={14} /> Mark All Read</button>}
        </div>

        <div className="space-y-3">
          {notifications.map((notif) => {
            const read = isRead(notif);
            return (
              <motion.div key={notif._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="glass-card p-4 cursor-pointer transition-all"
                style={{ border: read ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(39,197,193,0.3)', background: read ? 'rgba(255,255,255,0.04)' : 'rgba(39,197,193,0.08)' }}
                onClick={() => !read && markRead(notif._id)}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    {typeIcons[notif.type] || typeIcons.general}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold" style={{ color: read ? 'rgba(255,255,255,0.7)' : 'white' }}>{notif.title}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                        {!read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#27C5C1' }} />}
                      </div>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{notif.message}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {notifications.length === 0 && (
            <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Bell size={40} className="mx-auto mb-3 opacity-40" /><p>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
