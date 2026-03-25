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
      {/* Golden semicircle arc */}
      <path
        d="M 10 115 A 90 90 0 0 1 190 115 Z"
        fill="#D4A843"
        className={animated ? "animate-float" : ""}
      />

      {/* White mountain silhouette with two dramatic peaks */}
      <path
        d="M 10 115 L 28 92 L 42 100 L 56 74 L 68 84 L 78 56 L 85 35 L 92 48 L 100 42 L 108 52 L 115 50 L 124 62 L 136 78 L 150 90 L 165 100 L 190 115 Z"
        fill="white"
      />
    </svg>
  );
};

export default Logo;
