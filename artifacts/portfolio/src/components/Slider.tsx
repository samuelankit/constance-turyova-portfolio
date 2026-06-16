import { useState, useEffect, useCallback } from "react";

interface SlideImage {
  imageUrl: string;
  altText: string;
}

interface SliderProps {
  images: SlideImage[];
}

const FALLBACK: SlideImage[] = [
  { imageUrl: "/assets/images/slide-1-light.jpg", altText: "Performance" },
  { imageUrl: "/assets/images/slide-2-light.jpg", altText: "On Stage" },
  { imageUrl: "/assets/images/slide-3-light.jpg", altText: "Character Study" },
  { imageUrl: "/assets/images/slide-4-light.jpg", altText: "Ensemble" },
  { imageUrl: "/assets/images/slide-5-light.jpg", altText: "Theatre" },
  { imageUrl: "/assets/images/slide-6-light.jpg", altText: "Screen" },
  { imageUrl: "/assets/images/slide-7-light.jpg", altText: "Storytelling" },
];

/**
 * Per-image mobile background-position overrides.
 * Key is any unique substring of the imageUrl filename.
 * Value is the CSS background-position for mobile portrait viewports.
 * Defaults to "center top" if no match.
 */
const MOBILE_POSITIONS: Record<string, string> = {
  "m1cd0azmg1": "right center",   // B&W portrait — face is on the right
  "88s5p2k5g92": "center top",    // Snow/dagger — face centered, arms raised
  "z5qvhb31gt9": "left center",   // Fire/book — subject is on the left
  "9n61u2emiam": "center",        // Extra shot — use center
  "bt49b1k8sri": "center",        // Extra shot — use center
};

function getMobilePosition(imageUrl: string): string {
  for (const [key, pos] of Object.entries(MOBILE_POSITIONS)) {
    if (imageUrl.includes(key)) return pos;
  }
  return "center top";
}

export default function Slider({ images }: SliderProps) {
  const slides = images.length > 0 ? images : FALLBACK;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="nk-slider">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`nk-slide${i === current ? " active" : ""}`}
          style={{
            backgroundImage: `url(${s.imageUrl})`,
            ["--slide-mobile-pos" as string]: getMobilePosition(s.imageUrl),
          }}
          aria-label={s.altText}
          role="img"
        />
      ))}

      {/* Slider nav — bottom right */}
      <div
        style={{
          position: "fixed",
          bottom: 30,
          right: 40,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button className="nk-slider-nav-btn" onClick={prev} aria-label="Previous slide">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 10L6 2M6 2L2 6M6 2L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="nk-slider-dots">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`nk-dot${i === current ? " active" : ""}`}
              onClick={() => setCurrent(i)}
              role="button"
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button className="nk-slider-nav-btn" onClick={next} aria-label="Next slide">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2L6 10M6 10L10 6M6 10L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
