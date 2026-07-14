require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const twilio = require("twilio");
const db = require("./database");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const path = require("path");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function getAllowedOrigins() {
  if (process.env.CORS_ALLOWED_ORIGINS) {
    return process.env.CORS_ALLOWED_ORIGINS.split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return [
    ...FRONTEND_URL.split(",").map((url) => url.trim()),
    "http://localhost:5173",
    "http://localhost:4173",
  ].filter(Boolean);
}

const ALLOWED_ORIGINS = [...new Set(getAllowedOrigins())];

const PRODUCTS = {
  "20lb Propane Tank": 2500,
  "30lb Propane Tank": 3500,
  "40lb Propane Tank": 4500,
  "Forklift Tank": 4000,
};

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function normalizePhone(phone) {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  return trimmed;
}

function validateEnv() {
  const required = [
    "STRIPE_SECRET_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
  ];

  for (const key of required) {
    const value = process.env[key];
    if (!value || value.startsWith("your_")) {
      console.warn(`Warning: ${key} is missing or still a placeholder`);
    }
  }
}

validateEnv();

function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Add at least one item to your order");
  }

  const normalized = [];
  let totalAmount = 0;

  for (const item of items) {
    const unitCents = PRODUCTS[item.product];
    if (!unitCents) {
      throw new Error(`Invalid product: ${item.product}`);
    }

    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 0));
    normalized.push({
      product: item.product,
      quantity,
      price: unitCents / 100,
    });
    totalAmount += unitCents * quantity;
  }

  return { items: normalized, totalAmount };
}

async function createCheckoutSession({
  firstName,
  phone,
  items,
  successUrl,
  cancelUrl,
}) {
  const { items: orderItems } = validateOrderItems(items);

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: undefined,
    phone_number_collection: { enabled: true },
    line_items: orderItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.product },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { phone, firstName },
  });
}

function saveOrder({
  firstName,
  phone,
  address,
  items,
  totalAmount,
  session,
  orderSource,
  deliveryLat,
  deliveryLng,
}) {
  return db
    .prepare(
      `INSERT INTO orders
       (first_name, phone, address, items, total_amount, stripe_payment_link, stripe_session_id, order_source, delivery_lat, delivery_lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      firstName,
      phone,
      address,
      JSON.stringify(items),
      totalAmount,
      session.url,
      session.id,
      orderSource,
      deliveryLat ?? null,
      deliveryLng ?? null
    );
}

function handleCheckoutCompleted(session) {
  if (session.payment_status !== "paid") {
    return;
  }

  const result = db
    .prepare(
      `UPDATE orders
       SET status = 'paid'
       WHERE stripe_session_id = ?
         AND status = 'pending'`
    )
    .run(session.id);

  if (result.changes > 0) {
    console.log(`Order marked paid for Stripe session ${session.id}`);
    return;
  }

  const existing = db
    .prepare("SELECT id, status FROM orders WHERE stripe_session_id = ?")
    .get(session.id);

  if (existing) {
    console.log(`Order ${existing.id} already ${existing.status}`);
  } else {
    console.warn(`No order found for Stripe session ${session.id}`);
  }
}

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return res.status(500).send("Webhook secret not configured");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
      handleCheckoutCompleted(event.data.object);
    }

    res.json({ received: true });
  }
);

app.use(
  cors({
    origin(origin, callback) {
      // Server-to-server tools (curl, Postman) send no Origin header.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error(`CORS not allowed for origin: ${origin}`));
      }
    },
  })
);
app.use(express.json());

app.get("/api/products", (_req, res) => {
  res.json(
    Object.entries(PRODUCTS).map(([name, cents]) => ({
      name,
      price: cents / 100,
      priceCents: cents,
    }))
  );
});

app.post("/api/checkout", async (req, res) => {
  try {
    const {
      firstName,
      phone,
      deliveryLocation,
      items,
      deliveryLat,
      deliveryLng,
    } = req.body;

    if (!firstName || !phone || !deliveryLocation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { items: orderItems, totalAmount } = validateOrderItems(items);
    const customerPhone = normalizePhone(phone);

    let address = deliveryLocation.trim();
    if (deliveryLat != null && deliveryLng != null) {
      address += `\n[GPS: ${deliveryLat}, ${deliveryLng}]`;
    }

    console.log(`QR checkout for ${firstName} (${customerPhone})...`);

    const session = await createCheckoutSession({
      firstName,
      phone: customerPhone,
      items: orderItems,
      successUrl: `${FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${FRONTEND_URL}/order?canceled=1`,
    });

    const result = saveOrder({
      firstName,
      phone: customerPhone,
      address,
      items: orderItems,
      totalAmount,
      session,
      orderSource: "qr",
      deliveryLat,
      deliveryLng,
    });

    console.log(`Order #${result.lastInsertRowid} → Stripe ${session.id}`);

    res.json({
      success: true,
      orderId: result.lastInsertRowid,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Checkout failed:", error);
    res.status(500).json({
      error: error.type?.startsWith("Stripe")
        ? `Stripe: ${error.message}`
        : error.message || "Checkout failed",
    });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { firstName, phone, address, items } = req.body;

    if (!firstName || !phone || !address || !items?.length) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    const customerPhone = normalizePhone(phone);
    console.log(`Creating phone order for ${firstName} (${customerPhone})...`);

    const { items: orderItems, totalAmount } = validateOrderItems(items);

    const session = await createCheckoutSession({
      firstName,
      phone: customerPhone,
      items: orderItems,
      successUrl: `${FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${FRONTEND_URL}/admin`,
    });

    const result = saveOrder({
      firstName,
      phone: customerPhone,
      address,
      items: orderItems,
      totalAmount,
      session,
      orderSource: "phone",
    });

    let smsSent = false;
    let smsError = null;

    try {
      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customerPhone,
        body: `Hi ${firstName}, here is your propane delivery payment link: ${session.url}`,
      });
      smsSent = true;
      console.log(`SMS sent to ${customerPhone}`);
    } catch (error) {
      smsError = error.message;
      console.error("Twilio SMS failed:", error.message);
    }

    res.json({
      success: true,
      orderId: result.lastInsertRowid,
      paymentLink: session.url,
      smsSent,
      smsError,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({
      error: error.type?.startsWith("Stripe")
        ? `Stripe: ${error.message}`
        : error.message || "Order creation failed",
    });
  }
});

app.get("/api/orders", (req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC")
    .all();
  res.json(orders);
});

app.patch("/api/orders/:id/delivered", (req, res) => {
  db.prepare("UPDATE orders SET status = 'delivered' WHERE id = ?").run(
    req.params.id
  );
  res.json({ success: true });
});

// Optional: serve built frontend from same host (no CORS needed).
// Set SERVE_FRONTEND=true on Render and build frontend into ../frontend/dist
if (process.env.SERVE_FRONTEND === "true") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Backend running on port ${process.env.PORT}`);
  console.log(`FRONTEND_URL (Stripe redirects): ${FRONTEND_URL}`);
  console.log(`CORS allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
