// Local dev: Vite proxies /api → localhost:5000
// Vercel: vercel.json proxies /api → Render backend
// Override anytime with VITE_API_URL in env
const PRODUCTION_API = "https://propane-mvp.onrender.com/api";

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PRODUCTION_API : "/api");
