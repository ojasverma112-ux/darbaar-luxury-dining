import { useMemo } from "react";

interface Props { count?: number }

const Particles = ({ count = 22 }: Props) => {
  const dots = useMemo(() => Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: 60 + Math.random() * 40,
    dx: (Math.random() - 0.5) * 120,
    dy: -100 - Math.random() * 200,
    dur: 7 + Math.random() * 9,
    delay: -Math.random() * 12,
    size: 2 + Math.random() * 3,
  })), [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            // @ts-expect-error CSS vars
            "--dx": `${d.dx}px`,
            "--dy": `${d.dy}px`,
            "--dur": `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
