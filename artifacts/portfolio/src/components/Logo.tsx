export default function Logo() {
  return (
    <svg
      width="190"
      height="58"
      viewBox="0 0 190 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Constance Gordon"
      role="img"
    >
      <defs>
        <filter id="logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#000000" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* Thin top rule */}
      <line x1="0" y1="1" x2="190" y2="1" stroke="white" strokeWidth="0.8" strokeOpacity="0.6"/>

      {/* CONSTANCE — light weight, wide tracking */}
      <text
        x="0"
        y="20"
        fontFamily="'Roboto', Helvetica, Arial, sans-serif"
        fontSize="12.5"
        fontWeight="300"
        letterSpacing="5.5"
        fill="white"
        filter="url(#logo-shadow)"
      >
        CONSTANCE
      </text>

      {/* GORDON — bold, wider tracking, larger */}
      <text
        x="0"
        y="38"
        fontFamily="'Roboto', Helvetica, Arial, sans-serif"
        fontSize="17"
        fontWeight="700"
        letterSpacing="7"
        fill="white"
        filter="url(#logo-shadow)"
      >
        GORDON
      </text>

      {/* Thin bottom rule */}
      <line x1="0" y1="44" x2="190" y2="44" stroke="white" strokeWidth="0.8" strokeOpacity="0.6"/>

      {/* ACTOR — tiny spaced caps */}
      <text
        x="0"
        y="55"
        fontFamily="'Roboto', Helvetica, Arial, sans-serif"
        fontSize="7.5"
        fontWeight="400"
        letterSpacing="6"
        fill="white"
        fillOpacity="0.65"
      >
        ACTOR
      </text>

      {/* Small accent dot — right of tagline */}
      <circle cx="183" cy="51.5" r="1.3" fill="white" fillOpacity="0.4"/>
    </svg>
  );
}
