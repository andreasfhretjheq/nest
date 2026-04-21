import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
  onOpen: (p: Product) => void;
};

export function Products({ products, onOpen }: Props) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ["Todas", ...Array.from(set)];
  }, [products]);
  const [active, setActive] = useState("Todas");

  const filtered = useMemo(
    () =>
      active === "Todas"
        ? products
        : products.filter((p) => p.category === active),
    [products, active],
  );

  return (
    <section id="products" className="relative mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
      >
        <div>
          <div className="eyebrow text-white/50">Drop 01</div>
          <h2 className="mt-3 text-5xl font-black tracking-tighter text-white md:text-7xl">
            A COLEÇÃO <span className="acid">INTEIRA.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-white/60">
            Quatro peças, uma declaração. Fotografadas como capa de disco,
            feitas pra durar muito mais.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <motion.button
              key={c}
              onClick={() => setActive(c)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="relative px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em]"
            >
              {active === c && (
                <motion.span
                  layoutId="pill"
                  className="absolute inset-0 bg-[var(--color-accent)]"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span
                className={`relative ${active === c ? "text-black" : "text-white/60 hover:text-white"}`}
              >
                {c}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
            >
              <ProductCard product={p} index={i} onOpen={onOpen} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
