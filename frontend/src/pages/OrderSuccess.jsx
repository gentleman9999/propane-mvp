import { Link } from "react-router-dom";
import { CustomerHeader, CustomerFooter } from "../components/CustomerLayout";
import { BRAND } from "../config/brand";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  return (
    <div className="cust-page">
      <CustomerHeader minimal />

      <main className="cust-main success-page">
        <div className="success-card">
          <div className="success-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1>Thank you!</h1>
          <p className="success-lead">
            Your payment was received. We&apos;re preparing your propane delivery.
          </p>
          <ul className="success-steps">
            <li>You&apos;ll get a confirmation text shortly.</li>
            <li>Our team will head to your delivery location.</li>
            <li>Questions? Call us anytime.</li>
          </ul>
          <a href={`tel:${BRAND.phoneTel}`} className="cust-btn cust-btn--primary cust-btn--full">
            Call {BRAND.phone}
          </a>
          <Link to="/" className="success-home-link">
            Back to home
          </Link>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
