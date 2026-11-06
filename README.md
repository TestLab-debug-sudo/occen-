# 🚢 Marine Operations Management System

A complete **Boat Company Attendance & Marine Operations Management System** — pure frontend React application with local persistence (`localStorage`), preloaded Navlakhi port operations data, role-based dashboards, and default auto-login.

---

## ✨ Highlights

- **Pure Frontend Architecture:** Runs 100% in the browser with `localStorage` persistence — zero backend or external database configuration needed.
- **Default Auto-Login:** Automatically logs in as **System Admin** upon opening the app.
- **1-Click Role Switcher:** Toggle instantly between **Admin Panel** and **Manager Panel** right from the top navigation bar.
- **Preloaded Real Operations Data:** Auto-seeds complete Navlakhi station fleet, managers, supervisors, operators, sea trips, attendance, and leave workflows.

---

## 🚀 Running the Application

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Default Profiles

| Role | Name | Email | Default Status |
|:---|:---|:---|:---|
| **Admin** | System Admin | `admin@boatcompany.com` | Active (Default login) |
| **Manager** | Capt. M. Madhukar Rao | `manager@boatcompany.com` | Active (1-click switchable) |

---

## 🛠 Features

- **Command Dashboard:** Live stats for shore staff, at-sea crew, active vessels, and pending approvals.
- **Fleet & Vessel Tracking:** Real-time boat status, Leaflet interactive map with coordinates.
- **Sea Trips Management:** Departure/arrival logging, crew assignment, and status updates.
- **Attendance & Approvals:** Daily logs, manager approvals, and correction requests.
- **Crew Availability Board:** Real-time roster of available vs. deployed personnel.
- **Leave Planner:** Multi-day leave requests with admin approval workflows.
- **Reports & Analytics:** Attendance trends and exportable operation records.
