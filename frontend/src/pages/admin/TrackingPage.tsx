import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, Clock, Ship } from 'lucide-react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { getBoats, populateBoat, getBoatLocations, addBoatLocation } from '../../lib/store';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEMO_LOCATIONS: Record<string, { lat: number; lng: number; name: string; type: string }> = {
  'b1': { lat: 3.8, lng: 103.5, name: 'South China Sea', type: 'demo' },
  'b2': { lat: 3.0, lng: 101.4, name: 'Port Klang', type: 'manual' },
  'b3': { lat: 5.4, lng: 100.3, name: 'Malacca Strait', type: 'demo' },
  'b4': { lat: 6.3, lng: 99.8, name: 'Langkawi Harbour', type: 'manual' },
  'b5': { lat: 3.1, lng: 101.5, name: 'Port Klang Yard', type: 'manual' },
};

const createBoatIcon = (status: string) => {
  const color = status === 'Currently at Sea' ? '#27C5C1' : status === 'Docked at Harbour' ? '#36B99B' : '#FF875E';
  return L.divIcon({
    html: `<div style="width:32px;height:32px;background:${color};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.39 0 2.78-.47 4-1.32 2.44 1.71 5.56 1.71 8 0 1.22.85 2.61 1.32 4 1.32h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L19 10.62V6c0-1.1-.9-2-2-2h-3V1H10v3H7c-1.1 0-2 .9-2 2v4.62l-2.29.7c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19z"/></svg>
    </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const TrackingPage: React.FC = () => {
  const { user } = useAuthStore();
  const [boats, setBoats] = useState<any[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({ locationName: '', latitude: '', longitude: '' });
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const loadBoats = () => {
    const raw = getBoats();
    const populated = raw.map(b => {
      const pop = populateBoat(b._id)!;
      const manualLocs = getBoatLocations(b._id);
      const lastManual = manualLocs[0];
      const demoLoc = DEMO_LOCATIONS[b._id];
      const lastLocation = lastManual
        ? { lat: lastManual.latitude, lng: lastManual.longitude, name: lastManual.locationName, type: lastManual.locationType }
        : demoLoc
        ? { ...demoLoc }
        : null;
      const lastUpdated = lastManual?.createdAt || null;
      return { ...pop, lastLocation, lastUpdated, hasManualLocation: !!lastManual };
    });
    setBoats(populated);
  };

  useEffect(() => {
    loadBoats();
  }, []);

  const handleUpdateLocation = () => {
    if (!selectedBoat || !updateForm.latitude || !updateForm.longitude) {
      toast.error('Please fill in all location fields');
      return;
    }
    addBoatLocation({
      boat: selectedBoat._id,
      latitude: parseFloat(updateForm.latitude),
      longitude: parseFloat(updateForm.longitude),
      locationName: updateForm.locationName || 'Manual Update',
      locationType: 'manual',
    }, user!._id);
    toast.success('Location updated successfully');
    setShowUpdateForm(false);
    setUpdateForm({ locationName: '', latitude: '', longitude: '' });
    loadBoats();
  };

  const mapBoats = boats.filter(b => b.lastLocation?.lat && b.lastLocation?.lng);
  const hasSimulatedData = boats.some(b => b.lastLocation?.type === 'demo');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Marine Tracking</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Boat locations & status monitoring</p>
          </div>
          {hasSimulatedData && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: 'rgba(255,135,94,0.2)', border: '1px solid rgba(255,135,94,0.4)', color: '#FF875E' }}>
              <AlertCircle size={13} />
              DEMO SIMULATION — Some positions are not real GPS data
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 glass-card overflow-hidden" style={{ height: '480px' }}>
            <MapContainer center={[4.5, 101.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              {mapBoats.map((boat) => (
                <Marker
                  key={boat._id}
                  position={[boat.lastLocation.lat, boat.lastLocation.lng]}
                  icon={createBoatIcon(boat.status)}
                  eventHandlers={{ click: () => setSelectedBoat(boat) }}
                >
                  <Popup>
                    <div style={{ color: '#063B5C', minWidth: '150px' }}>
                      <strong>{boat.boatName}</strong>
                      <br /><span style={{ fontSize: '0.75rem' }}>{boat.boatId}</span>
                      <br /><span style={{ fontSize: '0.8rem' }}>{boat.status}</span>
                      <br /><span style={{ fontSize: '0.75rem', color: '#666' }}>{boat.lastLocation.name}</span>
                      {boat.lastLocation.type === 'demo' && <><br /><span style={{ fontSize: '0.7rem', color: '#FF875E', fontWeight: 'bold' }}>⚠ DEMO SIMULATION</span></>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Boat List */}
          <div className="glass-card p-5 overflow-y-auto" style={{ maxHeight: '480px' }}>
            <h3 className="text-white font-semibold mb-4">Boat Positions</h3>
            <div className="space-y-3">
              {boats.map((boat) => (
                <div
                  key={boat._id}
                  onClick={() => setSelectedBoat(boat)}
                  className="p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: selectedBoat?._id === boat._id ? 'rgba(39,197,193,0.15)' : 'rgba(255,255,255,0.04)',
                    border: selectedBoat?._id === boat._id ? '1px solid rgba(39,197,193,0.4)' : '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white text-sm">{boat.boatName}</span>
                    <StatusBadge status={boat.status} size="sm" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <MapPin size={10} />
                      {boat.lastLocation?.name || 'Unknown'}
                    </div>
                    {boat.lastUpdated && (
                      <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <Clock size={10} />
                        Updated: {format(new Date(boat.lastUpdated), 'HH:mm, MMM d')}
                      </div>
                    )}
                    {boat.lastLocation?.type && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-xs" style={{
                          background: boat.lastLocation.type === 'gps' ? 'rgba(54,185,155,0.2)' : boat.lastLocation.type === 'demo' ? 'rgba(255,135,94,0.2)' : 'rgba(39,197,193,0.2)',
                          color: boat.lastLocation.type === 'gps' ? '#36B99B' : boat.lastLocation.type === 'demo' ? '#FF875E' : '#27C5C1'
                        }}>
                          {boat.lastLocation.type === 'gps' ? '🛰 GPS' : boat.lastLocation.type === 'demo' ? '⚠ DEMO' : '✏ MANUAL'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Boat Details */}
        {selectedBoat && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(39,197,193,0.15)' }}>
                  <Ship size={20} style={{ color: '#27C5C1' }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedBoat.boatName}</h3>
                  <p style={{ color: '#27C5C1' }}>{selectedBoat.boatId}</p>
                </div>
                <StatusBadge status={selectedBoat.status} />
              </div>
              <button className="btn-secondary btn-sm" onClick={() => setShowUpdateForm(!showUpdateForm)}>
                <Navigation size={14} /> Update Location
              </button>
            </div>

            {showUpdateForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="form-label">Location Name</label>
                    <input className="form-input" value={updateForm.locationName} onChange={e => setUpdateForm({ ...updateForm, locationName: e.target.value })} placeholder="e.g. Fishing Zone A" />
                  </div>
                  <div>
                    <label className="form-label">Latitude</label>
                    <input className="form-input" type="number" step="0.001" value={updateForm.latitude} onChange={e => setUpdateForm({ ...updateForm, latitude: e.target.value })} placeholder="e.g. 4.123" />
                  </div>
                  <div>
                    <label className="form-label">Longitude</label>
                    <input className="form-input" type="number" step="0.001" value={updateForm.longitude} onChange={e => setUpdateForm({ ...updateForm, longitude: e.target.value })} placeholder="e.g. 101.456" />
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <button onClick={handleUpdateLocation} className="btn-primary btn-sm">Save Location (Manual)</button>
                  <p className="text-xs self-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Saved as a manual location update</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                ['Captain', selectedBoat.captain?.fullName || '—'],
                ['Last Location', selectedBoat.lastLocation?.name || 'Unknown'],
                ['Location Type', selectedBoat.lastLocation?.type?.toUpperCase() || '—'],
                ['Last Updated', selectedBoat.lastUpdated ? format(new Date(selectedBoat.lastUpdated), 'HH:mm, MMM d') : 'Demo data'],
              ].map(([label, value]) => (
                <div key={label as string} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                  <div className="text-sm text-white">{value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default TrackingPage;
