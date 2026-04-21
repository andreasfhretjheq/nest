// Package main implements the backend API for NEST — streetwear autoral.
// Powers product catalog, checkout and security-hardened serving for the
// store frontend.
//
// Design goals:
//   - Zero external dependencies (stdlib only) to minimize the supply-chain
//     attack surface.
//   - Defense-in-depth: strict security headers, an allowlist CORS policy,
//     a lightweight IP-based rate limiter, bounded request bodies, and
//     constant-time comparisons where secrets are involved.
//   - Conservative defaults: read/write/idle timeouts, no directory listing,
//     JSON-only responses.
package main

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

// ----- Domain types -----

type Product struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	PriceCents    int      `json:"priceCents"`
	PixPriceCents int      `json:"pixPriceCents"`
	Category      string   `json:"category"`
	Image         string   `json:"image"`
	BackImage     string   `json:"backImage"`
	Colors        []string `json:"colors"`
	Sizes         []string `json:"sizes"`
	Tags          []string `json:"tags"`
	Stock         int      `json:"stock"`
}

type CartItem struct {
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
	Size      string `json:"size"`
	Color     string `json:"color"`
}

type CheckoutRequest struct {
	Items         []CartItem `json:"items"`
	Name          string     `json:"name"`
	Email         string     `json:"email"`
	Address       string     `json:"address"`
	ZipCode       string     `json:"zipCode"`
	PaymentMethod string     `json:"paymentMethod"`
}

type CheckoutResponse struct {
	OrderID     string `json:"orderId"`
	TotalCents  int    `json:"totalCents"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
	EstimatedAt string `json:"estimatedAt"`
}

// ----- In-memory catalog (seeded on startup) -----

// NEST drop 01 — quatro peças, produção curta.
var catalog = []Product{
	{ID: "p-core-tee", Name: "Boxy Tee CORE", Description: "Camiseta boxy fit em algodão pesado 240g/m² com gola reforçada e barra reta.", PriceCents: 19990, PixPriceCents: 18991, Category: "Camisetas", Image: "core-tee", BackImage: "core-tee-back", Colors: []string{"preto", "branco"}, Sizes: []string{"P", "M", "G", "GG"}, Tags: []string{"novo"}, Stock: 48},
	{ID: "p-night-hoodie", Name: "Moletom NIGHT", Description: "Moletom oversized em moletinho flanelado 440g com capuz forrado e bolso canguru reforçado.", PriceCents: 39990, PixPriceCents: 37991, Category: "Moletons", Image: "night-hoodie", BackImage: "night-hoodie-back", Colors: []string{"preto", "off-white"}, Sizes: []string{"P", "M", "G", "GG"}, Tags: []string{"drop 01"}, Stock: 22},
	{ID: "p-raw-jorts", Name: "Jorts RAW", Description: "Short jeans baggy em denim cru 14oz com barras desfiadas e modelagem baggy fit.", PriceCents: 25990, PixPriceCents: 24691, Category: "Peças", Image: "raw-jorts", BackImage: "raw-jorts-back", Colors: []string{"índigo", "preto"}, Sizes: []string{"38", "40", "42", "44"}, Tags: []string{"limitado"}, Stock: 16},
	{ID: "p-emblem-cap", Name: "Dad Hat EMBLEM", Description: "Boné estruturado em sarja com bordado em alto relevo e fivela metálica traseira ajustável.", PriceCents: 12990, PixPriceCents: 12341, Category: "Acessórios", Image: "emblem-cap", BackImage: "emblem-cap-back", Colors: []string{"preto", "off-white", "verde"}, Sizes: []string{"único"}, Tags: []string{"best-seller"}, Stock: 110},
}

// ----- Rate limiter (token bucket per IP) -----

type bucket struct {
	tokens     float64
	lastRefill time.Time
}

type rateLimiter struct {
	mu       sync.Mutex
	buckets  map[string]*bucket
	capacity float64
	refill   float64 // tokens per second
}

func newRateLimiter(capacity, refillPerSecond float64) *rateLimiter {
	rl := &rateLimiter{
		buckets:  make(map[string]*bucket),
		capacity: capacity,
		refill:   refillPerSecond,
	}
	go rl.gc()
	return rl
}

func (rl *rateLimiter) gc() {
	t := time.NewTicker(5 * time.Minute)
	defer t.Stop()
	for range t.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, b := range rl.buckets {
			if now.Sub(b.lastRefill) > 15*time.Minute {
				delete(rl.buckets, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	now := time.Now()
	b, ok := rl.buckets[ip]
	if !ok {
		b = &bucket{tokens: rl.capacity, lastRefill: now}
		rl.buckets[ip] = b
	}
	elapsed := now.Sub(b.lastRefill).Seconds()
	b.tokens = minFloat(rl.capacity, b.tokens+elapsed*rl.refill)
	b.lastRefill = now
	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}

func minFloat(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

// ----- Middleware -----

func clientIP(r *http.Request) string {
	if h := r.Header.Get("X-Forwarded-For"); h != "" {
		if i := strings.IndexByte(h, ','); i >= 0 {
			return strings.TrimSpace(h[:i])
		}
		return strings.TrimSpace(h)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func withSecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("X-Frame-Options", "DENY")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		h.Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		h.Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
		h.Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
		next.ServeHTTP(w, r)
	})
}

func withCORS(allowed map[string]struct{}, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			if _, ok := allowed[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
				w.Header().Set("Access-Control-Max-Age", "600")
			}
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func withRateLimit(rl *rateLimiter, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !rl.allow(clientIP(r)) {
			writeJSON(w, http.StatusTooManyRequests, map[string]string{"error": "rate limit exceeded"})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func withBodyLimit(limit int64, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, limit)
		next.ServeHTTP(w, r)
	})
}

func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s %s", clientIP(r), r.Method, r.URL.Path, time.Since(start))
	})
}

// ----- Helpers -----

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func randomID(prefix string) string {
	buf := make([]byte, 8)
	if _, err := rand.Read(buf); err != nil {
		return prefix + fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return prefix + hex.EncodeToString(buf)
}

func validateEmail(s string) bool {
	if len(s) < 3 || len(s) > 254 {
		return false
	}
	at := strings.IndexByte(s, '@')
	if at <= 0 || at == len(s)-1 {
		return false
	}
	return strings.Contains(s[at:], ".")
}

func safeString(s string, max int) (string, bool) {
	s = strings.TrimSpace(s)
	if len(s) == 0 || len(s) > max {
		return "", false
	}
	for _, r := range s {
		if r < 0x20 && r != '\n' && r != '\t' {
			return "", false
		}
	}
	return s, true
}

// ----- Handlers -----

func handleProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	category := strings.TrimSpace(r.URL.Query().Get("category"))
	out := catalog
	if category != "" {
		out = make([]Product, 0, len(catalog))
		for _, p := range catalog {
			if strings.EqualFold(p.Category, category) {
				out = append(out, p)
			}
		}
	}
	writeJSON(w, http.StatusOK, out)
}

func handleProductByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/products/")
	if id == "" || strings.Contains(id, "/") {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}
	for _, p := range catalog {
		// Constant-time compare to make ID probing uniform in timing.
		if subtle.ConstantTimeCompare([]byte(p.ID), []byte(id)) == 1 {
			writeJSON(w, http.StatusOK, p)
			return
		}
	}
	writeJSON(w, http.StatusNotFound, map[string]string{"error": "product not found"})
}

func handleCheckout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req CheckoutRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	if len(req.Items) == 0 || len(req.Items) > 50 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid item count"})
		return
	}
	name, ok := safeString(req.Name, 120)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid name"})
		return
	}
	if !validateEmail(strings.TrimSpace(req.Email)) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid email"})
		return
	}
	address, ok := safeString(req.Address, 240)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid address"})
		return
	}
	zip, ok := safeString(req.ZipCode, 16)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid zip"})
		return
	}
	payment := strings.TrimSpace(strings.ToLower(req.PaymentMethod))
	if payment == "" {
		payment = "card"
	}
	if payment != "pix" && payment != "card" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid payment method"})
		return
	}
	total := 0
	for _, it := range req.Items {
		if it.Quantity <= 0 || it.Quantity > 20 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid quantity"})
			return
		}
		found := false
		for _, p := range catalog {
			if p.ID == it.ProductID {
				unit := p.PriceCents
				if payment == "pix" {
					unit = p.PixPriceCents
				}
				total += unit * it.Quantity
				found = true
				break
			}
		}
		if !found {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "unknown product"})
			return
		}
	}
	resp := CheckoutResponse{
		OrderID:     randomID("ord_"),
		TotalCents:  total,
		Status:      "confirmed",
		CreatedAt:   time.Now().UTC().Format(time.RFC3339),
		EstimatedAt: time.Now().Add(5 * 24 * time.Hour).UTC().Format(time.RFC3339),
	}
	log.Printf("checkout: order=%s name=%q email=%q items=%d total=%d payment=%s zip=%s address-len=%d",
		resp.OrderID, name, req.Email, len(req.Items), total, payment, zip, len(address))
	writeJSON(w, http.StatusOK, resp)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "time": time.Now().UTC().Format(time.RFC3339)})
}

// ----- Server bootstrap -----

func allowedOriginsFromEnv() map[string]struct{} {
	raw := os.Getenv("ALLOWED_ORIGINS")
	if raw == "" {
		raw = "http://localhost:5173,http://127.0.0.1:5173"
	}
	out := make(map[string]struct{})
	for _, o := range strings.Split(raw, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			out[o] = struct{}{}
		}
	}
	return out
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	rl := newRateLimiter(60, 1) // 60-token bucket, refill 1 token/sec

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", handleHealth)
	mux.HandleFunc("/api/products", handleProducts)
	mux.HandleFunc("/api/products/", handleProductByID)
	mux.HandleFunc("/api/checkout", handleCheckout)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
	})

	var h http.Handler = mux
	h = withBodyLimit(1<<16, h) // 64KiB
	h = withRateLimit(rl, h)
	h = withCORS(allowedOriginsFromEnv(), h)
	h = withSecurityHeaders(h)
	h = withLogging(h)

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           h,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 14, // 16KiB
	}

	log.Printf("NEST backend listening on :%s", port)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
