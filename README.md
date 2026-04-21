# NAST — streetwear autoral

Site da marca **NAST**. Peças limitadas, estética minimalista e acabamento
premium. Este repositório contém o frontend animado + o backend em Go.

- **Backend:** Go 1.23, apenas stdlib, hardening embutido (security headers,
  CORS por allowlist, rate limit por IP, validação e limites de body).
- **Frontend:** React 19 + Vite + TypeScript, Tailwind v4, Framer Motion,
  fotos reais dos produtos e tabela de medidas lateral.

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
  `--color-accent` (padrão `#39ff14`).
- **Produtos:** `backend/main.go` (seed em memória) + fallback em
  `frontend/src/data/fallback.ts`. Mantenha as duas listas em sincronia.
- **Fotos dos produtos:** `frontend/public/products/` (referenciadas por
  nome de arquivo no campo `image` de cada produto).
- **Tabela de medidas:** `frontend/src/components/SizeChart.tsx` —
  três tabelas (camiseta regular, boxy, baby look) exibidas num painel
  lateral fixo ao lado do grid e num modal acessível pelo link
  "tabela de medidas".

## Seções

- Hero com tipografia gigante animada e parallax suave
- Grid de produtos (4 peças reais) + tabela de medidas lateral
- CTA primária: "entrar em contato" via WhatsApp; secundária: sacola
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
