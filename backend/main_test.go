package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealth(t *testing.T) {
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	handleHealth(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
}

func TestProductsList(t *testing.T) {
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/products", nil)
	handleProducts(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	var out []Product
	if err := json.NewDecoder(rr.Body).Decode(&out); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(out) == 0 {
		t.Fatalf("expected products, got 0")
	}
}

func TestProductByID_NotFound(t *testing.T) {
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/products/does-not-exist", nil)
	handleProductByID(rr, req)
	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}

func TestCheckout_Valid(t *testing.T) {
	body := CheckoutRequest{
		Items:   []CartItem{{ProductID: "p-core-tee", Quantity: 2, Size: "M", Color: "preto"}},
		Name:    "Andreas Teste",
		Email:   "andreas@example.com",
		Address: "Rua das Flores, 123",
		ZipCode: "01000-000",
	}
	b, _ := json.Marshal(body)
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/checkout", bytes.NewReader(b))
	handleCheckout(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var out CheckoutResponse
	if err := json.NewDecoder(rr.Body).Decode(&out); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if out.TotalCents != 19990*2 {
		t.Fatalf("unexpected total %d", out.TotalCents)
	}
}

func TestCheckout_InvalidEmail(t *testing.T) {
	body := CheckoutRequest{
		Items:   []CartItem{{ProductID: "p-core-tee", Quantity: 1}},
		Name:    "x",
		Email:   "not-an-email",
		Address: "Rua 1",
		ZipCode: "01000",
	}
	b, _ := json.Marshal(body)
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/checkout", bytes.NewReader(b))
	handleCheckout(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestRateLimiter(t *testing.T) {
	rl := newRateLimiter(2, 0.0001)
	if !rl.allow("1.2.3.4") {
		t.Fatal("first call should pass")
	}
	if !rl.allow("1.2.3.4") {
		t.Fatal("second call should pass")
	}
	if rl.allow("1.2.3.4") {
		t.Fatal("third call should be limited")
	}
}
