// ============================================================
// LOCAL DATA STORE — replaces MongoDB + Express backend
// All data persists in localStorage. No server required.
// ============================================================

// Bump this string whenever employee/boat/trip seed data changes.
// The app will auto-clear old localStorage and reload fresh seed data.
const SEED_VERSION = 'navlakhi-v5';

const KEYS = {
  users: 'marine_users',
  employees: 'marine_employees',
  boats: 'marine_boats',
  trips: 'marine_trips',
  attendance: 'marine_attendance',
  leaves: 'marine_leaves',
  notifications: 'marine_notifications',
  locations: 'marine_locations',
  settings: 'marine_settings',
  logs: 'marine_logs',
  corrections: 'marine_corrections',
  seedVersion: 'marine_seed_version',
};

// ── helpers ──────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();
const read = <T>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

// ── seed data ─────────────────────────────────────────────
const seedUsers = () => {
  if (read(KEYS.users, []).length) return;
  write(KEYS.users, [
    { _id: 'admin1', name: 'System Admin', email: 'admin@boatcompany.com', password: 'Admin@123456', role: 'admin', isActive: true, createdAt: now() },
    // CAPT.M.MADHUKAR RAO is the MANAGER — given a manager login
    { _id: 'mgr1', name: 'Capt. M. Madhukar Rao', email: 'manager@boatcompany.com', password: 'Manager@123456', role: 'manager', isActive: true, phone: '9553464475', createdAt: now() },
  ]);
};

// ── Excel data: NEW LEAVE PLANNER OCTOBER 2026 NEW.xlsx / Sheet1 ──
// Station: NAVLAKHI
// 1 MANAGER + 3 SUPERVISORS (named) + 2 SUPERVISOR rows + 7 OPERATORS
const seedEmployees = () => {
  if (read(KEYS.employees, []).length) return;
  const today = now();
  write(KEYS.employees, [
    // ── MANAGER ──
    {
      _id: 'e1', employeeId: 'EMP0001',
      fullName: 'Capt. M. Madhukar Rao',
      phone: '9553464475', email: 'madhukar.rao@navlakhi.com',
      jobRole: 'Manager', category: 'Boat Captain',
      joiningDate: '2026-04-16',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: 'NA',
      isActive: true, createdAt: today,
    },
    // ── SUPERVISORS ──
    {
      _id: 'e2', employeeId: 'EMP0002',
      fullName: 'Debashish Banerjee',
      phone: '9702201293', email: 'debashish.banerjee@navlakhi.com',
      jobRole: 'Supervisor', category: 'Crew Member',
      joiningDate: '2026-04-15',
      salary: 0,
      currentStatus: 'On Leave', employmentStatus: 'On Leave',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: '2026-09-12', travelDate: '2026-09-12',
      remarks: 'EXPECTED JOINING ON 01ST OF NOVEMBER',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e3', employeeId: 'EMP0003',
      fullName: 'SCK Sharma',
      phone: '9328798325', email: 'sck.sharma@navlakhi.com',
      jobRole: 'Supervisor', category: 'Crew Member',
      joiningDate: '2026-07-01',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: '2026-11-01', travelDate: '2026-11-01',
      remarks: 'EXPECTED JOINING ON 01ST OF DECEMBER',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e4', employeeId: 'EMP0004',
      fullName: 'Jagjit Singh',
      phone: '7999600349', email: 'jagjit.singh@navlakhi.com',
      jobRole: 'Supervisor', category: 'Crew Member',
      joiningDate: '2026-08-13',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: '',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e5', employeeId: 'EMP0005',
      fullName: 'Arbind Dubey',
      phone: '7738272480', email: 'arbind.dubey@navlakhi.com',
      jobRole: 'Supervisor', category: 'Crew Member',
      joiningDate: '2026-10-14',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: '',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e6', employeeId: 'EMP0006',
      fullName: 'Saurabh Dobhal',
      phone: '7017410445', email: 'saurabh.dobhal@navlakhi.com',
      jobRole: 'Supervisor', category: 'Crew Member',
      joiningDate: '',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: '',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e7', employeeId: 'EMP0007',
      fullName: 'L N Arya',
      phone: '7999600349', email: 'ln.arya@navlakhi.com',
      jobRole: 'Supervisor', category: 'Crew Member',
      joiningDate: '',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: '',
      isActive: true, createdAt: today,
    },
    // ── OPERATORS ──
    {
      _id: 'e8', employeeId: 'EMP0008',
      fullName: 'Kalyan Shukla',
      phone: '9408869338', email: 'kalyan.shukla@navlakhi.com',
      jobRole: 'Operator', category: 'Boat Operator',
      joiningDate: '2017-11-01',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: '',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e9', employeeId: 'EMP0009',
      fullName: 'Nikhil Kumar Yadav',
      phone: '8707505526', email: 'nikhil.yadav@navlakhi.com',
      jobRole: 'Operator', category: 'Boat Operator',
      joiningDate: '',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: '',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e10', employeeId: 'EMP0010',
      fullName: 'Mohamed Irfan',
      phone: '9004383229', email: 'mohamed.irfan@navlakhi.com',
      jobRole: 'Operator', category: 'Boat Operator',
      joiningDate: '2026-06-19',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: 'NA',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e11', employeeId: 'EMP0011',
      fullName: 'Antony I Nishanth',
      phone: '8754664298', email: 'antony.nishanth@navlakhi.com',
      jobRole: 'Operator', category: 'Boat Operator',
      joiningDate: '2026-08-25',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: '',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e12', employeeId: 'EMP0012',
      fullName: 'Vaishak Ramesh',
      phone: '8138067085', email: 'vaishak.ramesh@navlakhi.com',
      jobRole: 'Operator', category: 'Boat Operator',
      joiningDate: '',
      salary: 0,
      currentStatus: 'On Leave', employmentStatus: 'On Leave',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: '2026-11-01', travelDate: '2026-11-01',
      remarks: 'EXPECTED JOINING ON 01ST OF NOVEMBER',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e13', employeeId: 'EMP0013',
      fullName: 'Kapil Rana',
      phone: '9459505434', email: 'kapil.rana@navlakhi.com',
      jobRole: 'Operator', category: 'Boat Operator',
      joiningDate: '2026-09-05',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: '',
      isActive: true, createdAt: today,
    },
    {
      _id: 'e14', employeeId: 'EMP0014',
      fullName: 'Vishnu',
      phone: '8590490174', email: 'vishnu@navlakhi.com',
      jobRole: 'Operator', category: 'Boat Operator',
      joiningDate: '2026-04-20',
      salary: 0,
      currentStatus: 'Available on Shore', employmentStatus: 'Active',
      assignedManager: 'mgr1',
      station: 'NAVLAKHI',
      address: 'NAVLAKHI Station', emergencyContact: { name: '—', phone: '—', relation: '—' },
      leaveGoingDate: null, travelDate: null, remarks: '',
      isActive: true, createdAt: today,
    },
  ]);
};

const seedBoats = () => {
  if (read(KEYS.boats, []).length) return;
  const today = now();
  // Boats assigned to NAVLAKHI station crew (captains = supervisors/operators with experience)
  write(KEYS.boats, [
    { _id: 'b1', boatId: 'BOAT001', boatName: 'Navlakhi Vessel 1', registrationNumber: 'NVL-2020-001', boatType: 'Fishing Boat', capacity: 8, harbourName: 'NAVLAKHI', status: 'Currently at Sea', maintenanceStatus: 'Good', captain: 'e4', crewMembers: ['e8', 'e13'], lastDeparture: new Date(Date.now() - 86400000).toISOString(), expectedReturn: new Date(Date.now() + 86400000).toISOString(), currentTripId: 't1', isActive: true, createdAt: today },
    { _id: 'b2', boatId: 'BOAT002', boatName: 'Navlakhi Vessel 2', registrationNumber: 'NVL-2021-002', boatType: 'Trawler', capacity: 8, harbourName: 'NAVLAKHI', status: 'Docked at Harbour', maintenanceStatus: 'Good', captain: 'e3', crewMembers: [], lastDeparture: new Date(Date.now() - 604800000).toISOString(), expectedReturn: null, currentTripId: null, isActive: true, createdAt: today },
    { _id: 'b3', boatId: 'BOAT003', boatName: 'Navlakhi Vessel 3', registrationNumber: 'NVL-2019-003', boatType: 'Fishing Boat', capacity: 10, harbourName: 'NAVLAKHI', status: 'Docked at Harbour', maintenanceStatus: 'Good', captain: 'e5', crewMembers: [], lastDeparture: new Date(Date.now() - 432000000).toISOString(), expectedReturn: null, currentTripId: null, isActive: true, createdAt: today },
  ]);
};

const seedTrips = () => {
  if (read(KEYS.trips, []).length) return;
  const today = now();
  // Jagjit Singh (e4) captain — crew: Kalyan Shukla (e8), Kapil Rana (e13)
  write(KEYS.trips, [
    {
      _id: 't1', tripId: 'TRIP0001', boat: 'b1', captain: 'e4', crew: ['e8', 'e13'],
      departureHarbour: 'NAVLAKHI', destination: 'Fishing Zone A',
      departureDate: new Date(Date.now() - 86400000).toISOString(), departureTime: '06:00',
      expectedReturnDate: new Date(Date.now() + 86400000).toISOString(), expectedReturnTime: '18:00',
      actualReturnTime: null, status: 'At Sea', managerRemarks: 'Weather conditions good',
      statusHistory: [
        { status: 'Scheduled', updatedBy: 'admin1', updatedAt: new Date(Date.now() - 172800000).toISOString() },
        { status: 'Departed', updatedBy: 'mgr1', updatedAt: new Date(Date.now() - 86400000).toISOString() },
        { status: 'At Sea', updatedBy: 'mgr1', updatedAt: new Date(Date.now() - 82800000).toISOString() },
      ],
      createdBy: 'mgr1', isActive: true, createdAt: today,
    },
    {
      _id: 't2', tripId: 'TRIP0002', boat: 'b2', captain: 'e3', crew: ['e9', 'e10'],
      departureHarbour: 'NAVLAKHI', destination: 'Fishing Zone B',
      departureDate: new Date(Date.now() + 86400000).toISOString(), departureTime: '07:00',
      expectedReturnDate: new Date(Date.now() + 259200000).toISOString(), expectedReturnTime: '18:00',
      actualReturnTime: null, status: 'Scheduled', managerRemarks: 'Awaiting final crew confirmation',
      statusHistory: [
        { status: 'Scheduled', updatedBy: 'admin1', updatedAt: new Date(Date.now() - 86400000).toISOString() },
      ],
      createdBy: 'admin1', isActive: true, createdAt: today,
    },
    {
      _id: 't3', tripId: 'TRIP0003', boat: 'b3', captain: 'e5', crew: ['e6', 'e7'],
      departureHarbour: 'NAVLAKHI', destination: 'Deep Sea Zone C',
      departureDate: new Date(Date.now() - 432000000).toISOString(), departureTime: '05:00',
      expectedReturnDate: new Date(Date.now() - 172800000).toISOString(), expectedReturnTime: '16:00',
      actualReturnTime: new Date(Date.now() - 165600000).toISOString(),
      status: 'Completed', managerRemarks: 'Trip completed successfully',
      statusHistory: [
        { status: 'Completed', updatedBy: 'mgr1', updatedAt: new Date(Date.now() - 165600000).toISOString() },
      ],
      createdBy: 'mgr1', isActive: true, createdAt: today,
    },
  ]);
};

const seedAttendance = () => {
  if (read(KEYS.attendance, []).length) return;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  write(KEYS.attendance, [
    // MANAGER — present
    { _id: 'a1', employee: 'e1', date: today.toISOString(), status: 'Present', checkIn: '08:00', checkOut: null, workingLocation: 'NAVLAKHI Station', managerRemarks: '', createdAt: now() },
    // SUPERVISORS
    { _id: 'a2', employee: 'e2', date: today.toISOString(), status: 'On Leave', checkIn: null, checkOut: null, workingLocation: '', managerRemarks: 'On leave since 12 Sep 2026 — expected joining 01 Nov', createdAt: now() },
    { _id: 'a3', employee: 'e3', date: today.toISOString(), status: 'Present', checkIn: '08:00', checkOut: null, workingLocation: 'NAVLAKHI Station', managerRemarks: '', createdAt: now() },
    { _id: 'a4', employee: 'e4', date: today.toISOString(), status: 'At Sea', checkIn: '06:00', checkOut: null, workingLocation: 'Fishing Zone A', managerRemarks: '', tripId: 't1', assignedBoat: 'b1', createdAt: now() },
    { _id: 'a5', employee: 'e5', date: today.toISOString(), status: 'Present', checkIn: '08:00', checkOut: null, workingLocation: 'NAVLAKHI Station', managerRemarks: '', createdAt: now() },
    { _id: 'a6', employee: 'e6', date: today.toISOString(), status: 'Present', checkIn: '08:15', checkOut: null, workingLocation: 'NAVLAKHI Station', managerRemarks: '', createdAt: now() },
    { _id: 'a7', employee: 'e7', date: today.toISOString(), status: 'Present', checkIn: '08:00', checkOut: null, workingLocation: 'NAVLAKHI Station', managerRemarks: '', createdAt: now() },
    // OPERATORS
    { _id: 'a8', employee: 'e8', date: today.toISOString(), status: 'At Sea', checkIn: '06:00', checkOut: null, workingLocation: 'Fishing Zone A', managerRemarks: '', tripId: 't1', assignedBoat: 'b1', createdAt: now() },
    { _id: 'a9', employee: 'e9', date: today.toISOString(), status: 'Present', checkIn: '08:00', checkOut: null, workingLocation: 'NAVLAKHI Station', managerRemarks: '', createdAt: now() },
    { _id: 'a10', employee: 'e10', date: today.toISOString(), status: 'Present', checkIn: '08:00', checkOut: null, workingLocation: 'NAVLAKHI Station', managerRemarks: '', createdAt: now() },
    { _id: 'a11', employee: 'e11', date: today.toISOString(), status: 'Present', checkIn: '08:00', checkOut: null, workingLocation: 'NAVLAKHI Station', managerRemarks: '', createdAt: now() },
    { _id: 'a12', employee: 'e12', date: today.toISOString(), status: 'On Leave', checkIn: null, checkOut: null, workingLocation: '', managerRemarks: 'On leave — expected joining 01 Nov 2026', createdAt: now() },
    { _id: 'a13', employee: 'e13', date: today.toISOString(), status: 'At Sea', checkIn: '06:00', checkOut: null, workingLocation: 'Fishing Zone A', managerRemarks: '', tripId: 't1', assignedBoat: 'b1', createdAt: now() },
    { _id: 'a14', employee: 'e14', date: today.toISOString(), status: 'Present', checkIn: '08:00', checkOut: null, workingLocation: 'NAVLAKHI Station', managerRemarks: '', createdAt: now() },
  ]);
};

const seedLeaves = () => {
  if (read(KEYS.leaves, []).length) return;
  // Excel data: Debashish Banerjee (e2) on leave since 12 Sep, Vaishak Ramesh (e12) going on leave 01 Nov
  // SCK Sharma (e3) going on leave 01 Nov (future)
  write(KEYS.leaves, [
    {
      _id: 'l1', employee: 'e2', leaveType: 'Annual Leave',
      fromDate: '2026-09-12', toDate: '2026-10-31',
      numberOfDays: 50, reason: 'Annual leave',
      status: 'Approved',
      adminApproval: { approvedBy: 'admin1', remarks: 'Approved. Expected joining 01 Nov 2026', approvedAt: now() },
      createdAt: new Date(Date.now() - 4320000000).toISOString(),
    },
    {
      _id: 'l2', employee: 'e12', leaveType: 'Annual Leave',
      fromDate: '2026-11-01', toDate: '2026-11-30',
      numberOfDays: 30, reason: 'Annual leave',
      status: 'Approved',
      adminApproval: { approvedBy: 'admin1', remarks: 'Approved. Expected joining 01 Nov 2026', approvedAt: now() },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: 'l3', employee: 'e3', leaveType: 'Annual Leave',
      fromDate: '2026-11-01', toDate: '2026-11-30',
      numberOfDays: 30, reason: 'Annual leave — expected joining 01 Dec',
      status: 'Pending',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
};

const seedNotifications = () => {
  if (read(KEYS.notifications, []).length) return;
  write(KEYS.notifications, [
    { _id: 'n1', type: 'boat_departure', title: 'Boat Departed: Navlakhi Vessel 1', message: 'Navlakhi Vessel 1 departed to Fishing Zone A. Captain: Jagjit Singh. Crew: Kalyan Shukla, Kapil Rana', targetRole: 'all', readBy: [], createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: 'n2', type: 'leave_request', title: 'Leave Request — SCK Sharma', message: 'SCK Sharma has submitted Annual Leave request from 01 Nov 2026. Expected joining 01 Dec 2026.', targetRole: 'admin', readBy: [], createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: 'n3', type: 'leave_approved', title: 'Leave Approved — Debashish Banerjee', message: 'Debashish Banerjee is on approved leave since 12 Sep 2026. Expected joining 01 Nov 2026.', targetRole: 'manager', readBy: ['admin1'], createdAt: new Date(Date.now() - 4320000000).toISOString() },
    { _id: 'n4', type: 'leave_approved', title: 'Leave Approved — Vaishak Ramesh', message: 'Vaishak Ramesh leave approved from 01 Nov 2026. Expected joining 01 Nov 2026.', targetRole: 'manager', readBy: ['admin1'], createdAt: new Date(Date.now() - 86400000).toISOString() },
  ]);
};

const seedSettings = () => {
  if (read(KEYS.settings, null)) return;
  write(KEYS.settings, {
    companyName: 'NAVLAKHI Marine Operations',
    address: 'NAVLAKHI Station, Gujarat, India',
    phone: '9553464475',
    email: 'navlakhi@marineops.com',
    website: '',
    workingHours: { start: '08:00', end: '17:00' },
    lateArrivalThreshold: 30,
    weeklyOffDays: ['Sunday'],
    leaveQuotas: { casual: 12, sick: 10, annual: 20, emergency: 5 },
    harbours: [
      { name: 'NAVLAKHI Harbour', location: 'NAVLAKHI, Gujarat, India' },
    ],
  });
};

// ── seed on import ────────────────────────────────────────
export const initStore = () => {
  // If seed version changed, wipe all marine_ keys so fresh data loads
  const storedVersion = localStorage.getItem(KEYS.seedVersion);
  if (storedVersion !== SEED_VERSION) {
    Object.keys(localStorage)
      .filter(k => k.startsWith('marine_'))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem(KEYS.seedVersion, SEED_VERSION);
  }
  seedUsers();
  seedEmployees();
  seedBoats();
  seedTrips();
  seedAttendance();
  seedLeaves();
  seedNotifications();
  seedSettings();
};

// ── CRUD helpers ─────────────────────────────────────────

// USERS
export const getUsers = () => read<any[]>(KEYS.users, []);
export const getUserByEmail = (email: string) => getUsers().find(u => u.email === email);
export const createUser = (data: any) => {
  const users = getUsers();
  const user = { _id: uid(), ...data, isActive: true, createdAt: now() };
  write(KEYS.users, [...users, user]);
  return user;
};
export const updateUser = (id: string, data: any) => {
  const users = getUsers().map(u => u._id === id ? { ...u, ...data } : u);
  write(KEYS.users, users);
  return users.find(u => u._id === id);
};

// EMPLOYEES
export const getEmployees = (filter?: any) => {
  let list = read<any[]>(KEYS.employees, []).filter(e => e.isActive !== false);
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    list = list.filter(e => e.fullName.toLowerCase().includes(s) || e.employeeId.toLowerCase().includes(s) || (e.phone || '').includes(s));
  }
  if (filter?.category) list = list.filter(e => e.category === filter.category);
  if (filter?.status) list = list.filter(e => e.currentStatus === filter.status);
  if (filter?.manager) list = list.filter(e => e.assignedManager === filter.manager);
  return list;
};
export const getEmployee = (id: string) => read<any[]>(KEYS.employees, []).find(e => e._id === id);
export const createEmployee = (data: any) => {
  const employees = read<any[]>(KEYS.employees, []);
  const count = employees.length;
  const emp = { _id: uid(), employeeId: `EMP${String(count + 1).padStart(4, '0')}`, ...data, isActive: true, createdAt: now(), updatedAt: now() };
  write(KEYS.employees, [...employees, emp]);
  return emp;
};
export const updateEmployee = (id: string, data: any) => {
  const list = read<any[]>(KEYS.employees, []).map(e => e._id === id ? { ...e, ...data, updatedAt: now() } : e);
  write(KEYS.employees, list);
  return list.find(e => e._id === id);
};
export const deactivateEmployee = (id: string) => updateEmployee(id, { isActive: false, employmentStatus: 'Inactive' });

// BOATS
export const getBoats = (filter?: any) => {
  let list = read<any[]>(KEYS.boats, []).filter(b => b.isActive !== false);
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    list = list.filter(b => b.boatName.toLowerCase().includes(s) || b.registrationNumber.toLowerCase().includes(s) || b.boatId.toLowerCase().includes(s));
  }
  if (filter?.status) list = list.filter(b => b.status === filter.status);
  return list;
};
export const getBoat = (id: string) => read<any[]>(KEYS.boats, []).find(b => b._id === id);
export const createBoat = (data: any) => {
  const boats = read<any[]>(KEYS.boats, []);
  const count = boats.length;
  const boat = { _id: uid(), boatId: `BOAT${String(count + 1).padStart(3, '0')}`, ...data, isActive: true, createdAt: now() };
  write(KEYS.boats, [...boats, boat]);
  return boat;
};
export const updateBoat = (id: string, data: any) => {
  const list = read<any[]>(KEYS.boats, []).map(b => b._id === id ? { ...b, ...data, updatedAt: now() } : b);
  write(KEYS.boats, list);
  return list.find(b => b._id === id);
};

// TRIPS
export const getTrips = (filter?: any) => {
  let list = read<any[]>(KEYS.trips, []);
  if (filter?.status) {
    const statuses = filter.status.split(',').map((s: string) => s.trim());
    list = list.filter(t => statuses.includes(t.status));
  }
  if (filter?.boat) list = list.filter(t => t.boat === filter.boat);
  return list.sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
};
export const getTrip = (id: string) => read<any[]>(KEYS.trips, []).find(t => t._id === id);
export const createTrip = (data: any, userId: string) => {
  const trips = read<any[]>(KEYS.trips, []);
  const count = trips.length;
  const trip = { _id: uid(), tripId: `TRIP${String(count + 1).padStart(4, '0')}`, ...data, statusHistory: [{ status: 'Scheduled', updatedBy: userId, updatedAt: now() }], createdBy: userId, isActive: true, createdAt: now() };
  write(KEYS.trips, [...trips, trip]);
  return trip;
};
export const updateTrip = (id: string, data: any) => {
  const list = read<any[]>(KEYS.trips, []).map(t => t._id === id ? { ...t, ...data, updatedAt: now() } : t);
  write(KEYS.trips, list);
  return list.find(t => t._id === id);
};
export const updateTripStatus = (id: string, status: string, remarks: string, userId: string) => {
  const trip = getTrip(id);
  if (!trip) return null;
  const newHistory = [...(trip.statusHistory || []), { status, updatedBy: userId, updatedAt: now(), remarks }];
  const updates: any = { status, statusHistory: newHistory };
  if (remarks) updates.managerRemarks = remarks;

  if (status === 'Departed' || status === 'At Sea') {
    // Update boat status
    updateBoat(trip.boat, { status: 'Currently at Sea', lastDeparture: now(), currentTripId: id });
    // Update crew to At Sea
    const allCrew = [trip.captain, ...(trip.crew || [])].filter(Boolean);
    allCrew.forEach((empId: string) => {
      updateEmployee(empId, { currentStatus: 'At Sea' });
      markOrUpdateAttendance(empId, 'At Sea', trip.boat, id);
    });
    // Notification
    addNotification('boat_departure', `Boat Departed`, `${getBoat(trip.boat)?.boatName} has departed to ${trip.destination}`, 'all');
  }

  if (status === 'Arrived' || status === 'Completed') {
    updates.actualReturnTime = now();
    updateBoat(trip.boat, { status: 'Arrived at Harbour', actualReturn: now(), currentTripId: null });
    const allCrew = [trip.captain, ...(trip.crew || [])].filter(Boolean);
    allCrew.forEach((empId: string) => {
      updateEmployee(empId, { currentStatus: 'Available on Shore' });
      markOrUpdateAttendance(empId, 'Returned from Sea');
    });
    addNotification('boat_arrival', `Boat Arrived`, `${getBoat(trip.boat)?.boatName} has returned from ${trip.destination}`, 'all');
  }

  return updateTrip(id, updates);
};

// ══════════════════════════════════════════════════════════
// ATTENDANCE — Approval-based workflow
//
//  approvalStatus field:
//   'Pending'  → Manager just submitted, waiting for Admin approval
//   'Approved' → Admin approved; counts in history / stats
//   'Rejected' → Admin rejected; does NOT count in history
//
//  Sea-trip auto-attendance is always 'Approved' (system-generated).
// ══════════════════════════════════════════════════════════

export const getAttendance = (filter?: any) => {
  let list = read<any[]>(KEYS.attendance, []);
  if (filter?.date) {
    const d = new Date(filter.date); d.setHours(0, 0, 0, 0);
    const dEnd = new Date(filter.date); dEnd.setHours(23, 59, 59, 999);
    list = list.filter(a => { const ad = new Date(a.date); return ad >= d && ad <= dEnd; });
  }
  if (filter?.from && filter?.to) {
    list = list.filter(a => new Date(a.date) >= new Date(filter.from) && new Date(a.date) <= new Date(filter.to));
  }
  if (filter?.status) list = list.filter(a => a.status === filter.status);
  if (filter?.employee) list = list.filter(a => a.employee === filter.employee);
  if (filter?.approvalStatus) list = list.filter(a => a.approvalStatus === filter.approvalStatus);
  return list.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Low-level update (used internally and by correction approval)
export const updateAttendance = (id: string, data: any) => {
  const list = read<any[]>(KEYS.attendance, []).map(a => a._id === id ? { ...a, ...data, updatedAt: now() } : a);
  write(KEYS.attendance, list);
  return list.find(a => a._id === id);
};

// System-generated (boat trips) — always auto-approved
const markOrUpdateAttendance = (empId: string, status: string, boatId?: string, tripId?: string) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const list = read<any[]>(KEYS.attendance, []);
  const existing = list.find(a => a.employee === empId && new Date(a.date) >= today && new Date(a.date) <= todayEnd);
  if (existing) {
    updateAttendance(existing._id, { status, approvalStatus: 'Approved', ...(boatId ? { assignedBoat: boatId } : {}), ...(tripId ? { tripId } : {}) });
  } else {
    const rec = { _id: uid(), employee: empId, date: today.toISOString(), status, approvalStatus: 'Approved', assignedBoat: boatId, tripId, workingLocation: '', createdAt: now() };
    write(KEYS.attendance, [...list, rec]);
  }
};

// Manager submits daily attendance → saved as Pending, notifies Admin
export const bulkMarkAttendance = (
  records: { employee: string; status: string; checkIn?: string; checkOut?: string; workingLocation?: string; remarks?: string }[],
  date: Date,
  markedBy: string
) => {
  const list = read<any[]>(KEYS.attendance, []);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const dEnd = new Date(date); dEnd.setHours(23, 59, 59, 999);
  const newList = [...list];
  const dateStr = d.toISOString();

  records.forEach(r => {
    const existIdx = newList.findIndex(
      a => a.employee === r.employee && new Date(a.date) >= d && new Date(a.date) <= dEnd
    );
    const rec: any = {
      _id: uid(),
      employee: r.employee,
      date: dateStr,
      status: r.status,
      approvalStatus: 'Pending',   // ← Admin must approve
      checkIn: r.checkIn || null,
      checkOut: r.checkOut || null,
      workingLocation: r.workingLocation || 'NAVLAKHI Station',
      managerRemarks: r.remarks || '',
      markedBy,
      createdAt: now(),
    };
    if (existIdx >= 0) {
      // Re-submission: replace but keep _id, reset to Pending
      newList[existIdx] = { ...newList[existIdx], ...rec, _id: newList[existIdx]._id, updatedAt: now() };
    } else {
      newList.push(rec);
    }
  });

  write(KEYS.attendance, newList);

  // Notify admin that attendance sheet was submitted
  const manager = getUsers().find((u: any) => u._id === markedBy);
  addNotification(
    'attendance_submitted',
    'Attendance Sheet Submitted',
    `${manager?.name || 'Manager'} submitted attendance for ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} — ${records.length} employees. Pending your approval.`,
    'admin'
  );
};

// Admin approves a whole day's attendance batch
export const approveAttendanceBatch = (date: string, adminId: string) => {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const dEnd = new Date(date); dEnd.setHours(23, 59, 59, 999);
  const list = read<any[]>(KEYS.attendance, []).map((a: any) => {
    const ad = new Date(a.date);
    if (ad >= d && ad <= dEnd && a.approvalStatus === 'Pending') {
      // sync employee currentStatus from approved attendance
      const s = a.status;
      const newEmpStatus = s === 'Present' || s === 'Late Arrival' || s === 'Half Day' ? 'Available on Shore'
        : s === 'On Leave' ? 'On Leave'
        : s === 'At Sea' ? 'At Sea'
        : undefined;
      if (newEmpStatus) updateEmployee(a.employee, { currentStatus: newEmpStatus });
      return { ...a, approvalStatus: 'Approved', approvedBy: adminId, approvedAt: now() };
    }
    return a;
  });
  write(KEYS.attendance, list);
  addNotification('attendance_approved', 'Attendance Approved', `Attendance for ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} has been approved.`, 'manager');
};

// Admin rejects a whole day's attendance batch (sends back to manager)
export const rejectAttendanceBatch = (date: string, adminId: string, reason: string) => {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const dEnd = new Date(date); dEnd.setHours(23, 59, 59, 999);
  const list = read<any[]>(KEYS.attendance, []).map((a: any) => {
    const ad = new Date(a.date);
    if (ad >= d && ad <= dEnd && a.approvalStatus === 'Pending') {
      return { ...a, approvalStatus: 'Rejected', rejectedBy: adminId, rejectedAt: now(), rejectionReason: reason };
    }
    return a;
  });
  write(KEYS.attendance, list);
  addNotification('attendance_rejected', 'Attendance Rejected', `Attendance for ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} was rejected. Reason: ${reason}`, 'manager');
};

// Get all unique dates that have pending attendance
export const getPendingAttendanceDates = () => {
  const list = read<any[]>(KEYS.attendance, []).filter((a: any) => a.approvalStatus === 'Pending');
  const dates = new Set(list.map((a: any) => new Date(a.date).toDateString()));
  return Array.from(dates).map(ds => new Date(ds).toISOString()).sort().reverse();
};

export const getTodayAttendanceSummary = () => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  // Count only Approved records for stats
  const records = read<any[]>(KEYS.attendance, []).filter(a => {
    const ad = new Date(a.date);
    return ad >= today && ad <= todayEnd && (a.approvalStatus === 'Approved' || !a.approvalStatus);
  });
  const s: any = {};
  records.forEach(r => { s[r.status] = (s[r.status] || 0) + 1; });
  return s;
};

// LEAVES
export const getLeaves = (filter?: any) => {
  let list = read<any[]>(KEYS.leaves, []);
  if (filter?.status) list = list.filter(l => l.status === filter.status);
  if (filter?.employee) list = list.filter(l => l.employee === filter.employee);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
export const createLeave = (data: any) => {
  const leaves = read<any[]>(KEYS.leaves, []);
  const from = new Date(data.fromDate); const to = new Date(data.toDate);
  const days = Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1;
  const leave = { _id: uid(), ...data, numberOfDays: days, status: 'Pending', createdAt: now() };
  write(KEYS.leaves, [...leaves, leave]);
  addNotification('leave_request', 'New Leave Request', `${getEmployee(data.employee)?.fullName} submitted a ${data.leaveType} request`, 'admin');
  return leave;
};
export const updateLeave = (id: string, data: any) => {
  const list = read<any[]>(KEYS.leaves, []).map(l => l._id === id ? { ...l, ...data, updatedAt: now() } : l);
  write(KEYS.leaves, list);
  const updated = list.find(l => l._id === id);
  if (data.status === 'Approved') {
    const emp = getEmployee(updated?.employee);
    if (emp) updateEmployee(updated.employee, { currentStatus: 'On Leave', employmentStatus: 'On Leave' });
    addNotification('leave_approved', 'Leave Approved', `${emp?.fullName}'s ${updated?.leaveType} has been approved`, 'all');
  }
  if (data.status === 'Rejected') {
    const emp = getEmployee(updated?.employee);
    addNotification('leave_rejected', 'Leave Rejected', `${emp?.fullName}'s leave request was rejected`, 'manager');
  }
  return updated;
};

// NOTIFICATIONS
export const getNotifications = (userId: string, role: string) => {
  return read<any[]>(KEYS.notifications, [])
    .filter(n => n.targetRole === 'all' || n.targetRole === role || n.targetUser === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
export const addNotification = (type: string, title: string, message: string, targetRole: string) => {
  const notifs = read<any[]>(KEYS.notifications, []);
  write(KEYS.notifications, [{ _id: uid(), type, title, message, targetRole, readBy: [], createdAt: now() }, ...notifs]);
};
export const markNotifRead = (id: string, userId: string) => {
  const list = read<any[]>(KEYS.notifications, []).map(n => n._id === id ? { ...n, readBy: [...(n.readBy || []), userId] } : n);
  write(KEYS.notifications, list);
};
export const markAllNotifsRead = (userId: string, role: string) => {
  const list = read<any[]>(KEYS.notifications, []).map(n =>
    (n.targetRole === 'all' || n.targetRole === role) && !n.readBy?.includes(userId)
      ? { ...n, readBy: [...(n.readBy || []), userId] } : n
  );
  write(KEYS.notifications, list);
};

// LOCATIONS
export const getBoatLocations = (boatId: string) => {
  return read<any[]>(KEYS.locations, []).filter(l => l.boat === boatId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
export const addBoatLocation = (data: any, userId: string) => {
  const locs = read<any[]>(KEYS.locations, []);
  const loc = { _id: uid(), ...data, updatedBy: userId, createdAt: now() };
  write(KEYS.locations, [...locs, loc]);
  return loc;
};

// SETTINGS
export const getSettings = () => read<any>(KEYS.settings, {});
export const updateSettings = (data: any) => { write(KEYS.settings, { ...getSettings(), ...data }); return getSettings(); };

// ACTIVITY LOG
export const addLog = (userId: string, action: string, module: string, description: string) => {
  const logs = read<any[]>(KEYS.logs, []);
  write(KEYS.logs, [{ _id: uid(), user: userId, action, module, description, createdAt: now() }, ...logs.slice(0, 199)]);
};
export const getLogs = () => read<any[]>(KEYS.logs, []).slice(0, 50);

// DASHBOARD STATS
export const getDashboardStats = (userRole: string, managerId?: string) => {
  const emps = getEmployees(userRole === 'manager' ? { manager: managerId } : undefined);
  const boats = getBoats();
  const trips = getTrips();
  const leaves = getLeaves({ status: 'Pending' });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const todayAtt = read<any[]>(KEYS.attendance, []).filter(a => { const ad = new Date(a.date); return ad >= today && ad <= todayEnd; });
  const presentStatuses = ['Present', 'Late Arrival', 'Half Day', 'At Sea', 'Returned from Sea'];
  return {
    totalEmployees: emps.length,
    atSea: emps.filter(e => e.currentStatus === 'At Sea').length,
    available: emps.filter(e => e.currentStatus === 'Available on Shore').length,
    onLeave: emps.filter(e => e.currentStatus === 'On Leave').length,
    presentToday: todayAtt.filter(a => presentStatuses.includes(a.status)).length,
    absentToday: todayAtt.filter(a => a.status === 'Absent').length,
    totalBoats: boats.length,
    boatsAtSea: boats.filter(b => ['Currently at Sea', 'Departed'].includes(b.status)).length,
    boatsDocked: boats.filter(b => ['Docked at Harbour', 'Arrived at Harbour'].includes(b.status)).length,
    activeTrips: trips.filter(t => ['Departed', 'At Sea', 'Returning'].includes(t.status)).length,
    completedTrips: trips.filter(t => t.status === 'Completed').length,
    pendingLeave: leaves.length,
  };
};

// RESOLVE REFS — populate IDs with actual objects
export const populateEmployee = (id: string) => {
  const e = getEmployee(id);
  const mgr = e?.assignedManager ? getUsers().find(u => u._id === e.assignedManager) : null;
  return e ? { ...e, assignedManager: mgr ? { _id: mgr._id, name: mgr.name, email: mgr.email } : null } : null;
};
export const populateBoat = (id: string) => {
  const b = getBoat(id);
  if (!b) return null;
  return {
    ...b,
    captain: b.captain ? getEmployee(b.captain) : null,
    crewMembers: (b.crewMembers || []).map((cid: string) => getEmployee(cid)).filter(Boolean),
    currentTripId: b.currentTripId ? getTrip(b.currentTripId) : null,
  };
};
export const populateTrip = (id: string) => {
  const t = getTrip(id);
  if (!t) return null;
  const users = getUsers();
  return {
    ...t,
    boat: getBoat(t.boat),
    captain: getEmployee(t.captain),
    crew: (t.crew || []).map((cid: string) => getEmployee(cid)).filter(Boolean),
    createdBy: users.find(u => u._id === t.createdBy),
    statusHistory: (t.statusHistory || []).map((h: any) => ({
      ...h,
      updatedBy: users.find(u => u._id === h.updatedBy) || { name: h.updatedBy }
    })),
  };
};
export const populateAttendance = (rec: any) => ({
  ...rec,
  employee: populateEmployee(rec.employee),
  assignedBoat: rec.assignedBoat ? getBoat(rec.assignedBoat) : null,
});
export const populateLeave = (l: any) => {
  const users = getUsers();
  return {
    ...l,
    employee: populateEmployee(l.employee),
    adminApproval: l.adminApproval ? { ...l.adminApproval, approvedBy: users.find(u => u._id === l.adminApproval.approvedBy) } : null,
    managerReview: l.managerReview ? { ...l.managerReview, reviewedBy: users.find(u => u._id === l.managerReview.reviewedBy) } : null,
  };
};

// ── ATTENDANCE CORRECTIONS ────────────────────────────────
// Manager submits a correction; Admin approves/rejects.
export const getCorrections = (filter?: any) => {
  let list = read<any[]>(KEYS.corrections, []);
  if (filter?.status) list = list.filter(c => c.status === filter.status);
  if (filter?.employee) list = list.filter(c => c.employee === filter.employee);
  return list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
export const submitCorrection = (data: {
  employee: string;
  attendanceId: string | null;
  date: string;
  originalStatus: string;
  requestedStatus: string;
  reason: string;
  submittedBy: string;
}) => {
  const corrections = read<any[]>(KEYS.corrections, []);
  const c = { _id: uid(), ...data, status: 'Pending', createdAt: now() };
  write(KEYS.corrections, [c, ...corrections]);
  addNotification(
    'correction_request',
    'Attendance Correction Request',
    `${getEmployee(data.employee)?.fullName} — ${data.date} correction requested by manager`,
    'admin'
  );
  return c;
};
export const approveCorrection = (id: string, adminId: string, remarks: string) => {
  const corrections = read<any[]>(KEYS.corrections, []);
  const c = corrections.find((x: any) => x._id === id);
  if (!c) return null;
  // Apply the corrected status to the actual attendance record
  if (c.attendanceId) {
    updateAttendance(c.attendanceId, { status: c.requestedStatus, correctionApplied: true, correctedBy: adminId });
  } else {
    // No existing record — create one
    const list = read<any[]>(KEYS.attendance, []);
    const d = new Date(c.date); d.setHours(0, 0, 0, 0);
    const rec = { _id: uid(), employee: c.employee, date: d.toISOString(), status: c.requestedStatus, approvalStatus: 'Approved', correctionApplied: true, correctedBy: adminId, createdAt: now() };
    write(KEYS.attendance, [...list, rec]);
  }
  const updated = corrections.map((x: any) => x._id === id ? { ...x, status: 'Approved', adminRemarks: remarks, approvedBy: adminId, approvedAt: now() } : x);
  write(KEYS.corrections, updated);
  addNotification('correction_approved', 'Correction Approved', `Attendance correction for ${getEmployee(c.employee)?.fullName} has been approved`, 'manager');
  return updated.find((x: any) => x._id === id);
};
export const rejectCorrection = (id: string, adminId: string, remarks: string) => {
  const corrections = read<any[]>(KEYS.corrections, []);
  const updated = corrections.map((x: any) => x._id === id ? { ...x, status: 'Rejected', adminRemarks: remarks, rejectedBy: adminId, rejectedAt: now() } : x);
  write(KEYS.corrections, updated);
  const c = corrections.find((x: any) => x._id === id);
  addNotification('correction_rejected', 'Correction Rejected', `Attendance correction for ${getEmployee(c?.employee)?.fullName} was rejected`, 'manager');
  return updated.find((x: any) => x._id === id);
};
export const populateCorrection = (c: any) => {
  const users = getUsers();
  return {
    ...c,
    employee: populateEmployee(c.employee),
    submittedByUser: users.find((u: any) => u._id === c.submittedBy) || null,
    approvedByUser: c.approvedBy ? users.find((u: any) => u._id === c.approvedBy) : null,
  };
};

// ── EMPLOYEE ATTENDANCE HISTORY (monthly summary) ─────────
export interface MonthSummary {
  year: number;
  month: number;          // 0-based
  monthLabel: string;     // e.g. "October 2026"
  present: number;
  absent: number;
  atSea: number;
  onLeave: number;
  halfDay: number;
  lateArrival: number;
  weeklyOff: number;
  total: number;
  records: any[];
}

export const getEmployeeAttendanceHistory = (employeeId: string): MonthSummary[] => {
  const emp = getEmployee(employeeId);
  if (!emp) return [];
  // Only APPROVED records count in history
  const allRecs = read<any[]>(KEYS.attendance, [])
    .filter((a: any) => a.employee === employeeId && (a.approvalStatus === 'Approved' || !a.approvalStatus))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!allRecs.length) return [];

  // Group by year-month
  const groups: Record<string, any[]> = {};
  allRecs.forEach((rec: any) => {
    const d = new Date(rec.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(rec);
  });

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return Object.entries(groups).map(([key, recs]) => {
    const [y, m] = key.split('-').map(Number);
    const summary: MonthSummary = {
      year: y, month: m,
      monthLabel: `${MONTH_NAMES[m]} ${y}`,
      present: 0, absent: 0, atSea: 0, onLeave: 0,
      halfDay: 0, lateArrival: 0, weeklyOff: 0, total: recs.length,
      records: recs,
    };
    recs.forEach((r: any) => {
      const s = r.status;
      if (s === 'Present') summary.present++;
      else if (s === 'Absent') summary.absent++;
      else if (s === 'At Sea' || s === 'Returned from Sea') summary.atSea++;
      else if (s === 'On Leave') summary.onLeave++;
      else if (s === 'Half Day') summary.halfDay++;
      else if (s === 'Late Arrival') { summary.lateArrival++; summary.present++; }
      else if (s === 'Weekly Off') summary.weeklyOff++;
    });
    return summary;
  }).sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
};

// (bulkMarkAttendance is defined above in the attendance section)
