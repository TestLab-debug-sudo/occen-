import React from 'react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
  // Boat statuses
  'Docked at Harbour': { bg: 'rgba(54,185,155,0.15)', text: '#36B99B', dot: '#36B99B' },
  'Currently at Sea': { bg: 'rgba(39,197,193,0.15)', text: '#27C5C1', dot: '#27C5C1' },
  'Preparing for Departure': { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', dot: '#fbbf24' },
  'Departed': { bg: 'rgba(39,197,193,0.15)', text: '#27C5C1', dot: '#27C5C1' },
  'Returning to Harbour': { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', dot: '#818cf8' },
  'Arrived at Harbour': { bg: 'rgba(54,185,155,0.15)', text: '#36B99B', dot: '#36B99B' },
  'Under Maintenance': { bg: 'rgba(255,135,94,0.15)', text: '#FF875E', dot: '#FF875E' },
  'Out of Service': { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', dot: '#ef4444' },
  // Employee statuses
  'Available on Shore': { bg: 'rgba(54,185,155,0.15)', text: '#36B99B', dot: '#36B99B' },
  'At Sea': { bg: 'rgba(39,197,193,0.15)', text: '#27C5C1', dot: '#27C5C1' },
  'On Leave': { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', dot: '#fbbf24' },
  'Absent': { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', dot: '#ef4444' },
  'Off Duty': { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', dot: '#9ca3af' },
  // Attendance
  'Present': { bg: 'rgba(54,185,155,0.15)', text: '#36B99B', dot: '#36B99B' },
  'Late Arrival': { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', dot: '#fbbf24' },
  'Half Day': { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', dot: '#818cf8' },
  'Returned from Sea': { bg: 'rgba(54,185,155,0.15)', text: '#36B99B', dot: '#36B99B' },
  'Weekly Off': { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', dot: '#9ca3af' },
  // Leave/Trip statuses
  'Pending': { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', dot: '#fbbf24' },
  'Approved': { bg: 'rgba(54,185,155,0.15)', text: '#36B99B', dot: '#36B99B' },
  'Rejected': { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', dot: '#ef4444' },
  'Cancelled': { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', dot: '#9ca3af' },
  'Scheduled': { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', dot: '#818cf8' },
  'Crew Assigned': { bg: 'rgba(39,197,193,0.15)', text: '#27C5C1', dot: '#27C5C1' },
  'Preparing': { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', dot: '#fbbf24' },
  'Completed': { bg: 'rgba(54,185,155,0.15)', text: '#36B99B', dot: '#36B99B' },
  'Delayed': { bg: 'rgba(255,135,94,0.15)', text: '#FF875E', dot: '#FF875E' },
  'Returning': { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', dot: '#818cf8' },
  'Arrived': { bg: 'rgba(54,185,155,0.15)', text: '#36B99B', dot: '#36B99B' },
  // Employee employment
  'Active': { bg: 'rgba(54,185,155,0.15)', text: '#36B99B', dot: '#36B99B' },
  'Inactive': { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', dot: '#9ca3af' },
  'Terminated': { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', dot: '#ef4444' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const colors = colorMap[status] || { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', dot: '#9ca3af' };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium"
      style={{
        background: colors.bg,
        color: colors.text,
        padding: size === 'sm' ? '3px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
      }}
    >
      <span className="rounded-full" style={{ width: 5, height: 5, background: colors.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

export default StatusBadge;
