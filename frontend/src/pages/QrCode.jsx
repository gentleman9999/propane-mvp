import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { CustomerHeader, CustomerFooter } from "../components/CustomerLayout";
import { BRAND, getQrUrl, QR_TARGET_PATH } from "../config/brand";
import "./QrCode.css";

export default function QrCode() {
  const canvasRef = useRef(null);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    setQrUrl(getQrUrl());
  }, []);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 40;
    const qrSize = 280;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = qrSize + padding * 2;
    exportCanvas.height = qrSize + padding * 2 + 80;
    const ctx = exportCanvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    ctx.drawImage(canvas, padding, padding, qrSize, qrSize);

    ctx.fillStyle = "#1a2a5a";
    ctx.font = "bold 18px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(BRAND.shortName, exportCanvas.width / 2, qrSize + padding + 36);

    ctx.fillStyle = "#64748b";
    ctx.font = "13px DM Sans, sans-serif";
    ctx.fillText("Scan to order propane", exportCanvas.width / 2, qrSize + padding + 58);

    const link = document.createElement("a");
    link.download = `${BRAND.shortName.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cust-page qr-page">
      <CustomerHeader minimal />

      <main className="cust-main">
        <div className="qr-container">
          <div className="qr-no-print">
            <Link to="/admin" className="qr-back">
              ← Back to admin
            </Link>
            <h1>Order QR Code</h1>
            <p className="qr-lead">
              Print this on business cards, magnets, truck decals, sandwich boards,
              and postcards. Scanning opens your welcome page.
            </p>
          </div>

          <div className="qr-print-sheet">
            <div className="qr-brand">
              <span className="qr-brand-seal" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M24 10c2 5 6 7 6 12a6 6 0 1 1-12 0c0-5 4-7 6-12z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <div>
                <strong>{BRAND.name}</strong>
                <span>{BRAND.region}</span>
              </div>
            </div>

            {qrUrl && (
              <div className="qr-code-wrap">
                <QRCodeCanvas
                  ref={canvasRef}
                  value={qrUrl}
                  size={280}
                  level="H"
                  marginSize={2}
                  bgColor="#ffffff"
                  fgColor="#1a2a5a"
                />
              </div>
            )}

            <p className="qr-scan-label">Scan to order propane</p>
            <p className="qr-url">{qrUrl || "…"}</p>
            <p className="qr-phone">{BRAND.phone}</p>
          </div>

          <div className="qr-actions qr-no-print">
            <button type="button" className="cust-btn cust-btn--primary" onClick={downloadPng}>
              Download PNG
            </button>
            <button type="button" className="cust-btn cust-btn--outline" onClick={handlePrint}>
              Print
            </button>
          </div>

          <div className="qr-tips qr-no-print">
            <h2>Tips for print</h2>
            <ul>
              <li>Minimum size: 1″ × 1″ (2.5 cm) for reliable phone scans.</li>
              <li>Leave quiet space around the code — no text or graphics touching edges.</li>
              <li>QR links to: <code>{QR_TARGET_PATH}</code> on your public site.</li>
              <li>
                Set <code>VITE_SITE_URL</code> in <code>frontend/.env</code> before
                generating for production (e.g. your deployed domain).
              </li>
            </ul>
          </div>
        </div>
      </main>

      <div className="qr-no-print">
        <CustomerFooter />
      </div>
    </div>
  );
}
