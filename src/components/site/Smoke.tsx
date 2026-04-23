const Smoke = () => {
  // Six wisps of steam rising from the food
  const wisps = [
    { left: "32%", delay: "0s",   dur: "6s",   drift: "12px"  },
    { left: "42%", delay: "1.2s", dur: "7s",   drift: "-8px"  },
    { left: "50%", delay: "0.6s", dur: "5.5s", drift: "16px"  },
    { left: "58%", delay: "1.8s", dur: "6.5s", drift: "-14px" },
    { left: "66%", delay: "0.3s", dur: "7.5s", drift: "10px"  },
    { left: "48%", delay: "2.4s", dur: "6s",   drift: "-6px"  },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {wisps.map((w, i) => (
        <span
          key={i}
          className="smoke"
          style={{
            left: w.left,
            ["--delay" as string]: w.delay,
            ["--dur" as string]: w.dur,
            ["--drift" as string]: w.drift,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default Smoke;
