import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL } from "../api";
import "../App.css";

const INITIAL_FORM = {
  firstName: "",
  phone: "",
  address: "",
  product: "20lb Propane Tank",
  quantity: 1,
  price: 35,
};

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c1.5 3 4 4.5 4 8a4 4 0 1 1-8 0c0-3.5 2.5-5 4-8zm0 18a6 6 0 0 0 6-6c0-2.5-1.2-4.3-3-6.2-.5 2.5-2 4-3 5.5-1-1.5-2.5-3-3-5.5C7.2 9.7 6 11.5 6 14a6 6 0 0 0 6 6z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr.includes("T") ? dateStr : dateStr + "Z");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const normalized = (status || "pending").toLowerCase();
  const className =
    normalized === "delivered"
      ? "badge badge--delivered"
      : normalized === "paid"
        ? "badge badge--paid"
        : normalized === "pending"
          ? "badge badge--pending"
          : "badge badge--default";

  return <span className={className}>{status || "pending"}</span>;
}

function SourceBadge({ source }) {
  if (!source || source === "phone") return <span className="badge badge--default">phone</span>;
  return <span className="badge badge--paid">qr</span>;
}

export default function AdminDashboard() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const totalAmount = Number(form.quantity) * Number(form.price);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    }),
    [orders]
  );

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadOrders = async (silent = false) => {
    if (!silent) setOrdersLoading(true);
    else setRefreshing(true);

    try {
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      if (!silent) showToast("Failed to load orders", "error");
    } finally {
      setOrdersLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        firstName: form.firstName,
        phone: form.phone,
        address: form.address,
        items: [
          {
            product: form.product,
            quantity: Number(form.quantity),
            price: Number(form.price),
          },
        ],
        totalAmount: totalAmount * 100,
      };

      const res = await axios.post(`${API_URL}/orders`, payload);

      if (res.data.smsSent) {
        showToast(`Payment link sent to ${form.firstName}!`);
      } else {
        showToast(
          `Order created, but SMS failed. Share the payment link manually.`,
          "warning"
        );
        console.warn("SMS error:", res.data.smsError);
      }

      setForm(INITIAL_FORM);
      loadOrders(true);
      console.log("Payment link:", res.data.paymentLink);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Failed to create order. Is the backend running on port 5000?";
      showToast(message, "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async (id) => {
    try {
      await axios.patch(`${API_URL}/orders/${id}/delivered`);
      showToast("Order marked as delivered");
      loadOrders(true);
    } catch (err) {
      showToast("Failed to update order", "error");
      console.error(err);
    }
  };

  const renderOrderActions = (order) =>
    order.status !== "delivered" && (
      <button
        type="button"
        className="btn-action"
        onClick={() => markDelivered(order.id)}
      >
        Mark Delivered
      </button>
    );

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <FlameIcon />
            </div>
            <div className="brand-text">
              <h1>Propane Delivery</h1>
              <p>Admin Dashboard</p>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/" className="admin-home-link">
              Customer site
            </Link>
            <Link to="/qr" className="admin-home-link">
              QR code
            </Link>
            <button
              type="button"
              className={`btn-icon${refreshing ? " spinning" : ""}`}
              onClick={() => loadOrders(true)}
              disabled={refreshing}
              aria-label="Refresh orders"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="stats" aria-label="Order statistics">
          <div className="stat-card">
            <div className="stat-icon stat-icon--total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="stat-label">Total Orders</p>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--pending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <p className="stat-label">Pending</p>
              <p className="stat-value">{stats.pending}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--delivered">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
            </div>
            <div>
              <p className="stat-label">Delivered</p>
              <p className="stat-value">{stats.delivered}</p>
            </div>
          </div>
        </section>

        <div className="layout">
          <form className="card" onSubmit={createOrder}>
            <div className="card-header">
              <h2>New Phone Order</h2>
              <p>Enter customer details and send a payment link via SMS.</p>
            </div>
            <div className="card-body">
              <div className="form-section">
                <p className="form-section-title">Customer</p>
                <div className="field">
                  <label htmlFor="firstName">First Name</label>
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
                <div className="field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+17262406698"
                    autoComplete="tel"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="address">Delivery Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="1234 Main St, Paso Robles, CA 93446"
                    autoComplete="street-address"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <p className="form-section-title">Order Details</p>
                <div className="field">
                  <label htmlFor="product">Product</label>
                  <select
                    id="product"
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                  >
                    <option>20lb Propane Tank</option>
                    <option>30lb Propane Tank</option>
                    <option>40lb Propane Tank</option>
                    <option>Patio Heater Tank</option>
                  </select>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      name="quantity"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="price">Price per Item ($)</label>
                    <input
                      id="price"
                      type="number"
                      name="price"
                      min="1"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="total-box">
                <span>Order Total</span>
                <strong>${totalAmount.toFixed(2)}</strong>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  "Creating order…"
                ) : (
                  <>
                    <SendIcon />
                    Create &amp; Send Payment Link
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="card orders-card">
            <div className="card-header">
              <div>
                <h2>Recent Orders</h2>
                <p>Track and manage delivery status.</p>
              </div>
              {!ordersLoading && orders.length > 0 && (
                <span className="orders-count">{orders.length} orders</span>
              )}
            </div>
            <div className="card-body">
              {ordersLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner" aria-hidden="true" />
                  <span>Loading orders…</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                      <path d="M9 12h6" />
                      <path d="M9 16h6" />
                    </svg>
                  </div>
                  <h3>No orders yet</h3>
                  <p>Create your first phone order using the form.</p>
                </div>
              ) : (
                <>
                  <div className="table-wrap">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Phone</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Source</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="cell-name">{order.first_name}</td>
                            <td className="cell-phone">{order.phone}</td>
                            <td className="cell-amount">
                              ${(order.total_amount / 100).toFixed(2)}
                            </td>
                            <td>
                              <StatusBadge status={order.status} />
                            </td>
                            <td>
                              <SourceBadge source={order.order_source} />
                            </td>
                            <td className="cell-date">
                              {formatDate(order.created_at)}
                            </td>
                            <td>{renderOrderActions(order)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="order-cards">
                    {orders.map((order) => (
                      <div key={order.id} className="order-card">
                        <div className="order-card-top">
                          <div>
                            <p className="order-card-name">{order.first_name}</p>
                            <p className="order-card-phone">{order.phone}</p>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="order-card-details">
                          <div className="order-card-detail">
                            <span>Total</span>
                            <span>${(order.total_amount / 100).toFixed(2)}</span>
                          </div>
                          <div className="order-card-detail">
                            <span>Source</span>
                            <span>{order.order_source || "phone"}</span>
                          </div>
                          <div className="order-card-detail">
                            <span>Date</span>
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                        </div>
                        {renderOrderActions(order)}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div
          className={`toast toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.type === "success" ? <CheckIcon /> : <AlertIcon />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
