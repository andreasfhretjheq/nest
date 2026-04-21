import { motion } from "framer-motion";
import { Lock, Refresh, Shield, Truck } from "./icons";

const features = [
  {
    icon: Truck,
    title: "Envio 48h",
    desc: "Frete expresso para capitais. Brasil inteiro em até 5 dias úteis.",
  },
  {
    icon: Refresh,
    title: "Troca grátis",
    desc: "30 dias para trocar ou devolver, sem letras miúdas.",
  },
  {
    icon: Lock,
    title: "Pix com desconto",
    desc: "5% OFF pagando no Pix. Checkout criptografado ponta a ponta.",
  },
  {
    icon: Shield,
    title: "Produção consciente",
    desc: "Confecção responsável, tecidos escolhidos peça a peça.",
  },
];

export function Features() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.06 }}
              className="group relative bg-[var(--color-bg)] p-6 transition-colors hover:bg-[var(--color-bg-soft)]"
            >
              <Icon className="h-6 w-6 text-[var(--color-accent)]" />
              <h3 className="mt-6 text-base font-bold uppercase tracking-wide text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-white/50">{f.desc}</p>
              <motion.div
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[var(--color-accent)]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.6 }}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
