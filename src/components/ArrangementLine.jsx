import React, { useId } from 'react';

export const LINE_STYLE_PAIRS = [
  {
    category: 'Plná',
    thin: { key: 'solid', label: 'Plná tenká', strokeWidth: 2 },
    thick: { key: 'solid-thick', label: 'Plná tlustá', strokeWidth: 8 }
  },
  {
    category: 'Čárkovaná',
    thin: { key: 'dashed', label: 'Čárkovaná tenká', strokeWidth: 2 },
    thick: { key: 'dashed-thick', label: 'Čárkovaná tlustá', strokeWidth: 8 }
  },
  {
    category: 'Tečkovaná',
    thin: { key: 'dotted', label: 'Tečkovaná tenká', strokeWidth: 2.5 },
    thick: { key: 'dotted-thick', label: 'Tečkovaná tlustá', strokeWidth: 8 }
  },
  {
    category: 'Vlnovka',
    thin: { key: 'wavy', label: 'Vlnovka tenká', strokeWidth: 2 },
    thick: { key: 'wavy-thick', label: 'Vlnovka tlustá', strokeWidth: 8 }
  },
  {
    category: 'Cikcak',
    thin: { key: 'zigzag', label: 'Cikcak tenký', strokeWidth: 2 },
    thick: { key: 'zigzag-thick', label: 'Cikcak tlustý', strokeWidth: 8 }
  },
  {
    category: 'Dynamika',
    thin: { key: 'crescendo', label: 'Crescendo (piano → forte)', isDynamic: true },
    thick: { key: 'decrescendo', label: 'Decrescendo (forte → piano)', isDynamic: true }
  }
];

export const SEGMENT_PRESETS = [
  { key: 'full', label: 'Celá čára', desc: 'Hraje celou část bez přerušení' },
  { key: 'start-to-q1', label: 'Konec v 1/4', desc: 'Hraje od začátku po 1. čtvrtinu (stop v 1/4)' },
  { key: 'q1-to-end', label: 'Nástup v 1/4', desc: 'Nástup v 1. čtvrtině a hraje do konce' },
  { key: 'start-to-q3', label: 'Konec ve 3/4', desc: 'Hraje od začátku po 3. čtvrtinu (stop ve 3/4)' },
  { key: 'q3-to-end', label: 'Nástup ve 3/4', desc: 'Nástup ve 3. čtvrtině a hraje do konce' },
  { key: 'q1-to-q3', label: 'Interval 1/4 – 3/4', desc: 'Hraje pouze mezi 1. a 3. čtvrtinou' }
];

export default function ArrangementLine({ 
  style = 'solid', 
  segmentMode = 'full',
  dotStart = false, 
  dotEnd = false,
  color = '#60a5fa' 
}) {
  const uid = useId().replace(/:/g, '');

  // Calculate Y-range percentages
  let y1 = 0;
  let y2 = 100;
  let hasDotQ1 = false;
  let hasDotQ3 = false;

  switch (segmentMode) {
    case 'start-to-q1':
      y1 = 0;
      y2 = 25;
      hasDotQ1 = true;
      break;
    case 'q1-to-end':
      y1 = 25;
      y2 = 100;
      hasDotQ1 = true;
      break;
    case 'start-to-q3':
      y1 = 0;
      y2 = 75;
      hasDotQ3 = true;
      break;
    case 'q3-to-end':
      y1 = 75;
      y2 = 100;
      hasDotQ3 = true;
      break;
    case 'q1-to-q3':
      y1 = 25;
      y2 = 75;
      hasDotQ1 = true;
      hasDotQ3 = true;
      break;
    case 'full':
    default:
      y1 = 0;
      y2 = 100;
      break;
  }

  if (style === 'empty') {
    return (
      <div className="arr-line-wrapper">
        <div className="arr-line-guide" />
        {dotStart && <div className="arr-line-dot start" style={{ background: color }} />}
        {dotEnd && <div className="arr-line-dot end" style={{ background: color }} />}
      </div>
    );
  }

  const renderShape = () => {
    switch (style) {
      case 'solid':
        return (
          <line 
            x1="12" y1={`${y1}%`} 
            x2="12" y2={`${y2}%`} 
            stroke={color} strokeWidth="2" 
          />
        );
      case 'solid-thick':
        return (
          <line 
            x1="12" y1={`${y1}%`} 
            x2="12" y2={`${y2}%`} 
            stroke={color} strokeWidth="8" strokeLinecap="square"
          />
        );
      case 'dashed':
        return (
          <line 
            x1="12" y1={`${y1}%`} 
            x2="12" y2={`${y2}%`} 
            stroke={color} strokeWidth="2" strokeDasharray="6,6" 
          />
        );
      case 'dashed-thick':
        return (
          <line 
            x1="12" y1={`${y1}%`} 
            x2="12" y2={`${y2}%`} 
            stroke={color} strokeWidth="8" strokeDasharray="8,6" 
          />
        );
      case 'dotted':
        return (
          <line 
            x1="12" y1={`${y1}%`} 
            x2="12" y2={`${y2}%`} 
            stroke={color} strokeWidth="2.5" strokeDasharray="2,6" strokeLinecap="round" 
          />
        );
      case 'dotted-thick':
        return (
          <line 
            x1="12" y1={`${y1}%`} 
            x2="12" y2={`${y2}%`} 
            stroke={color} strokeWidth="8" strokeDasharray="2,9" strokeLinecap="round" 
          />
        );

      case 'wavy': {
        const patId = `wave-thin-${uid}`;
        return (
          <>
            <defs>
              <pattern id={patId} width="24" height="20" patternUnits="userSpaceOnUse">
                <path d="M12,0 C17,5 17,5 12,10 C7,15 7,15 12,20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
              </pattern>
            </defs>
            <rect x="0" y={`${y1}%`} width="24" height={`${y2 - y1}%`} fill={`url(#${patId})`} />
          </>
        );
      }

      case 'wavy-thick': {
        const patId = `wave-thick-${uid}`;
        return (
          <>
            <defs>
              <pattern id={patId} width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M12,0 C19,6 19,6 12,12 C5,18 5,18 12,24" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
              </pattern>
            </defs>
            <rect x="0" y={`${y1}%`} width="24" height={`${y2 - y1}%`} fill={`url(#${patId})`} />
          </>
        );
      }

      case 'zigzag': {
        const patId = `zz-thin-${uid}`;
        return (
          <>
            <defs>
              <pattern id={patId} width="24" height="16" patternUnits="userSpaceOnUse">
                <path d="M12,0 L18,4 L6,12 L12,16" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              </pattern>
            </defs>
            <rect x="0" y={`${y1}%`} width="24" height={`${y2 - y1}%`} fill={`url(#${patId})`} />
          </>
        );
      }

      case 'zigzag-thick': {
        const patId = `zz-thick-${uid}`;
        return (
          <>
            <defs>
              <pattern id={patId} width="24" height="20" patternUnits="userSpaceOnUse">
                <path d="M12,0 L19,5 L5,15 L12,20" fill="none" stroke={color} strokeWidth="6.5" strokeLinejoin="round" strokeLinecap="round" />
              </pattern>
            </defs>
            <rect x="0" y={`${y1}%`} width="24" height={`${y2 - y1}%`} fill={`url(#${patId})`} />
          </>
        );
      }

      case 'crescendo': {
        // Tapering: 2px (x: 11..13) at top -> 8px (x: 8..16) at bottom
        // Clipped to segment if needed
        const clipId = `clip-cresc-${uid}`;
        return (
          <>
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y={`${y1}%`} width="24" height={`${y2 - y1}%`} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <svg width="24" height="100%" viewBox="0 0 24 100" preserveAspectRatio="none">
                <polygon points="11,0 13,0 16,100 8,100" fill={color} />
              </svg>
            </g>
          </>
        );
      }

      case 'decrescendo': {
        // Tapering: 8px (x: 8..16) at top -> 2px (x: 11..13) at bottom
        const clipId = `clip-decresc-${uid}`;
        return (
          <>
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y={`${y1}%`} width="24" height={`${y2 - y1}%`} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <svg width="24" height="100%" viewBox="0 0 24 100" preserveAspectRatio="none">
                <polygon points="8,0 16,0 13,100 11,100" fill={color} />
              </svg>
            </g>
          </>
        );
      }

      default:
        return <line x1="12" y1={`${y1}%`} x2="12" y2={`${y2}%`} stroke={color} strokeWidth="2" />;
    }
  };

  return (
    <div className="arr-line-wrapper">
      {/* Background guide line when segment is partial */}
      {segmentMode !== 'full' && (
        <div className="arr-line-guide" />
      )}

      <svg 
        width="24" 
        height="100%" 
        style={{ display: 'block', overflow: 'hidden' }}
      >
        {renderShape()}
      </svg>

      {/* Quarter dots at 25% and 75% */}
      {hasDotQ1 && (
        <div 
          className="arr-line-dot-quarter q1" 
          style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: color,
            zIndex: 5,
            boxShadow: `0 0 6px ${color}80`
          }} 
        />
      )}
      {hasDotQ3 && (
        <div 
          className="arr-line-dot-quarter q3" 
          style={{
            position: 'absolute',
            top: '75%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: color,
            zIndex: 5,
            boxShadow: `0 0 6px ${color}80`
          }} 
        />
      )}

      {/* Legacy edge dots if present */}
      {dotStart && <div className="arr-line-dot start" style={{ background: color }} />}
      {dotEnd && <div className="arr-line-dot end" style={{ background: color }} />}
    </div>
  );
}
