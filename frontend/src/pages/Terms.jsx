import { Link } from "react-router-dom";
import { CustomerHeader, CustomerFooter } from "../components/CustomerLayout";
import { BRAND } from "../config/brand";
import "./Legal.css";

export default function Terms() {
  return (
    <div className="cust-page">
      <CustomerHeader minimal />
      <main className="cust-main legal-page">
        <article className="legal-doc">
          <Link to="/" className="legal-back">
            ← Back to home
          </Link>
          <h1>Terms of Service</h1>
          <p className="legal-updated">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of the website and ordering
            services of <strong>{BRAND.name}</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            By using our site or placing an order, you agree to these Terms.
          </p>

          <h2>Orders &amp; Delivery</h2>
          <p>
            You agree to provide accurate customer, contact, and delivery location information.
            Delivery may be to a street address, RV site, job site, or other location you describe.
            Service areas currently include: {BRAND.serviceAreas.join(", ")}.
          </p>
          <p>
            Pricing for propane products is shown at checkout. We reserve the right to correct
            pricing errors and to refuse or cancel orders when necessary.
          </p>

          <h2>Payments</h2>
          <p>
            Payments are processed securely by Stripe. By completing checkout, you authorize the
            charge for the items you select. We do not store full payment card numbers on our servers.
          </p>

          <h2>SMS Communications</h2>
          <p>
            If you opt in to text messages on our website, you consent to receive automated
            transactional SMS from {BRAND.name} about your orders (such as payment links, confirmations,
            and delivery updates). Message frequency varies. Message and data rates may apply.
          </p>
          <p>
            Reply <strong>HELP</strong> for help or <strong>STOP</strong> to cancel. Consent to SMS
            is not required as a condition of purchase. You may call{" "}
            <a href={`tel:${BRAND.phoneTel}`}>{BRAND.phone}</a> to place an order without opting in
            to texts.
          </p>
          <p>
            Our <Link to="/privacy">Privacy Policy</Link> explains how we handle mobile numbers.
            We do not sell or share mobile phone numbers with third parties for their marketing.
          </p>

          <h2>Product Safety</h2>
          <p>
            Propane cylinders must be handled and used safely. Follow all manufacturer and safety
            instructions. You are responsible for providing a safe delivery location and complying
            with local regulations.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, {BRAND.name} is not liable for indirect,
            incidental, or consequential damages arising from use of our website or services.
          </p>

          <h2>Contact</h2>
          <p>
            {BRAND.name}
            <br />
            <a href={`tel:${BRAND.phoneTel}`}>{BRAND.phone}</a>
            <br />
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </p>

          <p className="legal-nav">
            <Link to="/privacy">Privacy Policy</Link>
            {" · "}
            <Link to="/order">Order Propane</Link>
          </p>
        </article>
      </main>
      <CustomerFooter />
    </div>
  );
}
