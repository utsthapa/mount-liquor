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

      {/* White mountain silhouette */}
      <path
        d="M 10 115 L 36 88 L 50 96 L 64 67 L 76 78 L 86 48 L 94 32 L 97 28 L 102 38 L 110 52 L 120 46 L 130 62 L 142 82 L 158 94 L 175 104 L 190 115 Z"
        fill="white"
      />
    </svg>
  );
};

export default Logo;
