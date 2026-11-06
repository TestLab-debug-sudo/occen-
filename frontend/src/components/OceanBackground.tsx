import React from 'react';

const OceanBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #082F49 0%, #063B5C 35%, #0a5278 60%, #0d6b8a 75%, #1a8fb0 90%, #27C5C1 100%)',
        }}
      />

      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            background: 'white',
            top: Math.random() * 40 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.6 + 0.2,
            animation: `pulse-glow ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Clouds */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${8 + i * 6}%`,
            animation: `cloud-drift ${35 + i * 10}s linear infinite`,
            animationDelay: `${i * 12}s`,
            opacity: 0.15,
          }}
        >
          <svg width="180" height="60" viewBox="0 0 180 60">
            <ellipse cx="90" cy="40" rx="70" ry="20" fill="white" />
            <ellipse cx="60" cy="35" rx="40" ry="22" fill="white" />
            <ellipse cx="120" cy="32" rx="45" ry="24" fill="white" />
            <ellipse cx="90" cy="28" rx="35" ry="20" fill="white" />
          </svg>
        </div>
      ))}

      {/* Ocean / sea area */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '38%', background: 'linear-gradient(180deg, rgba(6,59,92,0.2) 0%, rgba(6,40,68,0.8) 100%)' }}
      />

      {/* Wave layers */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '180px' }}>
        {/* Wave 3 (back) */}
        <div
          className="absolute bottom-0"
          style={{ width: '200%', height: '100px', animationDelay: '2s' }}
        >
          <div className="animate-wave2 absolute w-full h-full">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path
                d="M0,60 C180,30 360,90 540,60 C720,30 900,90 1080,60 C1260,30 1440,70 1440,60 L1440,100 L0,100 Z"
                fill="rgba(6,59,92,0.4)"
              />
            </svg>
          </div>
        </div>

        {/* Wave 2 (mid) */}
        <div className="absolute bottom-0" style={{ width: '200%', height: '100px' }}>
          <div className="animate-wave absolute w-full h-full" style={{ animationDuration: '7s' }}>
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path
                d="M0,50 C240,20 480,80 720,50 C960,20 1200,80 1440,50 L1440,100 L0,100 Z"
                fill="rgba(10,82,120,0.6)"
              />
            </svg>
          </div>
        </div>

        {/* Wave 1 (front) */}
        <div className="absolute bottom-0" style={{ width: '200%', height: '100px' }}>
          <div className="animate-wave absolute w-full h-full" style={{ animationDuration: '5s' }}>
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path
                d="M0,40 C180,60 360,20 540,40 C720,60 900,20 1080,40 C1260,60 1440,30 1440,40 L1440,100 L0,100 Z"
                fill="rgba(6,40,68,0.9)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Animated seagulls */}
      <div className="animate-seagull absolute" style={{ top: '22%' }}>
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
          <path d="M20,10 Q10,2 0,8" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M20,10 Q30,2 40,8" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className="animate-seagull absolute" style={{ top: '18%', animationDelay: '8s', animationDuration: '25s' }}>
        <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
          <path d="M14,7 Q7,2 0,6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M14,7 Q21,2 28,6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Floating boat silhouette */}
      <div
        className="absolute animate-bobbing"
        style={{ bottom: '12%', right: '15%', opacity: 0.25, animationDuration: '4s' }}
      >
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
          <path d="M10,25 L15,10 L20,8 L25,10 L30,25" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.1)" />
          <path d="M5,28 L75,28 L65,35 L15,35 Z" fill="rgba(255,255,255,0.15)" />
          <line x1="22" y1="8" x2="22" y2="28" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      {/* Shimmer / reflection on water */}
      <div
        className="absolute"
        style={{
          bottom: '8%',
          left: '20%',
          width: '60%',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, rgba(39,197,193,0.3), transparent)',
          borderRadius: '2px',
          animation: 'shimmer 3s linear infinite',
          backgroundSize: '200% auto',
        }}
      />
    </div>
  );
};

export default OceanBackground;
