import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api";
import { CustomerHeader, CustomerFooter } from "../components/CustomerLayout";
import { PRODUCTS } from "../config/products";
import "./Order.css";

export default function Order() {
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  const [form, setForm] = useState({
    firstName: "",
    phone: "",
    deliveryLocation: "",
    productId: PRODUCTS[0].id,
    quantity: 1,
  });
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(canceled ? "Payment was canceled. You can try again below." : "");

  const selectedProduct = PRODUCTS.find((p) => p.id === form.productId);
  const total = useMemo(
    () => (selectedProduct?.price || 0) * Number(form.quantity || 1),
    [selectedProduct, form.quantity]
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported on this device.");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setError("Could not get your location. Please describe where you are.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/checkout`, {
        firstName: form.firstName.trim(),
        phone: form.phone.trim(),
        deliveryLocation: form.deliveryLocation.trim(),
        product: selectedProduct.name,
        quantity: Number(form.quantity),
        deliveryLat: coords?.lat,
        deliveryLng: coords?.lng,
      });

      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong. Please try again or call us."
      );
      setLoading(false);
    }
  };

  return (
    <div className="cust-page">
      <CustomerHeader minimal />

      <main className="cust-main order-page">
        <div className="order-container">
          <Link to="/" className="order-back">
            ← Back to home
          </Link>

          <div className="order-header">
            <h1>Order Propane</h1>
            <p>
              Tell us where to find you — home, RV park, job site, or anywhere
              in between. Stripe will securely collect your payment details.
            </p>
          </div>

          {error && <div className="order-alert">{error}</div>}

          <form className="order-form" onSubmit={handleSubmit}>
            <section className="order-section">
              <h2>Your details</h2>
              <div className="order-field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Steve"
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="order-field">
                <label htmlFor="phone">Mobile phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (714) 555-1234"
                  autoComplete="tel"
                  required
                />
                <span className="order-hint">We&apos;ll text you order updates.</span>
              </div>
            </section>

            <section className="order-section">
              <h2>Delivery location</h2>
              <div className="order-field">
                <label htmlFor="deliveryLocation">Where should we deliver?</label>
                <textarea
                  id="deliveryLocation"
                  name="deliveryLocation"
                  value={form.deliveryLocation}
                  onChange={handleChange}
                  placeholder="Street address, RV park + site #, cross streets, or describe your location…"
                  rows={3}
                  required
                />
                <span className="order-hint">
                  No address? Describe where you are — e.g. &quot;RV at site 42, Newport Dunes&quot;
                </span>
              </div>
              <button
                type="button"
                className="order-locate-btn"
                onClick={useMyLocation}
                disabled={locating}
              >
                {locating ? "Getting location…" : "📍 Use my GPS location"}
              </button>
              {coords && (
                <p className="order-coords">
                  Location saved ({coords.lat.toFixed(5)}, {coords.lng.toFixed(5)})
                </p>
              )}
            </section>

            <section className="order-section">
              <h2>Select your tank</h2>
              <div className="product-grid">
                {PRODUCTS.map((product) => (
                  <label
                    key={product.id}
                    className={`product-card${form.productId === product.id ? " selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="productId"
                      value={product.id}
                      checked={form.productId === product.id}
                      onChange={handleChange}
                    />
                    <span className="product-name">{product.name}</span>
                    <span className="product-desc">{product.description}</span>
                    <span className="product-price">${product.price}</span>
                  </label>
                ))}
              </div>
              <div className="order-field order-qty">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </section>

            <div className="order-total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>

            <button
              type="submit"
              className="cust-btn cust-btn--primary cust-btn--full"
              disabled={loading}
            >
              {loading ? "Redirecting to secure checkout…" : "Continue to Payment"}
            </button>

            <p className="order-stripe-note">
              You&apos;ll be redirected to Stripe for secure card payment.
              Billing details are collected by Stripe — not stored on our servers.
            </p>
          </form>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
