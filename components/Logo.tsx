interface LogoProps {
  className?: string;
  animated?: boolean;
}

const Logo = ({ className = "w-16 h-16", animated = false }: LogoProps) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Mount Liquor Logo"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BEA98E" stopOpacity="1" />
          <stop offset="50%" stopColor="#D4C4A8" stopOpacity="1" />
          <stop offset="100%" stopColor="#BEA98E" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="navyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#082434" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#082434" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Mountain Peak - Left Side of M */}
      <path
        d="M 40 150 L 70 60 L 85 100 L 100 50 L 115 100 L 130 60 L 160 150 Z"
        fill="url(#goldGradient)"
        stroke="#BEA98E"
        strokeWidth="1.5"
        className={animated ? "animate-float" : ""}
      />

      {/* Inner Mountain Shadow - Creates depth */}
      <path
        d="M 70 60 L 85 100 L 100 50 L 115 100 L 130 60 L 145 120 L 100 120 L 55 120 Z"
        fill="url(#navyGradient)"
        opacity="0.4"
      />

      {/* Spirit Glass Silhouette - Negative Space Detail */}
      <g opacity="0.9">
        {/* Glass Bowl */}
        <ellipse
          cx="100"
          cy="105"
          rx="15"
          ry="12"
          fill="#082434"
          stroke="#BEA98E"
          strokeWidth="0.5"
        />
        {/* Glass Stem */}
        <rect
          x="97"
          y="105"
          width="6"
          height="18"
          fill="#082434"
          stroke="#BEA98E"
          strokeWidth="0.5"
        />
        {/* Glass Base */}
        <ellipse
          cx="100"
          cy="125"
          rx="10"
          ry="3"
          fill="#082434"
          stroke="#BEA98E"
          strokeWidth="0.5"
        />
      </g>

      {/* Accent Lines - Topographic Contours */}
      <line
        x1="50"
        y1="140"
        x2="150"
        y2="140"
        stroke="#BEA98E"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <line
        x1="55"
        y1="130"
        x2="145"
        y2="130"
        stroke="#BEA98E"
        strokeWidth="0.5"
        opacity="0.2"
      />
    </svg>
  );
};

export default Logo;
