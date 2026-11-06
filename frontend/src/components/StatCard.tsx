import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  delay?: number;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, delay = 0, trend }) => {
  const prevValue = useRef(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-5 relative overflow-hidden"
      style={{ borderTop: `3px solid ${color}` }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at top right, ${color}, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          {trend !== undefined && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: trend >= 0 ? 'rgba(54,185,155,0.2)' : 'rgba(239,68,68,0.2)',
                color: trend >= 0 ? '#36B99B' : '#ef4444',
              }}
            >
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>

        <motion.div
          key={String(value)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-1"
        >
          {value}
        </motion.div>
        <div className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{title}</div>
        {subtitle && (
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
