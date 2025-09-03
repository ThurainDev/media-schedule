import React from 'react';

/**
 * WaveBackground renders a decorative layered wave header similar to the provided design.
 * Use as a full-page background. Pass Tailwind classes via className to control size.
 */
export default function WaveBackground({ className = "h-screen" }) {
  return (
    <div className={`w-full overflow-hidden bg-[#0B192C] ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="deepBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B192C" />
            <stop offset="100%" stopColor="#0B4D8C" />
          </linearGradient>
          <linearGradient id="midBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1693F2" />
            <stop offset="100%" stopColor="#0B7CD3" />
          </linearGradient>
          <linearGradient id="warmYellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDB21A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feOffset dx="0" dy="2" result="offsetBlur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top deep blue background arc (taller) */}
        <path
          d="M0,120 C240,200 520,120 760,160 C1040,210 1220,180 1440,210 L1440,0 L0,0 Z"
          fill="url(#deepBlue)"
        />

        {/* Dark band to match screenshot */}
        <path
          d="M0,220 C260,300 560,220 860,260 C1160,300 1320,270 1440,290 L1440,360 L0,360 Z"
          fill="#0C1B2A"
        />

        {/* Middle bright blue wave */}
        <path
          d="M0,360 C260,430 540,360 820,400 C1100,440 1270,420 1440,440 L1440,620 L0,620 Z"
          fill="url(#midBlue)"
          filter="url(#softShadow)"
        />

        {/* Bottom warm yellow wave filling lower section */}
        <path
          d="M0,540 C300,610 700,560 980,590 C1260,620 1380,600 1440,620 L1440,900 L0,900 Z"
          fill="url(#deepBlue)"
        />

        {/* Optional white overlay to ensure seamless transition if content area is white */}
        <path d="M0,780 L1440,780 L1440,900 L0,900 Z" fill="#ffffff" opacity="0" />
      </svg>
    </div>
  );
}