interface Props {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
}

const SectionHeading = ({ eyebrow, title, sub, align = "center" }: Props) => {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignCls}`}>
      {eyebrow && (
        <p className={`inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-gold ${align === "center" ? "justify-center" : ""}`}>
          {align === "center" && <span className="h-px w-8 bg-gold/60" />}
          {eyebrow}
          {align === "center" && <span className="h-px w-8 bg-gold/60" />}
        </p>
      )}
      <h2 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.05]">
        {title}
      </h2>
      {sub && <p className="mt-5 text-base sm:text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
};

export default SectionHeading;
