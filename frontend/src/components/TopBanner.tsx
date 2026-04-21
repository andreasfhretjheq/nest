import { Sparkle } from "./icons";

const messages = [
  "FRETE GRÁTIS ACIMA DE R$ 299",
  "5% OFF NO PIX",
  "DROP 01 — PEÇAS LIMITADAS",
];

export function TopBanner() {
  return (
    <div className="relative z-50 bg-[var(--color-accent)] text-black">
      <div className="marquee py-2">
        {[...messages, ...messages, ...messages].map((m, i) => (
          <span
            key={i}
            className="flex items-center gap-3 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3em]"
          >
            {m}
            <Sparkle className="h-3 w-3" />
          </span>
        ))}
      </div>
    </div>
  );
}
