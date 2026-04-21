const words = [
  "NEW DROP 01",
  "FEITO NO BRASIL",
  "EDIÇÃO LIMITADA",
  "FRETE GRÁTIS R$ 299+",
  "5% OFF NO PIX",
  "TROCA GRÁTIS EM 30 DIAS",
];

export function Marquee() {
  const items = [...words, ...words, ...words];
  return (
    <div
      id="drop"
      aria-hidden="true"
      className="relative overflow-hidden border-y border-white/10 bg-black py-6"
    >
      <div className="marquee">
        {items.map((w, i) => (
          <span
            key={i}
            className="flex items-center gap-5 whitespace-nowrap text-2xl font-black uppercase tracking-[0.15em] text-white md:text-4xl"
          >
            {w}
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
