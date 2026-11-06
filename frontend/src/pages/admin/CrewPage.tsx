import React, { useEffect, useState } from 'react';
import { UserCheck, Waves, Ship } from 'lucide-react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { getEmployees, getTrips, updateTrip, populateTrip } from '../../lib/store';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const CrewPage: React.FC = () => {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string>('');
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);

  const refresh = () => {
    setEmployees(getEmployees());
    setTrips(getTrips().map(t => populateTrip(t._id)).filter(Boolean) as any[]);
  };

  useEffect(() => { refresh(); }, []);

  const available = employees.filter(e => e.currentStatus === 'Available on Shore');
  const atSea = employees.filter(e => e.currentStatus === 'At Sea');
  const onLeave = employees.filter(e => e.currentStatus === 'On Leave');

  const handleAssignCrew = () => {
    if (!selectedTrip) { toast.error('Select a trip first'); return; }
    if (selectedCrew.length === 0) { toast.error('Select at least one crew member'); return; }
    const trip = getTrips().find(t => t._id === selectedTrip);
    const existing = trip?.crew || [];
    updateTrip(selectedTrip, { crew: [...existing, ...selectedCrew], status: 'Crew Assigned' });
    toast.success('Crew assigned successfully');
    setSelectedCrew([]);
    refresh();
  };

  const toggleCrew = (id: string) => setSelectedCrew(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const EmpCard = ({ emp, selectable }: { emp: any; selectable?: boolean }) => {
    const sel = selectedCrew.includes(emp._id);
    return (
      <div onClick={selectable ? () => toggleCrew(emp._id) : undefined} className="flex items-center gap-3 p-3 rounded-xl transition-all"
        style={{ background: sel ? 'rgba(39,197,193,0.15)' : 'rgba(255,255,255,0.04)', border: sel ? '1px solid rgba(39,197,193,0.4)' : '1px solid rgba(255,255,255,0.06)', cursor: selectable ? 'pointer' : 'default' }}>
        {selectable && <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: sel ? '#27C5C1' : 'rgba(255,255,255,0.1)', border: sel ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
          {sel && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
        </div>}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(39,197,193,0.2)', color: '#27C5C1' }}>{emp.fullName?.charAt(0)}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{emp.fullName}</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{emp.category} • {emp.employeeId}</div>
        </div>
        <StatusBadge status={emp.currentStatus} size="sm" />
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Crew Management</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Assign crew members to sea trips</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center" style={{ borderTop: '3px solid #36B99B' }}><div className="text-3xl font-bold" style={{ color: '#36B99B' }}>{available.length}</div><div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Available on Shore</div></div>
          <div className="glass-card p-4 text-center" style={{ borderTop: '3px solid #27C5C1' }}><div className="text-3xl font-bold" style={{ color: '#27C5C1' }}>{atSea.length}</div><div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Currently at Sea</div></div>
          <div className="glass-card p-4 text-center" style={{ borderTop: '3px solid #fbbf24' }}><div className="text-3xl font-bold" style={{ color: '#fbbf24' }}>{onLeave.length}</div><div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>On Leave</div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><UserCheck size={16} style={{ color: '#27C5C1' }} /> Assign Crew to Trip</h3>
            <div className="mb-4">
              <label className="form-label">Select Trip</label>
              <select className="form-input" value={selectedTrip} onChange={e => setSelectedTrip(e.target.value)}>
                <option value="">Select a scheduled trip</option>
                {trips.filter(t => ['Scheduled', 'Crew Assigned'].includes(t.status)).map((t: any) => (
                  <option key={t._id} value={t._id}>{t.boat?.boatName} → {t.destination} ({t.status})</option>
                ))}
              </select>
            </div>
            <label className="form-label mb-3">Select Available Crew ({selectedCrew.length} selected)</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {available.length === 0 ? <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.4)' }}>No employees available on shore</p>
                : available.map(emp => <EmpCard key={emp._id} emp={emp} selectable />)}
            </div>
            {selectedCrew.length > 0 && (
              <button onClick={handleAssignCrew} className="btn-primary w-full justify-center mt-4">
                <UserCheck size={16} /> Assign {selectedCrew.length} to Trip
              </button>
            )}
          </div>

          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Waves size={16} style={{ color: '#27C5C1' }} /> Active Trip Crews</h3>
            <div className="space-y-4">
              {trips.filter(t => ['At Sea', 'Departed', 'Returning'].includes(t.status)).map((trip: any) => (
                <div key={trip._id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div><h4 className="font-medium text-white">{trip.boat?.boatName}</h4><p className="text-xs" style={{ color: '#27C5C1' }}>{trip.tripId} → {trip.destination}</p></div>
                    <StatusBadge status={trip.status} size="sm" />
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}><Ship size={10} style={{ display: 'inline', color: '#27C5C1' }} /> Captain: {trip.captain?.fullName}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {trip.crew?.map((c: any, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(39,197,193,0.1)', color: '#27C5C1', border: '1px solid rgba(39,197,193,0.2)' }}>{c.fullName}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4">All Crew — Current Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {employees.map(emp => <EmpCard key={emp._id} emp={emp} />)}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CrewPage;
