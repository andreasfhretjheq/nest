import { motion } from "framer-motion";

// NEST mark: outer frame + stylized N with an accent square. Used in the
// header, loading screen and footer so there's a single source of truth.
export function NestLogo({ size = 32 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 16 }}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <motion.path
        d="M16 48 V16 L48 48 V16"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="miter"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <motion.rect
        x="44"
        y="12"
        width="6"
        height="6"
        fill="var(--color-accent)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 260 }}
        style={{ transformOrigin: "47px 15px" }}
      />
    </motion.svg>
  );
}
