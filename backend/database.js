const Database = require("better-sqlite3");

const path = require("path");
const dbPath =
  process.env.DATABASE_PATH || path.join(__dirname, "propane.db");
const db = new Database(dbPath);

console.log(`Database: ${dbPath}`);

db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    phone TEXT,
    address TEXT,
    items TEXT,
    total_amount INTEGER,
    status TEXT DEFAULT 'pending',
    stripe_payment_link TEXT,
    stripe_session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const columns = db.prepare("PRAGMA table_info(orders)").all();
const columnNames = columns.map((col) => col.name);

if (!columnNames.includes("stripe_session_id")) {
  db.prepare("ALTER TABLE orders ADD COLUMN stripe_session_id TEXT").run();
}
if (!columnNames.includes("delivery_lat")) {
  db.prepare("ALTER TABLE orders ADD COLUMN delivery_lat REAL").run();
}
if (!columnNames.includes("delivery_lng")) {
  db.prepare("ALTER TABLE orders ADD COLUMN delivery_lng REAL").run();
}
if (!columnNames.includes("order_source")) {
  db.prepare("ALTER TABLE orders ADD COLUMN order_source TEXT DEFAULT 'phone'").run();
}

module.exports = db;