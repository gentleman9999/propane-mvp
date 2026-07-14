import { Link } from "react-router-dom";
import { BRAND } from "../config/brand";
import "./CustomerLayout.css";

export function CustomerHeader({ minimal = false }) {
  return (
    <header className="cust-header">
      <div className="cust-header-inner">
        <Link to="/" className="cust-logo">
          <span className="cust-logo-seal" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
              <path
                d="M24 10c2 5 6 7 6 12a6 6 0 1 1-12 0c0-5 4-7 6-12z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="cust-logo-text">
            <strong>{BRAND.shortName}</strong>
            <small>{BRAND.region}</small>
          </span>
        </Link>

        {!minimal && (
          <div className="cust-header-actions">
            <a href={`tel:${BRAND.phoneTel}`} className="cust-header-phone">
              {BRAND.phone}
            </a>
            <Link to="/order" className="cust-btn cust-btn--sm cust-btn--primary">
              Order Now
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export function CustomerFooter() {
  return (
    <footer className="cust-footer">
      <div className="cust-footer-inner">
        <div className="cust-footer-brand">
          <strong>{BRAND.name}</strong>
          <p>Propane delivery you can count on.</p>
        </div>
        <div className="cust-footer-contact">
          <a href={`tel:${BRAND.phoneTel}`}>{BRAND.phone}</a>
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
        </div>
        <div className="cust-footer-areas">
          <p className="cust-footer-label">Service Areas</p>
          <p>{BRAND.serviceAreas.join(" · ")}</p>
        </div>
      </div>
      <div className="cust-footer-bar">
        <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        <div className="cust-footer-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/admin" className="cust-footer-admin">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
