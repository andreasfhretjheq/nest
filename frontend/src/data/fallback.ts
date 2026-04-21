// Fallback catalog used when the API is unreachable so the landing still
// showcases the full experience standalone. Mirrors the Go backend seed.
import type { Product } from "../types";

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "p-core-tee",
    name: "Boxy Tee CORE",
    description:
      "Camiseta boxy fit em algodão pesado 240g/m² com gola reforçada e barra reta.",
    priceCents: 19990,
    pixPriceCents: 18991,
    category: "Camisetas",
    image: "core-tee",
    backImage: "core-tee-back",
    colors: ["preto", "branco"],
    sizes: ["P", "M", "G", "GG"],
    tags: ["novo"],
    stock: 48,
  },
  {
    id: "p-night-hoodie",
    name: "Moletom NIGHT",
    description:
      "Moletom oversized em moletinho flanelado 440g com capuz forrado e bolso canguru reforçado.",
    priceCents: 39990,
    pixPriceCents: 37991,
    category: "Moletons",
    image: "night-hoodie",
    backImage: "night-hoodie-back",
    colors: ["preto", "off-white"],
    sizes: ["P", "M", "G", "GG"],
    tags: ["drop 01"],
    stock: 22,
  },
  {
    id: "p-raw-jorts",
    name: "Jorts RAW",
    description:
      "Short jeans baggy em denim cru 14oz com barras desfiadas e modelagem baggy fit.",
    priceCents: 25990,
    pixPriceCents: 24691,
    category: "Peças",
    image: "raw-jorts",
    backImage: "raw-jorts-back",
    colors: ["índigo", "preto"],
    sizes: ["38", "40", "42", "44"],
    tags: ["limitado"],
    stock: 16,
  },
  {
    id: "p-emblem-cap",
    name: "Dad Hat EMBLEM",
    description:
      "Boné estruturado em sarja com bordado em alto relevo e fivela metálica traseira ajustável.",
    priceCents: 12990,
    pixPriceCents: 12341,
    category: "Acessórios",
    image: "emblem-cap",
    backImage: "emblem-cap-back",
    colors: ["preto", "off-white", "verde"],
    sizes: ["único"],
    tags: ["best-seller"],
    stock: 110,
  },
];
