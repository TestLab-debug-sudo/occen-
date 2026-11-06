import React, { useEffect, useState } from 'react';
import { Settings, Building2, Clock, Save, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { getSettings, updateSettings } from '../../lib/store';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    companyName: 'Marine Operations Co.',
    address: '',
    phone: '',
    email: '',
    website: '',
    workingHours: { start: '08:00', end: '17:00' },
    lateArrivalThreshold: 30,
    weeklyOffDays: ['Sunday'] as string[],
    leaveQuotas: { casual: 12, sick: 10, annual: 20, emergency: 5 },
    harbours: [] as { name: string; location: string }[],
  });
  const [newHarbour, setNewHarbour] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = getSettings();
    if (saved && Object.keys(saved).length) {
      setSettings(prev => ({ ...prev, ...saved }));
    }
  }, []);

  const handleSave = () => {
    setLoading(true);
    try {
      updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const addHarbour = () => {
    if (!newHarbour.name.trim()) { toast.error('Harbour name is required'); return; }
    setSettings(prev => ({ ...prev, harbours: [...prev.harbours, { ...newHarbour }] }));
    setNewHarbour({ name: '', location: '' });
  };

  const removeHarbour = (idx: number) => {
    setSettings(prev => ({ ...prev, harbours: prev.harbours.filter((_, i) => i !== idx) }));
  };

  const toggleOffDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      weeklyOffDays: prev.weeklyOffDays.includes(day)
        ? prev.weeklyOffDays.filter(d => d !== day)
        : [...prev.weeklyOffDays, day],
    }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings size={24} style={{ color: '#27C5C1' }} /> Company Settings
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Configure your marine company settings</p>
          </div>
          <button onClick={handleSave} disabled={loading} className="btn-primary">
            <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Info */}
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Building2 size={16} style={{ color: '#27C5C1' }} /> Company Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Company Name</label>
                <input className="form-input" value={settings.companyName} onChange={e => setSettings({ ...settings, companyName: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Address</label>
                <textarea className="form-input" rows={2} value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Website</label>
                <input className="form-input" value={settings.website} onChange={e => setSettings({ ...settings, website: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Work Hours & Leave Quotas */}
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock size={16} style={{ color: '#27C5C1' }} /> Working Hours & Leave
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Work Start</label>
                  <input type="time" className="form-input" value={settings.workingHours.start} onChange={e => setSettings({ ...settings, workingHours: { ...settings.workingHours, start: e.target.value } })} />
                </div>
                <div>
                  <label className="form-label">Work End</label>
                  <input type="time" className="form-input" value={settings.workingHours.end} onChange={e => setSettings({ ...settings, workingHours: { ...settings.workingHours, end: e.target.value } })} />
                </div>
              </div>
              <div>
                <label className="form-label">Late Arrival Threshold (minutes)</label>
                <input type="number" className="form-input" value={settings.lateArrivalThreshold} onChange={e => setSettings({ ...settings, lateArrivalThreshold: +e.target.value })} />
              </div>
              <div>
                <label className="form-label">Weekly Off Days</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleOffDay(day)}
                      className="px-3 py-1 rounded-lg text-xs transition-all"
                      style={{
                        background: settings.weeklyOffDays.includes(day) ? 'rgba(39,197,193,0.2)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${settings.weeklyOffDays.includes(day) ? 'rgba(39,197,193,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: settings.weeklyOffDays.includes(day) ? '#27C5C1' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Leave Quotas (days/year)</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['casual', 'sick', 'annual', 'emergency'] as const).map(type => (
                    <div key={type}>
                      <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{type}</label>
                      <input type="number" className="form-input" value={settings.leaveQuotas[type]} onChange={e => setSettings({ ...settings, leaveQuotas: { ...settings.leaveQuotas, [type]: +e.target.value } })} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Harbours */}
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Harbour Locations</h3>
            <div className="flex gap-3 mb-4 flex-wrap">
              <input
                className="form-input flex-1"
                placeholder="Harbour Name (e.g. Port Klang Main)"
                value={newHarbour.name}
                onChange={e => setNewHarbour({ ...newHarbour, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addHarbour()}
              />
              <input
                className="form-input flex-1"
                placeholder="Location / Coordinates (e.g. 3.0056° N, 101.3998° E)"
                value={newHarbour.location}
                onChange={e => setNewHarbour({ ...newHarbour, location: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addHarbour()}
              />
              <button onClick={addHarbour} className="btn-primary flex-shrink-0">Add Harbour</button>
            </div>
            {settings.harbours.length === 0 && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No harbours configured yet. Add your first harbour location above.</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {settings.harbours.map((h, i) => (
                <div key={i} className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div className="text-sm font-medium text-white">{h.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{h.location || 'No coordinates'}</div>
                  </div>
                  <button onClick={() => removeHarbour(i)} className="p-1 rounded" style={{ color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
