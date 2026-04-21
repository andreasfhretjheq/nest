import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Product } from "../types";
import { ProductArt } from "./ProductArt";
import { formatBRL, pixDiscountPercent } from "../utils/format";
import { Close, Plus } from "./icons";

type Props = {
  product: Product | null;
  onClose: () => void;
  onAdd: (p: Product, size: string, color: string) => void;
};

export function ProductModal({ product, onClose, onAdd }: Props) {
  const [size, setSize] = useState<string>(product?.sizes[0] ?? "");
  const [color, setColor] = useState<string>(product?.colors[0] ?? "");
  const [side, setSide] = useState<"front" | "back">("front");
  const [prevProductId, setPrevProductId] = useState(product?.id);
  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setSize(product.sizes[0] ?? "");
    setColor(product.colors[0] ?? "");
    setSide("front");
  }

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const pixPct = product
    ? pixDiscountPercent(product.priceCents, product.pixPriceCents)
    : 0;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-10 backdrop-blur"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden border border-white/10 bg-[var(--color-bg-soft)] shadow-2xl md:grid-cols-2"
          >
            <button
              aria-label="Fechar"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 border border-white/10 bg-black/50 p-2 text-white/70 backdrop-blur hover:text-white"
            >
              <Close className="h-4 w-4" />
            </button>

            <div className="relative flex items-center justify-center bg-black/40 p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={side}
                  initial={{ opacity: 0, rotateY: side === "back" ? 30 : -30 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: side === "back" ? -30 : 30 }}
                  transition={{ type: "spring", stiffness: 160, damping: 20 }}
                >
                  <ProductArt
                    image={side === "front" ? product.image : product.backImage}
                    color={color}
                    size={360}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 border border-white/10 bg-black/60 p-1 backdrop-blur">
                {(["front", "back"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className={`relative px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] transition ${
                      side === s ? "text-black" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {side === s && (
                      <motion.span
                        layoutId="modal-side"
                        className="absolute inset-0 bg-[var(--color-accent)]"
                      />
                    )}
                    <span className="relative">
                      {s === "front" ? "frente" : "costas"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col p-8">
              <div className="eyebrow text-white/50">{product.category}</div>
              <h3 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                {product.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-white">
                  {formatBRL(product.priceCents)}
                </span>
                {pixPct > 0 && (
                  <span className="bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                    -{pixPct}% pix
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-white/70">
                ou <span className="font-bold text-[var(--color-accent)]">{formatBRL(product.pixPriceCents)}</span>{" "}
                no pix
              </div>

              <p className="mt-6 text-sm leading-relaxed text-white/70">
                {product.description}
              </p>

              <div className="mt-6">
                <div className="eyebrow mb-3 text-white/50">Cor · {color}</div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <motion.button
                      key={c}
                      onClick={() => setColor(c)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition ${
                        color === c
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-white"
                          : "border-white/15 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <div className="eyebrow mb-3 text-white/50">Tamanho</div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <motion.button
                      key={s}
                      onClick={() => setSize(s)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      className={`min-w-[2.75rem] border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition ${
                        size === s
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-black"
                          : "border-white/15 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => {
                  onAdd(product, size, color);
                  onClose();
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 flex items-center justify-center gap-2 bg-[var(--color-accent)] px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-black transition hover:bg-white"
              >
                <Plus className="h-4 w-4" />
                Adicionar à sacola
              </motion.button>

              <div className="mt-4 flex items-center justify-between text-[11px] text-white/50">
                <span>Estoque: {product.stock} unidades</span>
                <span className="flex gap-1">
                  {product.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-white/15 px-2 py-0.5 uppercase tracking-widest"
                    >
                      {t}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
