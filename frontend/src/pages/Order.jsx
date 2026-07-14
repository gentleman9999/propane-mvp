import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api";
import { CustomerHeader, CustomerFooter } from "../components/CustomerLayout";
import { PRODUCTS, emptyCart } from "../config/products";
import "./Order.css";

export default function Order() {
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  const [form, setForm] = useState({
    firstName: "",
    phone: "",
    deliveryLocation: "",
  });
  const [smsConsent, setSmsConsent] = useState(false);
  const [cart, setCart] = useState(emptyCart);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    canceled ? "Payment was canceled. You can try again below." : ""
  );

  const cartLines = useMemo(
    () =>
      PRODUCTS.filter((p) => cart[p.id] > 0).map((p) => ({
        product: p.name,
        quantity: cart[p.id],
        price: p.price,
        lineTotal: p.price * cart[p.id],
      })),
    [cart]
  );

  const total = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.lineTotal, 0),
    [cartLines]
  );

  const itemCount = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.quantity, 0),
    [cartLines]
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const setQuantity = (productId, nextQty) => {
    const qty = Math.max(0, Math.min(99, nextQty));
    setCart((prev) => ({ ...prev, [productId]: qty }));
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

    if (cartLines.length === 0) {
      setError("Please add at least one tank to your order.");
      return;
    }

    if (!smsConsent) {
      setError("Please check the box to agree to receive order text messages.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/checkout`, {
        firstName: form.firstName.trim(),
        phone: form.phone.trim(),
        deliveryLocation: form.deliveryLocation.trim(),
        items: cartLines.map(({ product, quantity }) => ({ product, quantity })),
        deliveryLat: coords?.lat,
        deliveryLng: coords?.lng,
        smsConsent: true,
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
              in between. Add as many tanks as you need. Stripe will securely
              collect your payment details.
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
                  placeholder="(805) 674-8875"
                  autoComplete="tel"
                  required
                />
              </div>
            </section>

            <section className="order-section">
              <h2>Text message updates</h2>
              <label className="sms-consent">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => {
                    setSmsConsent(e.target.checked);
                    setError("");
                  }}
                />
                <span>
                  Yes, I agree to receive automated text messages from The Cylinder
                  Exchange about my order, payment link, and delivery updates.
                  Message frequency varies. Message and data rates may apply. Reply
                  HELP for help or STOP to cancel. Consent is not required as a
                  condition of purchase — you may also call us to order.
                </span>
              </label>
              <p className="sms-disclosures">
                By continuing, you confirm you can receive texts at the number
                provided.{" "}
                <Link to="/privacy">Privacy Policy</Link>
                {" · "}
                <Link to="/terms">Terms of Service</Link>
              </p>
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
                  No address? Describe where you are — e.g. &quot;RV at site 42, Paso Robles&quot;
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
              <h2>Select your tanks</h2>
              <p className="order-section-hint">
                Use + and − to add multiple sizes — e.g. 3 × 20lb and 2 × 30lb.
              </p>
              <div className="product-grid">
                {PRODUCTS.map((product) => {
                  const qty = cart[product.id];
                  const active = qty > 0;

                  return (
                    <div
                      key={product.id}
                      className={`product-card${active ? " selected" : ""}`}
                    >
                      <div className="product-card-info">
                        <span className="product-name">{product.name}</span>
                        <span className="product-desc">{product.description}</span>
                        <span className="product-price">${product.price} each</span>
                      </div>
                      <div className="product-qty-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity(product.id, qty - 1)}
                          disabled={qty === 0}
                          aria-label={`Decrease ${product.name}`}
                        >
                          −
                        </button>
                        <span className="qty-value" aria-live="polite">
                          {qty}
                        </span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity(product.id, qty + 1)}
                          aria-label={`Increase ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                      {active && (
                        <span className="product-line-total">
                          ${(product.price * qty).toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {cartLines.length > 0 && (
              <div className="order-summary">
                <p className="order-summary-title">Your order</p>
                <ul className="order-summary-list">
                  {cartLines.map((line) => (
                    <li key={line.product}>
                      <span>
                        {line.quantity} × {line.product}
                      </span>
                      <span>${line.lineTotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="order-total">
              <span>
                Total{itemCount > 0 ? ` (${itemCount} item${itemCount !== 1 ? "s" : ""})` : ""}
              </span>
              <strong>${total.toFixed(2)}</strong>
            </div>

            <button
              type="submit"
              className="cust-btn cust-btn--primary cust-btn--full"
              disabled={loading || cartLines.length === 0 || !smsConsent}
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
