import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Eye, Compass } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { getTrips, createTrip, updateTrip, updateTripStatus, populateTrip, getBoats, getEmployees } from '../../lib/store';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TRIP_STATUSES = ['Scheduled', 'Crew Assigned', 'Preparing', 'Departed', 'At Sea', 'Returning', 'Arrived', 'Completed', 'Cancelled', 'Delayed'];
const emptyForm = { boat: '', captain: '', crew: [] as string[], departureHarbour: '', destination: '', departureDate: '', expectedReturnDate: '', managerRemarks: '' };

const TripsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [boats, setBoats] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');

  const fetchTrips = () => {
    const raw = getTrips(filterStatus ? { status: filterStatus } : {});
    setTrips(raw.map(t => populateTrip(t._id)).filter(Boolean) as any[]);
  };

  useEffect(() => { fetchTrips(); }, [filterStatus]);
  useEffect(() => {
    setBoats(getBoats());
    setEmployees(getEmployees());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      if (isEdit) { updateTrip(selected._id, form); toast.success('Trip updated'); }
      else { createTrip(form, user?._id || 'admin1'); toast.success('Trip created'); }
      setShowModal(false); fetchTrips();
    } catch (err: any) { toast.error(err.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = () => {
    try {
      updateTripStatus(selected._id, newStatus, statusRemarks, user?._id || 'admin1');
      toast.success(`Status updated to ${newStatus}`);
      setStatusModal(false);
      fetchTrips();
    } catch (err: any) { toast.error(err.message || 'Error'); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Sea Trip Management</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{trips.length} trips</p>
          </div>
          <button onClick={() => { setIsEdit(false); setForm({ ...emptyForm }); setShowModal(true); }} className="btn-primary"><Plus size={16} /> Schedule Trip</button>
        </div>

        <div className="glass-card p-4 flex gap-3">
          <select className="form-input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {TRIP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {trips.map((trip) => (
            <motion.div key={trip._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(39,197,193,0.15)' }}><Compass size={18} style={{ color: '#27C5C1' }} /></div>
                  <div>
                    <h3 className="font-semibold text-white">{trip.boat?.boatName}</h3>
                    <p className="text-xs" style={{ color: '#27C5C1' }}>{trip.tripId}</p>
                  </div>
                </div>
                <StatusBadge status={trip.status} size="sm" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                {[['Captain', trip.captain?.fullName], ['Crew', `${trip.crew?.length || 0} members`], ['From', trip.departureHarbour], ['To', trip.destination], ['Depart', trip.departureDate ? format(new Date(trip.departureDate), 'MMM d, HH:mm') : '—'], ['Return', trip.expectedReturnDate ? format(new Date(trip.expectedReturnDate), 'MMM d') : 'TBD']].map(([k, v]) => (
                  <div key={k as string}><span style={{ color: 'rgba(255,255,255,0.45)' }}>{k}: </span><span className="text-white">{v}</span></div>
                ))}
              </div>
              <div className="flex gap-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button className="btn-icon" onClick={() => { setSelected(populateTrip(trip._id)); setViewModal(true); }}><Eye size={14} /></button>
                <button className="btn-icon" onClick={() => { setIsEdit(true); setSelected(trip); setForm({ ...emptyForm, ...trip, boat: trip.boat?._id, captain: trip.captain?._id, crew: trip.crew?.map((c: any) => c._id) || [] }); setShowModal(true); }}><Edit size={14} /></button>
                <button className="btn-secondary btn-sm ml-auto" onClick={() => { setSelected(trip); setNewStatus(trip.status); setStatusRemarks(''); setStatusModal(true); }}>Update Status</button>
              </div>
            </motion.div>
          ))}
          {trips.length === 0 && <div className="col-span-2 text-center py-12" style={{ color: 'rgba(255,255,255,0.4)' }}>No trips found</div>}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEdit ? 'Edit Trip' : 'Schedule Sea Trip'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Boat *</label><select className="form-input" value={form.boat} onChange={e => setForm({ ...form, boat: e.target.value })} required><option value="">Select Boat</option>{boats.map((b: any) => <option key={b._id} value={b._id}>{b.boatName}</option>)}</select></div>
            <div><label className="form-label">Captain *</label><select className="form-input" value={form.captain} onChange={e => setForm({ ...form, captain: e.target.value })} required><option value="">Select Captain</option>{employees.filter(e => e.category === 'Boat Captain').map((e: any) => <option key={e._id} value={e._id}>{e.fullName}</option>)}</select></div>
            <div><label className="form-label">Departure Harbour *</label><input className="form-input" value={form.departureHarbour} onChange={e => setForm({ ...form, departureHarbour: e.target.value })} required /></div>
            <div><label className="form-label">Destination *</label><input className="form-input" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required /></div>
            <div><label className="form-label">Departure Date *</label><input className="form-input" type="datetime-local" value={form.departureDate} onChange={e => setForm({ ...form, departureDate: e.target.value })} required /></div>
            <div><label className="form-label">Expected Return</label><input className="form-input" type="datetime-local" value={form.expectedReturnDate} onChange={e => setForm({ ...form, expectedReturnDate: e.target.value })} /></div>
          </div>
          <div>
            <label className="form-label">Assign Crew Members</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {employees.map((e: any) => (
                <label key={e._id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                  <input type="checkbox" checked={(form.crew || []).includes(e._id)} onChange={ev => {
                    if (ev.target.checked) setForm({ ...form, crew: [...(form.crew || []), e._id] });
                    else setForm({ ...form, crew: (form.crew || []).filter((id: string) => id !== e._id) });
                  }} className="accent-teal-400" />
                  <span className="text-sm text-white">{e.fullName}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{e.category}</span>
                </label>
              ))}
            </div>
          </div>
          <div><label className="form-label">Remarks</label><textarea className="form-input" rows={2} value={form.managerRemarks} onChange={e => setForm({ ...form, managerRemarks: e.target.value })} /></div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : isEdit ? 'Update Trip' : 'Create Trip'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Trip Status" size="sm">
        <div className="space-y-4">
          <div><label className="form-label">New Status</label><select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>{TRIP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label className="form-label">Remarks</label><textarea className="form-input" rows={2} value={statusRemarks} onChange={e => setStatusRemarks(e.target.value)} placeholder="Optional..." /></div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>⚠ Departing or Arriving will update boat & crew status automatically.</p>
          <div className="flex gap-3"><button onClick={handleStatusUpdate} className="btn-primary">Update Status</button><button onClick={() => setStatusModal(false)} className="btn-secondary">Cancel</button></div>
        </div>
      </Modal>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Trip Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><h3 className="text-xl font-bold text-white">{selected.boat?.boatName}</h3><p style={{ color: '#27C5C1' }}>{selected.tripId}</p></div><StatusBadge status={selected.status} /></div>
            <div className="grid grid-cols-2 gap-3">
              {[['Captain', selected.captain?.fullName], ['Crew', `${selected.crew?.length || 0} members`], ['From', selected.departureHarbour], ['To', selected.destination], ['Departed', selected.departureDate ? format(new Date(selected.departureDate), 'MMM d, HH:mm') : '—'], ['Expected Return', selected.expectedReturnDate ? format(new Date(selected.expectedReturnDate), 'MMM d') : 'TBD']].map(([l, v]) => (
                <div key={l as string} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}><div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</div><div className="text-sm text-white">{v}</div></div>
              ))}
            </div>
            {selected.crew?.length > 0 && (
              <div><label className="form-label">Crew Members</label>
                <div className="flex flex-wrap gap-2">{selected.crew.map((c: any, i: number) => <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(39,197,193,0.15)', color: '#27C5C1' }}>{c.fullName}</span>)}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default TripsPage;
