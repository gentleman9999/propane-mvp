export const BRAND = {
  name: "Huntington Beach Propane",
  shortName: "HB Propane",
  region: "Serving Southern California",
  tagline: "California's Best Propane Delivery Service",
  subtitle: "Safe, efficient, and reliable propane delivery — to your home, RV, or job site.",
  phone: "(805) 975-2281",
  phoneTel: "+18059752281",
  email: "info@huntingtonbeachpropane.com",
  serviceAreas: [
    "Huntington Beach",
    "Newport Beach",
    "Costa Mesa",
    "Fountain Valley",
    "Westminster",
    "Seal Beach",
  ],
};

/** Public site URL for QR codes (set VITE_SITE_URL in production). */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") || "";

/** QR codes point here — landing page, then customer taps Order. */
export const QR_TARGET_PATH = "/";

/**
 * Welcome video on the landing page.
 * Set youtubeId to your YouTube video ID (from the share link).
 * Example: https://www.youtube.com/watch?v=ABC123 → youtubeId: "ABC123"
 * Leave empty to show the poster placeholder until your video is ready.
 */
export const WELCOME_VIDEO = {
  youtubeId: "",
  title: "See How Easy It Is",
  subtitle: "Order propane delivery in under two minutes — from your phone, RV, or job site.",
  posterUrl:
    "https://images.unsplash.com/photo-1581094794329-cd293aa0a8d0?w=1200&q=80",
};

export function getQrUrl() {
  const base = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${QR_TARGET_PATH}`;
}
