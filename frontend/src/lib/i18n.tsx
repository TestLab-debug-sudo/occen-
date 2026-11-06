import React, { createContext, useContext, useState } from 'react';

type Lang = 'en' | 'ta';

const T = {
  en: {
    // Nav
    dashboard: 'Dashboard', employees: 'Employees', attendance: 'Attendance',
    boats: 'Boats', trips: 'Sea Trips', crew: 'Crew', leave: 'Leave',
    reports: 'Reports', notifications: 'Notifications', managers: 'Managers',
    settings: 'Settings', tracking: 'Tracking', departures: 'Departures',
    // Attendance page
    dailyAttendance: 'Daily Attendance',
    markAttendance: 'Mark Attendance',
    saveAttendance: 'Save Attendance',
    attendanceDate: 'Attendance Date',
    employeeName: 'Employee Name',
    status: 'Status',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    remarks: 'Remarks',
    present: 'Present',
    absent: 'Absent',
    onLeave: 'On Leave',
    atSea: 'At Sea',
    halfDay: 'Half Day',
    lateArrival: 'Late Arrival',
    weeklyOff: 'Weekly Off',
    returnedFromSea: 'Returned from Sea',
    alreadyMarked: 'Already marked — click Edit to correct',
    submitCorrection: 'Submit Correction',
    correctionReason: 'Reason for Correction',
    correctionRequest: 'Correction Request',
    sendToAdmin: 'Send to Admin for Approval',
    // History
    attendanceHistory: 'Attendance History',
    selectEmployee: 'Select Employee',
    monthSummary: 'Monthly Summary',
    totalDays: 'Total Days',
    presentDays: 'Present Days',
    absentDays: 'Absent Days',
    leaveDays: 'Leave Days',
    seaDays: 'At Sea Days',
    downloadCSV: 'Download CSV',
    downloadExcel: 'Download Excel',
    joiningDate: 'Joining Date',
    noRecords: 'No records found',
    // Admin corrections
    pendingCorrections: 'Pending Corrections',
    approve: 'Approve',
    reject: 'Reject',
    adminRemarks: 'Admin Remarks',
    originalStatus: 'Original Status',
    requestedStatus: 'Requested Status',
    correctionDate: 'Date',
    // General
    save: 'Save', cancel: 'Cancel', edit: 'Edit', close: 'Close',
    search: 'Search', filter: 'Filter', loading: 'Loading...',
    rank: 'Rank', phone: 'Phone', station: 'Station',
    month: 'Month', year: 'Year', date: 'Date',
    allEmployees: 'All Employees',
    languageToggle: 'தமிழ்',
  },
  ta: {
    // Nav
    dashboard: 'டாஷ்போர்ட்', employees: 'ஊழியர்கள்', attendance: 'ஹாஜர்',
    boats: 'படகுகள்', trips: 'கடல் பயணங்கள்', crew: 'குழு', leave: 'விடுப்பு',
    reports: 'அறிக்கைகள்', notifications: 'அறிவிப்புகள்', managers: 'மேலாளர்கள்',
    settings: 'அமைப்புகள்', tracking: 'கண்காணிப்பு', departures: 'புறப்பாடு',
    // Attendance page
    dailyAttendance: 'தினசரி ஹாஜர்',
    markAttendance: 'ஹாஜர் போடு',
    saveAttendance: 'ஹாஜர் சேமி',
    attendanceDate: 'தேதி',
    employeeName: 'பெயர்',
    status: 'நிலை',
    checkIn: 'வருகை நேரம்',
    checkOut: 'புறப்பாடு நேரம்',
    remarks: 'குறிப்பு',
    present: 'வந்தார்',
    absent: 'வரவில்லை',
    onLeave: 'விடுப்பில்',
    atSea: 'கடலில்',
    halfDay: 'அரை நாள்',
    lateArrival: 'தாமதமாக வந்தார்',
    weeklyOff: 'வாரவிடுமுறை',
    returnedFromSea: 'கடலிலிருந்து திரும்பினார்',
    alreadyMarked: 'ஏற்கனவே போடப்பட்டது — திருத்தம் அனுப்ப கிளிக் செய்யவும்',
    submitCorrection: 'திருத்தம் அனுப்பு',
    correctionReason: 'திருத்தத்தின் காரணம்',
    correctionRequest: 'திருத்தக் கோரிக்கை',
    sendToAdmin: 'அட்மின் ஒப்புதலுக்கு அனுப்பு',
    // History
    attendanceHistory: 'ஹாஜர் வரலாறு',
    selectEmployee: 'ஊழியரை தேர்ந்தெடு',
    monthSummary: 'மாத சுருக்கம்',
    totalDays: 'மொத்த நாட்கள்',
    presentDays: 'வந்த நாட்கள்',
    absentDays: 'வராத நாட்கள்',
    leaveDays: 'விடுப்பு நாட்கள்',
    seaDays: 'கடல் நாட்கள்',
    downloadCSV: 'CSV பதிவிறக்கு',
    downloadExcel: 'Excel பதிவிறக்கு',
    joiningDate: 'சேர்ந்த தேதி',
    noRecords: 'பதிவுகள் இல்லை',
    // Admin corrections
    pendingCorrections: 'நிலுவையில் உள்ள திருத்தங்கள்',
    approve: 'ஒப்புதல்',
    reject: 'நிராகரி',
    adminRemarks: 'அட்மின் குறிப்பு',
    originalStatus: 'பழைய நிலை',
    requestedStatus: 'கோரிய நிலை',
    correctionDate: 'தேதி',
    // General
    save: 'சேமி', cancel: 'ரத்து', edit: 'திருத்து', close: 'மூடு',
    search: 'தேடு', filter: 'வடிகட்டு', loading: 'ஏற்றுகிறது...',
    rank: 'பதவி', phone: 'மொபைல்', station: 'நிலையம்',
    month: 'மாதம்', year: 'ஆண்டு', date: 'தேதி',
    allEmployees: 'அனைவரும்',
    languageToggle: 'English',
  },
} as const;

type Translations = typeof T.en;

interface I18nCtx {
  lang: Lang;
  t: Translations;
  toggle: () => void;
}

const I18nContext = createContext<I18nCtx>({ lang: 'en', t: T.en, toggle: () => {} });

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('marine_lang') as Lang) || 'en');
  const toggle = () => {
    const next: Lang = lang === 'en' ? 'ta' : 'en';
    setLang(next);
    localStorage.setItem('marine_lang', next);
  };
  return <I18nContext.Provider value={{ lang, t: T[lang] as Translations, toggle }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
