import { Link } from "react-router-dom";
import { CustomerHeader, CustomerFooter } from "../components/CustomerLayout";
import { BRAND } from "../config/brand";
import "./Landing.css";

const VALUE_PROPS = [
  {
    title: "Five-Star Service",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6z" />
      </svg>
    ),
  },
  {
    title: "Great Prices",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    title: "Fast & Safe Delivery",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Happy Customers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const STEPS = [
  { num: "1", title: "Scan the QR code", desc: "On our truck, sign, or business card" },
  { num: "2", title: "Tell us where you are", desc: "Address, RV park, or drop a pin" },
  { num: "3", title: "Pay securely", desc: "Stripe handles your card — we deliver" },
];

export default function Landing() {
  return (
    <div className="cust-page">
      <CustomerHeader />

      <main className="cust-main">
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-eyebrow">{BRAND.region}</p>
            <h1>{BRAND.tagline}</h1>
            <p className="hero-sub">{BRAND.subtitle}</p>
            <div className="hero-actions">
              <Link to="/order" className="cust-btn cust-btn--white">
                Order Propane
              </Link>
              <a href={`tel:${BRAND.phoneTel}`} className="cust-btn cust-btn--outline hero-outline-btn">
                Call Us
              </a>
            </div>
          </div>
        </section>

        <section className="value-props">
          <div className="value-props-grid">
            {VALUE_PROPS.map((item) => (
              <div key={item.title} className="value-prop">
                <div className="value-prop-icon">{item.icon}</div>
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-band">
          <div className="about-card">
            <h2>We&apos;re fired up to serve you.</h2>
            <p>
              Whether you&apos;re grilling at home, heating a patio, running a forklift,
              or parked in an RV — we bring propane to you. Order online in minutes
              and we&apos;ll handle the rest.
            </p>
            <div className="about-actions">
              <Link to="/order" className="cust-btn cust-btn--primary">
                Order Now
              </Link>
              <a href={`tel:${BRAND.phoneTel}`} className="cust-btn cust-btn--outline">
                Contact Us
              </a>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <p className="section-eyebrow">How it works</p>
          <h2>Scan. Order. Delivered.</h2>
          <p className="section-sub">
            Perfect for QR codes on magnets, signs, and business cards.
          </p>
          <div className="steps-grid">
            {STEPS.map((step) => (
              <div key={step.num} className="step-card">
                <span className="step-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="services-preview">
          <div className="service-tile">
            <div className="service-tile-icon">🏠</div>
            <h3>Residential</h3>
            <p>Home grills, fire pits, and backup tanks.</p>
          </div>
          <div className="service-tile">
            <div className="service-tile-icon">🚐</div>
            <h3>RV & Remote</h3>
            <p>No street address? Share your location or describe where you are.</p>
          </div>
          <div className="service-tile">
            <div className="service-tile-icon">🏗️</div>
            <h3>Commercial</h3>
            <p>Forklifts, heaters, and job-site delivery.</p>
          </div>
        </section>

        <section className="cta-band">
          <h2>Safe, efficient, and reliable service — every single time.</h2>
          <Link to="/order" className="cust-btn cust-btn--white">
            Get Propane Delivered
          </Link>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}
