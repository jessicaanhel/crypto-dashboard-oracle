import React from 'react';

// Colours picked from the BrownBro logo
const BODY = '#f2ab8c';
const BODY_SHADE = '#e3906f';
const HORN = '#d8836a';
const HORN_LINE = '#b5604a';
const DARK = '#11131a';

const ANIMATIONS = `
  .oracle-bounce { transform-box: fill-box; transform-origin: bottom center; animation: oracle-bounce 2.6s ease-in-out infinite; }
  .oracle-third-eye { transform-box: fill-box; transform-origin: center; animation: oracle-blink 4s infinite; }
  .oracle-pupil { animation: oracle-look 6s ease-in-out infinite; }
  .oracle-mouth-talking { transform-box: fill-box; transform-origin: top center; animation: oracle-chomp 0.3s ease-in-out infinite; }
  @keyframes oracle-bounce {
    0%, 100% { transform: translateY(0) scale(1, 1); }
    45% { transform: translateY(-3px) scale(0.98, 1.02); }
    55% { transform: translateY(-3px) scale(0.98, 1.02); }
  }
  @keyframes oracle-blink { 0%, 90%, 100% { transform: scaleY(1); } 94% { transform: scaleY(0.1); } }
  @keyframes oracle-look {
    0%, 30%, 100% { transform: translateX(0); }
    40%, 55% { transform: translateX(-2.5px); }
    65%, 80% { transform: translateX(2.5px); }
  }
  @keyframes oracle-chomp { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.45); } }
  @media (prefers-reduced-motion: reduce) {
    .oracle-bounce, .oracle-third-eye, .oracle-pupil, .oracle-mouth-talking { animation: none; }
  }
`;

interface OracleAvatarProps {
  size?: number;
  // Mouth chomps while it is writing an answer
  talking?: boolean;
}

// Market Oracle: the BrownBro monster (three eyes, horns, two fangs), drawn as an animated SVG
export const OracleAvatar: React.FC<OracleAvatarProps> = ({ size = 64, talking = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    role="img"
    aria-label="Market Oracle"
    style={{ display: 'block', flexShrink: 0 }}
  >
    <style>{ANIMATIONS}</style>
    <circle cx="60" cy="60" r="60" fill="rgba(242,171,140,0.14)" />

    <g className="oracle-bounce">
      {/* Horns: two on top, two on the sides */}
      <path d="M40 36C34 26 33 16 38 8c7 5 11 15 11 27z" fill={HORN} />
      <path d="M80 36c6-10 7-20 2-28-7 5-11 15-11 27z" fill={HORN} />
      <path d="M27 58C15 54 9 44 9 34c9 1 17 8 21 18z" fill={HORN} />
      <path d="M93 58c12-4 18-14 18-24-9 1-17 8-21 18z" fill={HORN} />
      <path
        d="M38 18q5 1 8 4M82 18q-5 1-8 4M14 40q5 0 9 3M106 40q-5 0-9 3"
        stroke={HORN_LINE}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Body with a gap between the legs */}
      <path
        d="M24 62c0-25 15-36 36-36s36 11 36 36v36c0 5-3 8-8 8H73c0-8-5-13-13-13s-13 5-13 13H32c-5 0-8-3-8-8z"
        fill={BODY}
      />
      <circle cx="35" cy="44" r="7" fill={BODY_SHADE} opacity="0.55" />
      <circle cx="88" cy="86" r="5" fill={BODY_SHADE} opacity="0.55" />
      <circle cx="82" cy="38" r="3" fill={BODY_SHADE} opacity="0.55" />

      {/* Feet */}
      <path d="M26 104l-6 6h14zM40 104l-2 6h10zM94 104l6 6H86zM80 104l2 6H72z" fill={HORN} />

      {/* Little arms */}
      <path
        d="M38 76q-3 9 1 14M82 76q3 9-1 14"
        stroke={HORN_LINE}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Third eye on the forehead */}
      <g className="oracle-third-eye">
        <circle cx="60" cy="36" r="9" fill="#ffffff" />
        <ellipse cx="60" cy="36.5" rx="4.2" ry="5.6" fill={DARK} />
      </g>

      {/* Two grumpy eyes */}
      <ellipse cx="44" cy="58" rx="9" ry="7.5" fill="#ffffff" />
      <ellipse cx="76" cy="58" rx="9" ry="7.5" fill="#ffffff" />
      <g className="oracle-pupil">
        <circle cx="45" cy="59.5" r="4.4" fill={DARK} />
        <circle cx="75" cy="59.5" r="4.4" fill={DARK} />
      </g>
      {/* Heavy eyelids give the grumpy BrownBro look */}
      <path d="M33 47l23 7v-8z" fill={BODY_SHADE} />
      <path d="M87 47l-23 7v-8z" fill={BODY_SHADE} />

      {/* Grin with two fangs */}
      <g className={talking ? 'oracle-mouth-talking' : undefined}>
        <path d="M49 71q11 12 22 0z" fill={DARK} />
        <path d="M53 71l1.6 4 1.6-4zM64 71l1.6 4 1.6-4z" fill="#ffffff" />
      </g>
      <path d="M56 86h8" stroke={HORN_LINE} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  </svg>
);
