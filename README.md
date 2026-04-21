# NEST — streetwear autoral

Site da marca **NEST**. Drops limitados, estética minimalista e acabamento
premium. Este repositório contém o frontend animado + o backend em Go.

- **Backend:** Go 1.23, apenas stdlib, hardening embutido (security headers,
  CORS por allowlist, rate limit por IP, validação e limites de body).
- **Frontend:** React 19 + Vite + TypeScript, Tailwind v4, Framer Motion,
  canvas particles e ilustrações SVG frente/costas.

## Estrutura

```
backend/   API em Go (stdlib)
frontend/  SPA React animada
```

## Rodando localmente

### Backend

```bash
cd backend
go run .
# http://localhost:8080
```

Variáveis úteis:

- `PORT` (padrão `8080`)
- `ALLOWED_ORIGINS` (padrão `http://localhost:5173,http://127.0.0.1:5173`)

Testes:

```bash
cd backend
go test ./...
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

Build e lint:

```bash
npm run lint
npm run build
```

A SPA também funciona sem o backend — há um catálogo de fallback equivalente
ao seed em memória do Go.

## Customização rápida

- **Número do WhatsApp flutuante:** `frontend/src/App.tsx` — constante
  `WHATSAPP_NUMBER` no formato E.164 sem o `+` (ex: `5511999999999`).
- **Cor de destaque:** `frontend/src/index.css` — variável
  `--color-accent` (padrão `#c6ff00`).
- **Produtos:** `backend/main.go` (seed em memória) + fallback em
  `frontend/src/data/fallback.ts`. Mantenha as duas listas em sincronia.

## Seções

- Hero com tipografia gigante animada e parallax
- Banner promo topo + marquee horizontal
- Drop section com parallax editorial (NEST 01 / DROP DROP DROP)
- Grid de produtos com hover frente/costas + preço Pix
- Manifesto (scroll reveal palavra a palavra)
- Newsletter, footer com sociais, WhatsApp flutuante

## Segurança

- `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options:
  DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy`.
- CORS restrito por allowlist vinda de `ALLOWED_ORIGINS`.
- Rate limit em memória (token bucket por IP, GC automático).
- `http.MaxBytesReader` para todos os corpos + timeouts de leitura/escrita.
- `json.Decoder` com `DisallowUnknownFields` no checkout.
- Validação estrita (email, tamanhos, quantidades, caracteres de controle).
- Comparação em tempo constante para lookup por ID (`crypto/subtle`).
- Zero dependências externas no backend — supply-chain mínima.
