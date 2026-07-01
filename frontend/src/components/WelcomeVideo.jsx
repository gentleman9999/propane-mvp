import { Link } from "react-router-dom";
import { WELCOME_VIDEO } from "../config/brand";
import "./WelcomeVideo.css";

export default function WelcomeVideo() {
  const { youtubeId, title, subtitle, posterUrl } = WELCOME_VIDEO;
  const hasVideo = Boolean(youtubeId?.trim());

  return (
    <section className="welcome-video" aria-labelledby="welcome-video-title">
      <div className="welcome-video-inner">
        <div className="welcome-video-copy">
          <p className="section-eyebrow">Welcome</p>
          <h2 id="welcome-video-title">{title}</h2>
          <p className="welcome-video-sub">{subtitle}</p>
          <Link to="/order" className="cust-btn cust-btn--primary welcome-video-cta">
            Start Your Order
          </Link>
        </div>

        <div className="welcome-video-player">
          {hasVideo ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title={`${title} — welcome video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              className="welcome-video-poster"
              style={{ backgroundImage: `url(${posterUrl})` }}
            >
              <div className="welcome-video-poster-overlay">
                <span className="welcome-video-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <p>Your welcome video will appear here.</p>
                <small>
                  Add your YouTube ID in{" "}
                  <code>src/config/brand.js</code>
                </small>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
