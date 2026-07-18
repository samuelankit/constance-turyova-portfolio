import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useListSlides, useListPortfolioPhotos, useListPortfolioVideos } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import Slider from "@/components/Slider";

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const match = u.pathname.match(/\/embed\/([^/]+)/);
      if (match) return url;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
    return url;
  } catch {
    return null;
  }
}

export default function PortfolioPage() {
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: slides } = useListSlides();
  const { data: photos, isLoading: photosLoading } = useListPortfolioPhotos();
  const { data: videos, isLoading: videosLoading } = useListPortfolioVideos();

  const photoList = photos ?? [];
  const slideData = (slides ?? []).map((s) => ({ imageUrl: s.imageUrl, altText: s.altText }));

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);
  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i < photoList.length - 1 ? i + 1 : i));
  }, [photoList.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  const panel = (
    <div>
      <div className="nk-tab-nav" style={{ marginBottom: 24 }}>
        <button
          className={`nk-tab-btn${tab === "photos" ? " active" : ""}`}
          onClick={() => setTab("photos")}
        >
          Photos
        </button>
        <button
          className={`nk-tab-btn${tab === "videos" ? " active" : ""}`}
          onClick={() => setTab("videos")}
        >
          Videos
        </button>
      </div>

      {tab === "photos" && (
        <div className="nk-tab-content active">
          {photosLoading && (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div className="nk-spinner" style={{ margin: "0 auto" }} />
            </div>
          )}
          {!photosLoading && photoList.length === 0 && (
            <p style={{ color: "var(--color-muted)", paddingTop: 20 }}>No photos yet.</p>
          )}
          <div className="nk-portfolio-masonry">
            {photoList.map((photo, idx) => (
              <div
                key={photo.id}
                className="nk-portfolio-photo"
                onClick={() => setLightboxIndex(idx)}
              >
                <img src={photo.imageUrl} alt={photo.altText} loading="lazy" />
                <div className="nk-portfolio-photo-overlay">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "videos" && (
        <div className="nk-tab-content active">
          {videosLoading && (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div className="nk-spinner" style={{ margin: "0 auto" }} />
            </div>
          )}
          {!videosLoading && (videos ?? []).length === 0 && (
            <p style={{ color: "var(--color-muted)", paddingTop: 20 }}>No videos yet.</p>
          )}
          <div className="nk-portfolio-videos">
            {(videos ?? []).map((video) => {
              const embedUrl = getEmbedUrl(video.videoUrl);
              return (
                <div key={video.id} className="nk-portfolio-video-item">
                  {embedUrl ? (
                    <div className="nk-video-embed-wrap">
                      <iframe
                        src={embedUrl}
                        title={video.title || "Video"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="nk-video-embed-wrap nk-video-invalid">
                      <p style={{ color: "var(--color-muted)", fontSize: 13 }}>Invalid video URL</p>
                    </div>
                  )}
                  {video.title && (
                    <p className="nk-portfolio-video-title">{video.title}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const currentPhoto = lightboxIndex !== null ? photoList[lightboxIndex] : null;

  return (
    <>
      <Helmet>
        <title>My Portfolio &mdash; Constance T</title>
        <meta
          name="description"
          content="Photo and video portfolio of Constance T — actor, performer, and storyteller."
        />
        <meta property="og:title" content="My Portfolio — Constance T" />
      </Helmet>

      <Layout
        slider={<Slider images={slideData} />}
        blogPanel={panel}
        pageTitle="Portfolio."
        bottomLeft={
          <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5 }}>
            Portfolio
          </span>
        }
      />

      {lightboxIndex !== null && currentPhoto && (
        <div className="nk-lightbox" onClick={closeLightbox}>
          <button className="nk-lightbox-close" onClick={closeLightbox} aria-label="Close">×</button>

          <button
            className="nk-lightbox-nav nk-lightbox-prev"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous photo"
            disabled={lightboxIndex === 0}
          >
            ‹
          </button>

          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.altText}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="nk-lightbox-nav nk-lightbox-next"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next photo"
            disabled={lightboxIndex === photoList.length - 1}
          >
            ›
          </button>

          <div className="nk-lightbox-counter" onClick={(e) => e.stopPropagation()}>
            {lightboxIndex + 1} / {photoList.length}
          </div>
        </div>
      )}
    </>
  );
}
