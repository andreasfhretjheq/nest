import { motion } from "framer-motion";

// Lightweight, fully-SVG product illustrations. Each product has a front
// and back variant so the card can swap them on hover. Colors adapt to
// the selected product color where it makes sense (fabric color).
type Props = {
  image: string;
  color?: string;
  size?: number;
  className?: string;
};

export function ProductArt({ image, color = "preto", size = 220, className }: Props) {
  const fabric = fabricFor(color);
  return (
    <motion.svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={className}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      aria-hidden="true"
    >
      <rect width="240" height="240" fill="transparent" />
      <g transform="translate(40 40)">{shapeFor(image, fabric)}</g>
    </motion.svg>
  );
}

function fabricFor(name: string): string {
  const map: Record<string, string> = {
    preto: "#111111",
    branco: "#e8e8e8",
    "off-white": "#d9d6cc",
    cinza: "#3f3f46",
    verde: "#4a5a2a",
    "verde-neon": "#39ff14",
    índigo: "#1c2a49",
    azul: "#1e3a8a",
    bege: "#c8b590",
    roxo: "#3b2263",
    único: "#1a1a1a",
  };
  return map[name] ?? "#111111";
}

type FabricColor = { main: string; shadow: string; stitch: string; accent: string };

function palette(base: string): FabricColor {
  const isLight =
    base === "#e8e8e8" ||
    base === "#d9d6cc" ||
    base === "#39ff14" ||
    base === "#c8b590";
  return {
    main: base,
    shadow: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)",
    stitch: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.3)",
    accent: "#39ff14",
  };
}

function shapeFor(image: string, base: string) {
  const p = palette(base);
  switch (image) {
    // ---------- CORE TEE ----------
    case "core-tee":
      return (
        <g>
          {/* body */}
          <path
            d="M0 30 30 10l25 8c10 14 30 14 40 0l25-8 30 20-18 28-17-8v110H32V50L14 58z"
            fill={p.main}
          />
          {/* neck shadow */}
          <path
            d="M55 18c8 12 22 12 30 0l-4-3c-6 6-16 6-22 0z"
            fill={p.shadow}
          />
          {/* stitching accents */}
          <path
            d="M32 160h76"
            stroke={p.stitch}
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
          />
          {/* chest NEST emblem */}
          <rect x="58" y="68" width="22" height="4" fill={p.accent} />
          <text
            x="65"
            y="92"
            fontFamily="Inter, sans-serif"
            fontSize="10"
            fontWeight="800"
            fill={p.stitch}
          >
            NEST
          </text>
        </g>
      );
    case "core-tee-back":
      return (
        <g>
          <path
            d="M0 30 30 10l25 8 10-4 10 4 25-8 30 20-18 28-17-8v110H32V50L14 58z"
            fill={p.main}
          />
          <path
            d="M55 18 65 14l10 4c-4 4-12 4-20 0z"
            fill={p.shadow}
          />
          {/* big center NEST wordmark on back */}
          <text
            x="22"
            y="102"
            fontFamily="Inter, sans-serif"
            fontSize="22"
            fontWeight="900"
            fill={p.accent}
            letterSpacing="4"
          >
            NEST
          </text>
          <text
            x="28"
            y="120"
            fontFamily="Inter, sans-serif"
            fontSize="8"
            fontWeight="700"
            fill={p.stitch}
            letterSpacing="3"
          >
            STREETWEAR ——
          </text>
          <path
            d="M32 160h76"
            stroke={p.stitch}
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
          />
        </g>
      );
    // ---------- NIGHT HOODIE ----------
    case "night-hoodie":
      return (
        <g>
          <path
            d="M28 40C28 24 50 12 80 12S132 24 132 40v20c18 8 26 22 26 44v60H2v-60c0-22 8-36 26-44z"
            fill={p.main}
          />
          {/* hood */}
          <path
            d="M60 30c0-14 8-24 20-24s20 10 20 24v18c-10 6-30 6-40 0z"
            fill={p.shadow}
          />
          {/* pocket */}
          <path
            d="M45 108h70l6 32H39z"
            fill={p.shadow}
          />
          {/* drawstrings */}
          <path
            d="M74 42v30M86 42v30"
            stroke={p.stitch}
            strokeWidth="2"
            fill="none"
          />
          <circle cx="74" cy="74" r="2.5" fill={p.stitch} />
          <circle cx="86" cy="74" r="2.5" fill={p.stitch} />
          {/* chest logo */}
          <rect x="72" y="84" width="16" height="4" fill={p.accent} />
        </g>
      );
    case "night-hoodie-back":
      return (
        <g>
          <path
            d="M28 40C28 24 50 12 80 12S132 24 132 40v20c18 8 26 22 26 44v60H2v-60c0-22 8-36 26-44z"
            fill={p.main}
          />
          <path
            d="M60 30c0-14 8-24 20-24s20 10 20 24v18c-10 6-30 6-40 0z"
            fill={p.shadow}
          />
          {/* big back NEST print */}
          <text
            x="12"
            y="92"
            fontFamily="Inter, sans-serif"
            fontSize="34"
            fontWeight="900"
            fill={p.accent}
            letterSpacing="6"
          >
            NEST
          </text>
          <text
            x="16"
            y="116"
            fontFamily="Inter, sans-serif"
            fontSize="9"
            fontWeight="700"
            fill={p.stitch}
            letterSpacing="4"
          >
            DROP 01 — SP
          </text>
        </g>
      );
    // ---------- RAW JORTS ----------
    case "raw-jorts":
      return (
        <g>
          <path
            d="M20 0h120l-8 110h-40l-12-56-12 56H28z"
            fill={p.main}
          />
          {/* waistband */}
          <path d="M20 0h120v14H20z" fill={p.shadow} />
          {/* fly */}
          <path
            d="M80 16v40"
            stroke={p.stitch}
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="2 2"
          />
          {/* pockets */}
          <path
            d="M30 14h30l-4 24h-26z"
            fill="none"
            stroke={p.stitch}
            strokeWidth="1"
          />
          <path
            d="M100 14h30l-4 24h-26z"
            fill="none"
            stroke={p.stitch}
            strokeWidth="1"
          />
          {/* frayed hem */}
          <path
            d="M28 108l2-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6"
            stroke={p.stitch}
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M92 108l2-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6"
            stroke={p.stitch}
            strokeWidth="1"
            fill="none"
          />
          {/* button */}
          <circle cx="80" cy="8" r="2.5" fill={p.accent} />
        </g>
      );
    case "raw-jorts-back":
      return (
        <g>
          <path
            d="M20 0h120l-8 110h-40l-12-56-12 56H28z"
            fill={p.main}
          />
          <path d="M20 0h120v14H20z" fill={p.shadow} />
          {/* back pockets */}
          <path
            d="M34 22h30v26H34z"
            fill="none"
            stroke={p.stitch}
            strokeWidth="1"
          />
          <path
            d="M96 22h30v26H96z"
            fill="none"
            stroke={p.stitch}
            strokeWidth="1"
          />
          {/* leather patch */}
          <rect x="108" y="4" width="22" height="10" fill={p.accent} />
          <text
            x="110"
            y="12"
            fontFamily="Inter, sans-serif"
            fontSize="6"
            fontWeight="800"
            fill="#000"
          >
            NEST
          </text>
        </g>
      );
    // ---------- EMBLEM CAP ----------
    case "emblem-cap":
      return (
        <g>
          {/* crown */}
          <path
            d="M20 100c0-40 30-70 70-70s70 30 70 70v8H20z"
            fill={p.main}
          />
          {/* visor */}
          <path d="M0 108h160v22H0z" fill={p.shadow} />
          {/* seam */}
          <path
            d="M90 30v70"
            stroke={p.stitch}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          {/* front emblem */}
          <rect x="78" y="60" width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M82 80V64l16 16V64" fill="none" stroke="#fff" strokeWidth="3" />
          <rect x="96" y="62" width="4" height="4" fill={p.accent} />
        </g>
      );
    case "emblem-cap-back":
      return (
        <g>
          <path
            d="M20 100c0-40 30-70 70-70s70 30 70 70v8H20z"
            fill={p.main}
          />
          <path d="M0 108h160v22H0z" fill={p.shadow} />
          {/* back panels */}
          <path
            d="M40 44v64M140 44v64M90 30v78"
            stroke={p.stitch}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          {/* metal adjuster */}
          <rect x="64" y="92" width="52" height="10" fill={p.shadow} />
          <circle cx="80" cy="97" r="2" fill={p.accent} />
          <circle cx="100" cy="97" r="2" fill={p.accent} />
          <text
            x="58"
            y="78"
            fontFamily="Inter, sans-serif"
            fontSize="9"
            fontWeight="800"
            fill={p.accent}
            letterSpacing="3"
          >
            NEST
          </text>
        </g>
      );
    default:
      return <rect width="160" height="160" fill={p.main} />;
  }
}
