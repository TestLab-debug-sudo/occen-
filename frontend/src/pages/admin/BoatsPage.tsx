import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Eye, Ship } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { getBoats, createBoat, updateBoat, populateBoat, getEmployees } from '../../lib/store';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const BOAT_TYPES = ['Fishing Boat', 'Speed Boat', 'Trawler', 'Yacht', 'Cargo Boat', 'Patrol Boat', 'Other'];
const BOAT_STATUSES = ['Docked at Harbour', 'Preparing for Departure', 'Departed', 'Currently at Sea', 'Returning to Harbour', 'Arrived at Harbour', 'Under Maintenance', 'Out of Service'];

const emptyForm = { boatName: '', registrationNumber: '', boatType: 'Fishing Boat', capacity: 10, harbourName: '', captain: '', status: 'Docked at Harbour', maintenanceStatus: 'Good', notes: '' };

const BoatsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [boats, setBoats] = useState<any[]>([]);
  const [captains, setCaptains] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchBoats = () => setBoats(getBoats({ search }).map(b => populateBoat(b._id)).filter(Boolean) as any[]);

  useEffect(() => { fetchBoats(); }, [search]);
  useEffect(() => { setCaptains(getEmployees({ category: 'Boat Captain' })); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      if (isEdit) { updateBoat(selected._id, form); toast.success('Boat updated'); }
      else { createBoat(form); toast.success('Boat added'); }
      setShowModal(false); fetchBoats();
    } catch (err: any) { toast.error(err.message || 'Error'); }
    finally { setLoading(false); }
  };

  const openEdit = (b: any) => {
    setIsEdit(true); setSelected(b);
    setForm({ boatName: b.boatName, registrationNumber: b.registrationNumber, boatType: b.boatType, capacity: b.capacity, harbourName: b.harbourName, captain: b.captain?._id || b.captain || '', status: b.status, maintenanceStatus: b.maintenanceStatus, notes: b.notes || '' });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Boat Management</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{boats.length} vessels</p>
          </div>
          {user?.role === 'admin' && <button onClick={() => { setIsEdit(false); setForm({ ...emptyForm }); setShowModal(true); }} className="btn-primary"><Plus size={16} /> Add Boat</button>}
        </div>

        <div className="glass-card p-4 flex gap-3">
          <div className="flex items-center gap-2 flex-1"><Search size={15} style={{ color: '#27C5C1' }} />
            <input className="form-input" placeholder="Search boats..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', padding: '6px 0' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {boats.map((boat) => (
            <motion.div key={boat._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: boat.status === 'Currently at Sea' ? '#27C5C1' : boat.status === 'Under Maintenance' ? '#FF875E' : '#36B99B' }} />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(39,197,193,0.15)', border: '1px solid rgba(39,197,193,0.2)' }}>
                    <Ship size={20} style={{ color: '#27C5C1' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{boat.boatName}</h3>
                    <p className="text-xs" style={{ color: '#27C5C1' }}>{boat.boatId}</p>
                  </div>
                </div>
                <StatusBadge status={boat.status} size="sm" />
              </div>
              <div className="space-y-2 text-sm">
                {[['Reg. No.', boat.registrationNumber], ['Type', boat.boatType], ['Capacity', `${boat.crewMembers?.length || 0}/${boat.capacity}`], ['Captain', boat.captain?.fullName || '—'], ['Harbour', boat.harbourName]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{k}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button className="btn-icon" onClick={() => { setSelected(boat); setViewModal(true); }}><Eye size={14} /></button>
                {user?.role === 'admin' && <button className="btn-icon" onClick={() => openEdit(boat)}><Edit size={14} /></button>}
                <select className="form-input text-xs ml-auto" style={{ width: 'auto', padding: '4px 8px' }}
                  value={boat.status} onChange={e => { updateBoat(boat._id, { status: e.target.value }); fetchBoats(); }}>
                  {BOAT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEdit ? 'Edit Boat' : 'Add New Boat'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Boat Name *</label><input className="form-input" value={form.boatName} onChange={e => setForm({ ...form, boatName: e.target.value })} required /></div>
            <div><label className="form-label">Reg. Number *</label><input className="form-input" value={form.registrationNumber} onChange={e => setForm({ ...form, registrationNumber: e.target.value })} required /></div>
            <div><label className="form-label">Type</label><select className="form-input" value={form.boatType} onChange={e => setForm({ ...form, boatType: e.target.value })}>{BOAT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="form-label">Capacity</label><input className="form-input" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} /></div>
            <div><label className="form-label">Harbour Name</label><input className="form-input" value={form.harbourName} onChange={e => setForm({ ...form, harbourName: e.target.value })} /></div>
            <div><label className="form-label">Captain</label><select className="form-input" value={form.captain} onChange={e => setForm({ ...form, captain: e.target.value })}><option value="">Select Captain</option>{captains.map((e: any) => <option key={e._id} value={e._id}>{e.fullName}</option>)}</select></div>
            <div><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{BOAT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="form-label">Maintenance</label><select className="form-input" value={form.maintenanceStatus} onChange={e => setForm({ ...form, maintenanceStatus: e.target.value })}>{['Good', 'Needs Service', 'Under Maintenance', 'Overdue'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div><label className="form-label">Notes</label><textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex gap-3"><button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : isEdit ? 'Update' : 'Add Boat'}</button><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button></div>
        </form>
      </Modal>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Boat Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(39,197,193,0.2)' }}><Ship size={28} style={{ color: '#27C5C1' }} /></div>
              <div><h3 className="text-xl font-bold text-white">{selected.boatName}</h3><p style={{ color: '#27C5C1' }}>{selected.boatId} • {selected.registrationNumber}</p><StatusBadge status={selected.status} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Type', selected.boatType], ['Capacity', selected.capacity], ['Harbour', selected.harbourName], ['Captain', selected.captain?.fullName || '—'], ['Crew', selected.crewMembers?.length || 0], ['Maintenance', selected.maintenanceStatus]].map(([l, v]) => (
                <div key={l as string} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}><div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</div><div className="text-sm text-white">{String(v)}</div></div>
              ))}
            </div>
            {selected.notes && <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}><div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Notes</div><div className="text-sm text-white">{selected.notes}</div></div>}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default BoatsPage;
