// CategoryCover.jsx
// Drop-in replacement for the emoji icon covers.
// Usage:  <CategoryCover category={article.category} size="card" />
// size = "card"  → full banner (used in article grid cards)
// size = "thumb" → 48×48 thumbnail (used in admin table)

import React from 'react';

/* ─── Per-category SVG patterns ───────────────────────────────────────── */

const patterns = {

  'Maternal & Infant Care': ({ w, h }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mic-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#mic-bg)" />
      {/* concentric soft rings */}
      {[0.9, 0.7, 0.5, 0.3].map((r, i) => (
        <circle key={i} cx={w * 0.35} cy={h * 0.55} r={Math.min(w, h) * r * 0.55}
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={i === 0 ? 1 : 2} />
      ))}
      {/* small dot cluster — top right */}
      {[[0.72, 0.18],[0.8, 0.12],[0.88, 0.2],[0.76, 0.28],[0.84, 0.3]].map(([x, y], i) => (
        <circle key={i} cx={w * x} cy={h * y} r={3 + i % 2} fill="rgba(255,255,255,0.35)" />
      ))}
      {/* wave line */}
      <path d={`M0 ${h * 0.78} Q${w * 0.25} ${h * 0.62} ${w * 0.5} ${h * 0.78} T${w} ${h * 0.78}`}
        fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      <path d={`M0 ${h * 0.88} Q${w * 0.25} ${h * 0.72} ${w * 0.5} ${h * 0.88} T${w} ${h * 0.88}`}
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    </svg>
  ),

  'Mental Health': ({ w, h }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mh-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#mh-bg)" />
      {/* diagonal grid */}
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i}
          x1={-w + i * w * 0.25} y1={0} x2={i * w * 0.25} y2={h}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {/* neuron-like nodes */}
      {[[0.2,0.3],[0.5,0.2],[0.75,0.4],[0.6,0.65],[0.3,0.7]].map(([x,y],i) => (
        <g key={i}>
          <circle cx={w*x} cy={h*y} r={5} fill="rgba(255,255,255,0.7)" />
          <circle cx={w*x} cy={h*y} r={12} fill="rgba(255,255,255,0.1)" />
        </g>
      ))}
      {/* connector lines */}
      {[[0.2,0.3,0.5,0.2],[0.5,0.2,0.75,0.4],[0.75,0.4,0.6,0.65],[0.6,0.65,0.3,0.7],[0.3,0.7,0.2,0.3],[0.5,0.2,0.6,0.65]].map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={w*x1} y1={h*y1} x2={w*x2} y2={h*y2}
          stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      ))}
    </svg>
  ),

  'Nutrition': ({ w, h }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nut-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#nut-bg)" />
      {/* hexagonal grid */}
      {[[0.15,0.25],[0.45,0.15],[0.75,0.3],[0.3,0.55],[0.6,0.5],[0.85,0.65],[0.15,0.75],[0.5,0.8]].map(([x,y],i) => {
        const cx = w*x, cy = h*y, r = 14 + (i%3)*4;
        const pts = Array.from({length:6},(_,k)=>{
          const a=Math.PI/180*(60*k-30);
          return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;
        }).join(' ');
        return <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />;
      })}
      {/* diagonal stripe */}
      <line x1={w} y1={0} x2={0} y2={h} stroke="rgba(255,255,255,0.08)" strokeWidth={w * 0.18} />
    </svg>
  ),

  'Fitness': ({ w, h }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fit-bg" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#fit-bg)" />
      {/* speed lines */}
      {Array.from({length:7}).map((_,i) => (
        <line key={i}
          x1={0} y1={h*(0.1 + i*0.13)}
          x2={w*(0.4 + i*0.08)} y2={h*(0.1 + i*0.13)}
          stroke="rgba(255,255,255,0.2)" strokeWidth={2 - i*0.1} />
      ))}
      {/* dynamic arcs */}
      <path d={`M${w*0.5} ${h} A${w*0.5} ${h*0.6} 0 0 1 ${w} ${h*0.3}`}
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
      <path d={`M${w*0.3} ${h} A${w*0.4} ${h*0.5} 0 0 1 ${w*0.95} ${h*0.1}`}
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      {/* pulse dot */}
      <circle cx={w*0.82} cy={h*0.22} r={7} fill="rgba(255,255,255,0.6)" />
      <circle cx={w*0.82} cy={h*0.22} r={14} fill="rgba(255,255,255,0.15)" />
    </svg>
  ),

  'Disease Prevention': ({ w, h }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dp-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#dp-bg)" />
      {/* shield-like geometry */}
      {[1,0.75,0.5].map((scale, i) => {
        const cx = w*0.5, cy = h*0.45;
        const sw = w*0.35*scale, sh = h*0.45*scale;
        return (
          <path key={i}
            d={`M${cx} ${cy-sh} L${cx+sw} ${cy-sh*0.3} L${cx+sw} ${cy+sh*0.2} Q${cx} ${cy+sh} ${cx-sw} ${cy+sh*0.2} L${cx-sw} ${cy-sh*0.3} Z`}
            fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={i===0?1:1.5} />
        );
      })}
      {/* scattered dots */}
      {[[0.1,0.15],[0.9,0.1],[0.85,0.8],[0.12,0.85],[0.5,0.05]].map(([x,y],i) => (
        <circle key={i} cx={w*x} cy={h*y} r={3} fill="rgba(255,255,255,0.3)" />
      ))}
    </svg>
  ),

  'Sleep Health': ({ w, h }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sh-bg" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#sh-bg)" />
      {/* star field */}
      {[[0.1,0.1],[0.3,0.05],[0.6,0.12],[0.8,0.08],[0.15,0.35],[0.5,0.28],[0.9,0.3],[0.7,0.55],[0.25,0.6],[0.05,0.7],[0.45,0.72],[0.85,0.68]].map(([x,y],i) => (
        <circle key={i} cx={w*x} cy={h*y} r={1 + (i%3) * 0.7} fill="rgba(255,255,255,0.7)" />
      ))}
      {/* crescent moon shape */}
      <circle cx={w*0.72} cy={h*0.38} r={h*0.22} fill="rgba(255,255,255,0.12)" />
      <circle cx={w*0.8} cy={h*0.32} r={h*0.18} fill="url(#sh-bg)" />
      {/* soft horizon glow */}
      <ellipse cx={w*0.5} cy={h} rx={w*0.6} ry={h*0.25} fill="rgba(99,102,241,0.3)" />
    </svg>
  ),

  'Campus Wellness': ({ w, h }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cw-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#cw-bg)" />
      {/* flowing organic curves */}
      <path d={`M0 ${h*0.6} C${w*0.2} ${h*0.3} ${w*0.4} ${h*0.7} ${w*0.6} ${h*0.4} S${w*0.9} ${h*0.2} ${w} ${h*0.5}`}
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
      <path d={`M0 ${h*0.8} C${w*0.3} ${h*0.5} ${w*0.5} ${h*0.9} ${w*0.7} ${h*0.6} S${w*0.9} ${h*0.5} ${w} ${h*0.7}`}
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      {/* leaf shapes */}
      {[[0.15,0.2,25],[0.75,0.15,18],[0.55,0.7,20]].map(([x,y,r],i) => (
        <ellipse key={i} cx={w*x} cy={h*y} rx={r} ry={r*0.55}
          fill="rgba(255,255,255,0.15)" transform={`rotate(${30+i*40} ${w*x} ${h*y})`} />
      ))}
    </svg>
  ),
};

/* ─── Fallback pattern for firebase / unknown categories ──────────────── */
const FallbackPattern = ({ w, h }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0A4D3C" />
        <stop offset="100%" stopColor="#0F6B52" />
      </linearGradient>
    </defs>
    <rect width={w} height={h} fill="url(#fb-bg)" />
    {Array.from({length:5}).map((_,i) => (
      <rect key={i}
        x={w*(0.1+i*0.18)} y={h*0.1} width={w*0.08} height={h*0.8}
        rx={4} fill="rgba(255,255,255,0.07)" transform={`rotate(${i*6} ${w/2} ${h/2})`} />
    ))}
    {[0.3,0.55,0.8].map((r,i) => (
      <circle key={i} cx={w*0.5} cy={h*0.5} r={Math.min(w,h)*r*0.45}
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
    ))}
  </svg>
);

/* ─── Main component ──────────────────────────────────────────────────── */
export default function CategoryCover({ category, size = 'card', style = {} }) {
  const isThumb = size === 'thumb';
  const w = isThumb ? 48 : 400;
  const h = isThumb ? 48 : 140;

  const Pattern = patterns[category] || FallbackPattern;

  return (
    <div style={{
      width: isThumb ? 48 : '100%',
      height: h,
      borderRadius: isThumb ? 10 : 0,
      overflow: 'hidden',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'stretch',
      ...style,
    }}>
      <Pattern w={w} h={h} />
    </div>
  );
}