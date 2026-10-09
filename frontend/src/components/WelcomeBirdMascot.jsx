import React, { useState, useEffect } from 'react';
import { Sparkles, Mail, X } from 'lucide-react';

export default function WelcomeBirdMascot({ onComplete }) {
  const [phase, setPhase] = useState('bouncing'); // 'bouncing' -> 'flying' -> 'finished'

  useEffect(() => {
    // 1. Initial bounce & greeting phase for 2.6s
    const flyTimer = setTimeout(() => {
      setPhase('flying');
    }, 2800);

    // 2. Flight animation duration (approx 850ms) then complete
    const finishTimer = setTimeout(() => {
      setPhase('finished');
      onComplete?.();
    }, 3650);

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const handleSkipOrClick = () => {
    if (phase === 'finished') return;
    setPhase('flying');
    setTimeout(() => {
      setPhase('finished');
      onComplete?.();
    }, 500);
  };

  if (phase === 'finished') return null;

  return (
    <div
      onClick={handleSkipOrClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: phase === 'flying' ? 'rgba(251, 246, 247, 0)' : 'rgba(59, 33, 48, 0.42)',
        backdropFilter: phase === 'flying' ? 'none' : 'blur(4px)',
        transition: 'background-color 0.8s ease, backdrop-filter 0.8s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleSkipOrClick();
        }}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 14px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--ink-soft)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span>Skip</span>
        <X size={13} />
      </button>

      {/* Bird + Speech Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          animation: phase === 'flying' ? 'birdFlyAway 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards' : 'none',
        }}
      >
        {/* Cute Speech Bubble */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '16px 24px',
            maxWidth: '380px',
            textAlign: 'center',
            boxShadow: '0 12px 32px rgba(74, 38, 50, 0.16)',
            border: '2px solid rgba(183, 110, 121, 0.25)',
            position: 'relative',
            animation: 'speechBubblePop 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={16} color="var(--rose)" />
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, color: 'var(--rose-deep)' }}>
              SmartMail AI
            </span>
            <Sparkles size={16} color="var(--rose)" />
          </div>
          
          <p
            style={{
              fontSize: '1.02rem',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            "Hey, welcome to SmartMail AI! Let's make your inbox a little easier to manage."
          </p>

          {/* Speech bubble tail pointer */}
          <div
            style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #FFFFFF',
            }}
          />
        </div>

        {/* Mascot Bird SVG Animation Container */}
        <div
          style={{
            position: 'relative',
            animation: phase === 'bouncing' ? 'birdBounce 1.4s ease-in-out infinite' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Sparkles around bird */}
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              right: '-14px',
              animation: 'sparkleGlow 1.8s ease-in-out infinite',
            }}
          >
            ✨
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '-16px',
              animation: 'sparkleGlow 2.1s ease-in-out 0.4s infinite',
            }}
          >
            💌
          </div>

          {/* Adorable Vector Bird */}
          <svg
            width="120"
            height="110"
            viewBox="0 0 120 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(139, 74, 90, 0.22))' }}
          >
            {/* Tail feathers */}
            <path
              d="M24 64C14 62 8 70 12 78C18 84 28 78 34 72Z"
              fill="#E6D8FF"
            />
            <path
              d="M18 56C8 52 4 60 8 68C14 74 24 68 30 62Z"
              fill="#F4C2C2"
            />

            {/* Bird Body */}
            <ellipse
              cx="62"
              cy="62"
              rx="36"
              ry="32"
              fill="url(#bird_body_grad)"
            />

            {/* Belly highlight */}
            <ellipse
              cx="66"
              cy="68"
              rx="24"
              ry="22"
              fill="#FFF2F4"
            />

            {/* Head */}
            <circle
              cx="78"
              cy="42"
              r="24"
              fill="url(#bird_head_grad)"
            />

            {/* Rosy Cheeks */}
            <circle
              cx="82"
              cy="48"
              r="6.5"
              fill="#F4A6B2"
              opacity="0.75"
            />

            {/* Big Kawaii Eye */}
            <circle cx="86" cy="38" r="6" fill="#3B2130" />
            <circle cx="88" cy="36" r="2.2" fill="#FFFFFF" />
            <circle cx="84.5" cy="40" r="1.2" fill="#FFFFFF" />

            {/* Cute Yellow Beak */}
            <path
              d="M98 42L112 45L98 50Z"
              fill="#FFB347"
            />

            {/* Tiny Letter in Beak */}
            <g transform="translate(94, 46) rotate(12)">
              <rect width="18" height="13" rx="2.5" fill="#FFFFFF" stroke="#B76E79" strokeWidth="1.2" />
              <path d="M0 0L9 7L18 0" stroke="#B76E79" strokeWidth="1.2" fill="none" />
            </g>

            {/* Fluttering Wing */}
            <g
              style={{
                transformOrigin: '48px 58px',
                animation: 'birdWingWave 0.35s ease-in-out infinite',
              }}
            >
              <path
                d="M48 56C36 48 30 32 44 26C58 20 68 36 62 58C56 66 52 62 48 56Z"
                fill="url(#bird_wing_grad)"
              />
              <path
                d="M44 48C38 42 34 32 44 28C52 24 58 36 54 50Z"
                fill="#FFFFFF"
                opacity="0.35"
              />
            </g>

            {/* Cute little feet */}
            <path d="M52 92L48 98M52 92L52 99M52 92L56 98" stroke="#FF9E44" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M70 92L66 98M70 92L70 99M70 92L74 98" stroke="#FF9E44" strokeWidth="2.5" strokeLinecap="round" />

            {/* Gradients */}
            <defs>
              <linearGradient id="bird_body_grad" x1="26" y1="30" x2="98" y2="94" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F9ECEE" />
                <stop offset="0.55" stopColor="#F4C2C2" />
                <stop offset="1" stopColor="#B76E79" />
              </linearGradient>
              <linearGradient id="bird_head_grad" x1="54" y1="18" x2="102" y2="66" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF0F2" />
                <stop offset="0.7" stopColor="#F4C2C2" />
                <stop offset="1" stopColor="#B76E79" />
              </linearGradient>
              <linearGradient id="bird_wing_grad" x1="34" y1="22" x2="68" y2="62" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E6D8FF" />
                <stop offset="0.7" stopColor="#B76E79" />
                <stop offset="1" stopColor="#8B4A5A" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Small subtitle prompt */}
        <div
          style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.92)',
            textShadow: '0 1px 4px rgba(59, 33, 48, 0.6)',
            fontWeight: 500,
          }}
        >
          Tap anywhere to start
        </div>
      </div>
    </div>
  );
}
