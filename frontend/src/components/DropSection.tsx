import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Product } from "../types";
import { ProductArt } from "./ProductArt";
import { formatBRL } from "../utils/format";
import { ArrowRight } from "./icons";

type Props = {
  products: Product[];
};

// Editorial "current drop" section inspired by Mud Concept's "RUMO AO HEXA"
// hero — giant typography that parallaxes horizontally while two featured
// pieces float on top. Anchored to #drop.
export function DropSection({ products }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const xLeft = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const xRight = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yFloat = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const featured = products.slice(0, 2);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[var(--color-bg-soft)] py-32"
    >
      <div className="relative mx-auto max-w-[120rem]">
        <motion.div
          style={{ x: xLeft }}
          aria-hidden="true"
          className="pointer-events-none whitespace-nowrap text-[22vw] font-black leading-[0.9] tracking-tighter text-white"
        >
          NEST 01 — NEST 01 —
        </motion.div>
        <motion.div
          style={{ x: xRight }}
          aria-hidden="true"
          className="pointer-events-none whitespace-nowrap text-[22vw] font-black leading-[0.9] tracking-tighter text-transparent"
          data-text="DROP DROP DROP"
        >
          <span
            className="bg-clip-text text-transparent"
            style={{
              WebkitTextStroke: "2px var(--color-accent)",
              color: "transparent",
            }}
          >
            DROP DROP DROP
          </span>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-2 md:items-center">
        <motion.div
          style={{ y: yFloat }}
          className="flex flex-col gap-5"
        >
          <div className="eyebrow text-[var(--color-accent)]">drop 01 no ar</div>
          <h2 className="display text-5xl md:text-7xl">
            <span className="text-white">VISTA O </span>
            <span className="acid">SILÊNCIO.</span>
          </h2>
          <p className="max-w-md text-white/60">
            Quatro peças pensadas como um conjunto. Fotografadas em estúdio,
            costuradas no Brasil, tiragem curta e numerada.
          </p>
          <a
            href="#products"
            className="mt-4 inline-flex items-center gap-3 self-start border-b border-[var(--color-accent)] pb-1 text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]"
          >
            Ver o drop completo <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 90, damping: 16 }}
          className="grid grid-cols-2 gap-3"
        >
          {featured.map((p, i) => (
            <motion.a
              key={p.id}
              href={`#products`}
              whileHover={{ y: -4 }}
              className={`group relative block overflow-hidden border border-white/10 bg-black/40 ${
                i === 0 ? "translate-y-8" : ""
              }`}
            >
              <div className="flex aspect-[3/4] items-center justify-center">
                <ProductArt image={p.image} color={p.colors[0]} size={280} />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <div>
                  <div className="eyebrow text-white/50">{p.category}</div>
                  <div className="text-base font-bold text-white">
                    {p.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">
                    {formatBRL(p.priceCents)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
                    {formatBRL(p.pixPriceCents)} pix
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
