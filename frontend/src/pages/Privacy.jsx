import { Link } from "react-router-dom";
import { CustomerHeader, CustomerFooter } from "../components/CustomerLayout";
import { BRAND } from "../config/brand";
import "./Legal.css";

export default function Privacy() {
  return (
    <div className="cust-page">
      <CustomerHeader minimal />
      <main className="cust-main legal-page">
        <article className="legal-doc">
          <Link to="/" className="legal-back">
            ← Back to home
          </Link>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <p>
            This Privacy Policy describes how <strong>{BRAND.name}</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            collects, uses, and protects information when you use our website, place an order, or
            communicate with us by phone or text message.
          </p>

          <h2>Information We Collect</h2>
          <p>We may collect:</p>
          <ul>
            <li>Name and mobile phone number</li>
            <li>Delivery location or delivery instructions</li>
            <li>Order details (products, quantities, totals)</li>
            <li>Payment information processed securely by Stripe (we do not store full card numbers)</li>
            <li>Optional GPS coordinates if you share your location</li>
          </ul>

          <h2>How We Use Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Fulfill propane delivery orders</li>
            <li>Process payments through Stripe</li>
            <li>Send transactional text messages about your order, payment link, or delivery status</li>
            <li>Respond to customer service requests</li>
          </ul>

          <h2>SMS / Text Messaging</h2>
          <p>
            If you provide your mobile number and opt in on our website, we may send automated
            transactional text messages related to your order and delivery (for example payment links,
            order confirmations, and delivery updates). Message frequency varies based on your activity
            with us. Message and data rates may apply.
          </p>
          <p>
            You can get help by replying <strong>HELP</strong> and cancel messages anytime by
            replying <strong>STOP</strong>. After you send STOP, we will send a confirmation and no
            longer send texts to that number unless you opt in again.
          </p>
          <p>
            <strong>Mobile privacy:</strong> We do not sell, rent, or share mobile phone numbers with
            third parties or affiliates for their marketing or promotional purposes.
          </p>
          <p>
            Consent to receive text messages is not required as a condition of purchasing goods or
            services. You may also place an order by calling us at{" "}
            <a href={`tel:${BRAND.phoneTel}`}>{BRAND.phone}</a>.
          </p>

          <h2>Sharing of Information</h2>
          <p>We share information only as needed to operate our service, including with:</p>
          <ul>
            <li>Payment processors (Stripe)</li>
            <li>Messaging providers used to deliver SMS (for example Twilio)</li>
            <li>Service providers who help us run our business under confidentiality obligations</li>
          </ul>
          <p>We may also disclose information if required by law.</p>

          <h2>Data Security</h2>
          <p>
            We take reasonable measures to protect personal information. No method of transmission
            over the Internet is 100% secure.
          </p>

          <h2>Contact Us</h2>
          <p>
            Questions about this Privacy Policy? Contact {BRAND.name} at{" "}
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or{" "}
            <a href={`tel:${BRAND.phoneTel}`}>{BRAND.phone}</a>.
          </p>

          <p className="legal-nav">
            <Link to="/terms">Terms of Service</Link>
            {" · "}
            <Link to="/order">Order Propane</Link>
          </p>
        </article>
      </main>
      <CustomerFooter />
    </div>
  );
}
