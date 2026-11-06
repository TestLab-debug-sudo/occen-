import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor, ArrowRight } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { getTrips, populateTrip, updateTripStatus } from '../../lib/store';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DepartureArrivalPage: React.FC = () => {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [actionModal, setActionModal] = useState<'depart' | 'arrive' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTrips = () => {
    const active = getTrips().filter((t: any) => !['Completed', 'Cancelled'].includes(t.status));
    setTrips(active.map((t: any) => populateTrip(t._id)).filter(Boolean));
  };

  useEffect(() => { loadTrips(); }, []);

  const handleAction = () => {
    if (!selected) return;
    setLoading(true);
    try {
      const newStatus = actionModal === 'depart' ? 'Departed' : 'Arrived';
      updateTripStatus(selected._id, newStatus, remarks, user!._id);
      toast.success(
        actionModal === 'depart'
          ? `Departure recorded — ${selected.boat?.boatName} is now At Sea`
          : `Arrival recorded — ${selected.boat?.boatName} has returned`
      );
      setActionModal(null);
      setSelected(null);
      setRemarks('');
      loadTrips();
    } catch (err: any) {
      toast.error(err.message || 'Error recording action');
    } finally {
      setLoading(false);
    }
  };

  const departable = trips.filter((t: any) => ['Scheduled', 'Crew Assigned', 'Preparing'].includes(t.status));
  const atSea = trips.filter((t: any) => ['Departed', 'At Sea', 'Returning'].includes(t.status));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Departure & Arrival Management</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Record boat departures and arrivals — all changes update boat and crew status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ready to Depart */}
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <ArrowRight size={16} style={{ color: '#27C5C1' }} />
              Ready for Departure ({departable.length})
            </h3>
            <div className="space-y-3">
              {departable.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.4)' }}>No trips ready for departure</p>
              )}
              {departable.map((trip: any) => (
                <div key={trip._id} className="p-4 rounded-xl" style={{ background: 'rgba(39,197,193,0.08)', border: '1px solid rgba(39,197,193,0.15)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{trip.boat?.boatName}</h4>
                      <p className="text-xs" style={{ color: '#27C5C1' }}>{trip.tripId} → {trip.destination}</p>
                    </div>
                    <StatusBadge status={trip.status} size="sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <span>Capt: {trip.captain?.fullName || '—'}</span>
                    <span>Crew: {trip.crew?.length || 0} members</span>
                    <span>From: {trip.departureHarbour}</span>
                    <span>Dep: {trip.departureDate ? format(new Date(trip.departureDate), 'MMM d, HH:mm') : 'TBD'}</span>
                  </div>
                  <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Crew: {trip.crew?.length ? trip.crew.map((c: any) => c.fullName).join(', ') : 'Not assigned'}
                  </div>
                  <button
                    className="btn-primary btn-sm w-full justify-center"
                    onClick={() => { setSelected(trip); setRemarks(''); setActionModal('depart'); }}
                  >
                    <ArrowRight size={14} /> Confirm Departure
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* At Sea — Record Arrival */}
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Anchor size={16} style={{ color: '#36B99B' }} />
              Currently at Sea — Record Arrival ({atSea.length})
            </h3>
            <div className="space-y-3">
              {atSea.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.4)' }}>No active sea trips</p>
              )}
              {atSea.map((trip: any) => {
                const isOverdue = trip.expectedReturnDate && new Date(trip.expectedReturnDate) < new Date();
                return (
                  <div key={trip._id} className="p-4 rounded-xl" style={{ background: isOverdue ? 'rgba(255,135,94,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isOverdue ? 'rgba(255,135,94,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{trip.boat?.boatName}</h4>
                        <p className="text-xs" style={{ color: '#27C5C1' }}>{trip.tripId}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={trip.status} size="sm" />
                        {isOverdue && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,135,94,0.2)', color: '#FF875E' }}>OVERDUE</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <span>Capt: {trip.captain?.fullName || '—'}</span>
                      <span>Crew: {trip.crew?.length || 0}</span>
                      <span>To: {trip.destination}</span>
                      <span>Exp Return: {trip.expectedReturnDate ? format(new Date(trip.expectedReturnDate), 'MMM d') : 'TBD'}</span>
                    </div>
                    <button
                      className="btn-primary btn-sm w-full justify-center"
                      style={{ background: 'linear-gradient(135deg, #36B99B, #27C5C1)' }}
                      onClick={() => { setSelected(trip); setRemarks(''); setActionModal('arrive'); }}
                    >
                      <Anchor size={14} /> Record Arrival
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => { setActionModal(null); setSelected(null); }}
        title={actionModal === 'depart' ? 'Confirm Boat Departure' : 'Record Boat Arrival'}
        size="sm"
      >
        {selected && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{ background: actionModal === 'depart' ? 'rgba(39,197,193,0.1)' : 'rgba(54,185,155,0.1)', border: `1px solid ${actionModal === 'depart' ? 'rgba(39,197,193,0.2)' : 'rgba(54,185,155,0.2)'}` }}
            >
              <div className="flex items-center gap-3">
                {actionModal === 'depart' ? <ArrowRight size={20} style={{ color: '#27C5C1' }} /> : <Anchor size={20} style={{ color: '#36B99B' }} />}
                <div>
                  <h4 className="font-semibold text-white">{selected.boat?.boatName}</h4>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {actionModal === 'depart' ? `Departing to ${selected.destination}` : `Returning from ${selected.destination}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm space-y-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <p>Captain: {selected.captain?.fullName || '—'}</p>
              <p>Crew: {selected.crew?.length ? selected.crew.map((c: any) => c.fullName).join(', ') : 'None assigned'}</p>
            </div>
            <div>
              <label className="form-label">Remarks</label>
              <textarea className="form-input" rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional remarks..." />
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              ⚠ This will update boat status, crew availability, and attendance records.
            </p>
            <div className="flex gap-3">
              <button onClick={handleAction} disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? 'Processing...' : actionModal === 'depart' ? '✓ Confirm Departure' : '✓ Confirm Arrival'}
              </button>
              <button onClick={() => { setActionModal(null); setSelected(null); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default DepartureArrivalPage;
