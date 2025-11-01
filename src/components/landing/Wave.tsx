interface WaveProps {
  color?: string;
  flipped?: boolean;
  variant?: 1 | 2; // Wave variant (1 or 2)
}

export function Wave({ color = "var(--brand-blue)", flipped = false, variant = 1 }: WaveProps) {
  // Wave variant 1
  const wave1Path = "M0 55L37.5 51.3C75 47.7 150 40.3 225 56.3C300 72.3 375 111.7 450 112C525 112.3 600 73.7 675 67.2C750 60.7 825 86.3 862.5 99.2L900 112L900 0L862.5 0C825 0 750 0 675 0C600 0 525 0 450 0C375 0 300 0 225 0C150 0 75 0 37.5 0L0 0Z";
  
  // Wave variant 2
  const wave2Path = "M0 161L37.5 148.5C75 136 150 111 225 95.3C300 79.7 375 73.3 450 87.5C525 101.7 600 136.3 675 144.2C750 152 825 133 862.5 123.5L900 114L900 0L862.5 0C825 0 750 0 675 0C600 0 525 0 450 0C375 0 300 0 225 0C150 0 75 0 37.5 0L0 0Z";

  const pathData = variant === 1 ? wave1Path : wave2Path;

  return (
    <div
      className={`w-full overflow-hidden ${flipped ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="200"
        viewBox="0 0 900 200"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full"
      >
        <path
          d={pathData}
          fill={color}
        />
      </svg>
    </div>
  );
}