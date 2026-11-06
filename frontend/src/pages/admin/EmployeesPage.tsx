import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Eye, Trash2, Phone, Mail } from 'lucide-react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import {
  getEmployees, createEmployee, updateEmployee, deactivateEmployee,
  populateEmployee, getUsers
} from '../../lib/store';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = ['Boat Captain', 'Boat Operator', 'Fisherman', 'Crew Member', 'Mechanic', 'Harbour Assistant', 'Security Staff', 'Other'];
const STATUSES = ['Available on Shore', 'At Sea', 'On Leave', 'Absent', 'Off Duty'];

const emptyForm = {
  fullName: '', phone: '', email: '', address: '', jobRole: '', category: 'Crew Member',
  joiningDate: '', salary: '', emergencyContact: { name: '', phone: '', relation: '' },
  assignedManager: '', employmentStatus: 'Active', currentStatus: 'Available on Shore'
};

const EmployeesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = () => {
    const filter: any = {};
    if (search) filter.search = search;
    if (filterCat) filter.category = filterCat;
    if (filterStatus) filter.status = filterStatus;
    if (user?.role === 'manager') filter.manager = user._id;
    setEmployees(getEmployees(filter).map(e => populateEmployee(e._id)).filter(Boolean) as any[]);
  };

  useEffect(() => { fetchEmployees(); }, [search, filterCat, filterStatus]);

  useEffect(() => {
    setManagers(getUsers().filter(u => u.role === 'manager' && u.isActive));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      if (isEdit) {
        updateEmployee(selectedEmp._id, form);
        toast.success('Employee updated');
      } else {
        createEmployee(form);
        toast.success('Employee added');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Error saving employee');
    } finally { setLoading(false); }
  };

  const handleDeactivate = (id: string) => {
    if (!confirm('Deactivate this employee?')) return;
    deactivateEmployee(id);
    toast.success('Employee deactivated');
    fetchEmployees();
  };

  const openAdd = () => { setIsEdit(false); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (emp: any) => {
    setIsEdit(true); setSelectedEmp(emp);
    setForm({
      fullName: emp.fullName || '', phone: emp.phone || '', email: emp.email || '',
      address: emp.address || '', jobRole: emp.jobRole || '', category: emp.category || 'Crew Member',
      joiningDate: emp.joiningDate ? emp.joiningDate.substring(0, 10) : '',
      salary: emp.salary || '', emergencyContact: emp.emergencyContact || { name: '', phone: '', relation: '' },
      assignedManager: emp.assignedManager?._id || '', employmentStatus: emp.employmentStatus || 'Active',
      currentStatus: emp.currentStatus || 'Available on Shore'
    });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Employee Management</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{employees.length} employees</p>
          </div>
          {user?.role === 'admin' && (
            <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Employee</button>
          )}
        </div>

        <div className="glass-card p-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={15} style={{ color: '#27C5C1', flexShrink: 0 }} />
            <input className="form-input" placeholder="Search by name, ID..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', padding: '6px 0' }} />
          </div>
          <select className="form-input w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>Employee</th><th>ID</th><th>Category</th><th>Job Role</th><th>Contact</th><th>Status</th><th>Manager</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{ background: 'linear-gradient(135deg, rgba(39,197,193,0.3), rgba(54,185,155,0.3))', color: '#27C5C1' }}>
                          {emp.fullName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{emp.fullName}</div>
                          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {emp.joiningDate ? `Joined ${format(new Date(emp.joiningDate), 'MMM yyyy')}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#27C5C1', fontFamily: 'monospace', fontSize: '0.8rem' }}>{emp.employeeId}</td>
                    <td>{emp.category}</td>
                    <td style={{ color: 'rgba(255,255,255,0.65)' }}>{emp.jobRole}</td>
                    <td>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.55)' }}><Phone size={10} /> {emp.phone}</div>
                        {emp.email && <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.55)' }}><Mail size={10} /> {emp.email}</div>}
                      </div>
                    </td>
                    <td><StatusBadge status={emp.currentStatus} size="sm" /></td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{emp.assignedManager?.name || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button className="btn-icon" onClick={() => { setSelectedEmp(emp); setViewModal(true); }}><Eye size={14} /></button>
                        {user?.role === 'admin' && (
                          <>
                            <button className="btn-icon" onClick={() => openEdit(emp)}><Edit size={14} /></button>
                            <button className="btn-icon" style={{ color: 'rgba(239,68,68,0.7)' }} onClick={() => handleDeactivate(emp._id)}><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10" style={{ color: 'rgba(255,255,255,0.4)' }}>No employees found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEdit ? 'Edit Employee' : 'Add New Employee'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Full Name *</label><input className="form-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required /></div>
            <div><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
            <div><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="form-label">Job Role</label><input className="form-input" value={form.jobRole} onChange={e => setForm({ ...form, jobRole: e.target.value })} /></div>
            <div>
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="form-label">Joining Date *</label><input className="form-input" type="date" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} required /></div>
            <div><label className="form-label">Salary (Admin only)</label><input className="form-input" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
            <div>
              <label className="form-label">Assigned Manager</label>
              <select className="form-input" value={form.assignedManager} onChange={e => setForm({ ...form, assignedManager: e.target.value })}>
                <option value="">None</option>
                {managers.map((m: any) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Current Status</label>
              <select className="form-input" value={form.currentStatus} onChange={e => setForm({ ...form, currentStatus: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Employment Status</label>
              <select className="form-input" value={form.employmentStatus} onChange={e => setForm({ ...form, employmentStatus: e.target.value })}>
                {['Active', 'Inactive', 'On Leave', 'Terminated'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><label className="form-label">Address</label><textarea className="form-input" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div className="pt-2 border-t border-white/10">
            <label className="form-label">Emergency Contact</label>
            <div className="grid grid-cols-3 gap-3">
              <input className="form-input" placeholder="Name" value={form.emergencyContact?.name || ''} onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })} />
              <input className="form-input" placeholder="Phone" value={form.emergencyContact?.phone || ''} onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })} />
              <input className="form-input" placeholder="Relation" value={form.emergencyContact?.relation || ''} onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Add Employee'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Employee Profile" size="md">
        {selectedEmp && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: 'linear-gradient(135deg, rgba(39,197,193,0.3), rgba(54,185,155,0.3))', color: '#27C5C1' }}>{selectedEmp.fullName?.charAt(0)}</div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedEmp.fullName}</h3>
                <p style={{ color: '#27C5C1' }}>{selectedEmp.employeeId}</p>
                <StatusBadge status={selectedEmp.currentStatus} size="sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Category', selectedEmp.category], ['Job Role', selectedEmp.jobRole || '—'], ['Phone', selectedEmp.phone], ['Email', selectedEmp.email || '—'], ['Employment', selectedEmp.employmentStatus], ['Manager', selectedEmp.assignedManager?.name || '—'], ['Joined', selectedEmp.joiningDate ? format(new Date(selectedEmp.joiningDate), 'MMM d, yyyy') : '—'], ['Address', selectedEmp.address || '—']].map(([label, value]) => (
                <div key={label as string} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                  <div className="text-sm text-white">{value}</div>
                </div>
              ))}
            </div>
            {selectedEmp.emergencyContact?.name && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,135,94,0.08)', border: '1px solid rgba(255,135,94,0.15)' }}>
                <div className="text-xs mb-1" style={{ color: '#FF875E' }}>Emergency Contact</div>
                <div className="text-sm text-white">{selectedEmp.emergencyContact.name} ({selectedEmp.emergencyContact.relation}) — {selectedEmp.emergencyContact.phone}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default EmployeesPage;
