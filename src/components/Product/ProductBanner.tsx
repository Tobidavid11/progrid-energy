import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./ProductBanner.css";

import banner1 from "../../assets/Banner1.png";
import banner2 from "../../assets/Banner2.png";
import banner3 from "../../assets/Banner3.png";
// Optional tighter mobile crops — remove the ones you don't have.
// import banner1Mobile from "../../assets/banners/banner-1-mobile.jpg";

/**
 * A single banner slide. The image itself IS the design (text,
 * pricing, branding already baked in by whoever made the graphic) —
 * this component only handles cycling, not layout on top of it.
 */
export interface BannerSlide {
  id: string | number;
  /** Desktop / tablet image. Recommended 1600x600px — see sizing notes. */
  image: string;
  /** Optional tighter crop shown only below 600px. Falls back to `image`. */
  mobileImage?: string;
  /** Where the slide links to when clicked. Omit for a non-clickable slide. */
  href?: string;
  /** Accessible label for screen readers, since the text lives inside the image. */
  alt: string;
}

// The default set of slides — edit this array to change what
// shows on the site. `<ProductBanner />` with no props uses this.
const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: 1,
    image: banner1,
    // mobileImage: banner1Mobile,
    href: "/products?category=sale",
    alt: "Weekend flash sale",
  },
  {
    id: 2,
    image: banner2,
    href: "/products?filter=new",
    alt: "New arrivals for August",
  },
  {
    id: 3,
    image: banner3,
    alt: "Independence Day flyer",
  },
];

interface ProductsBannerProps {
  /** Overrides the built-in slide set above, if you ever need to. */
  slides?: BannerSlide[];
  autoPlay?: boolean;
  /** ms between auto-advances */
  interval?: number;
  className?: string;
}

export default function ProductsBanner({
  slides = DEFAULT_SLIDES,
  autoPlay = true,
  interval = 5500,
  className = "",
}: ProductsBannerProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > index ? 1 : -1);
      setIndex(((next % count) + count) % count);
    },
    [count, index]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay
  useEffect(() => {
    if (!autoPlay || isPaused || count <= 1) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [autoPlay, isPaused, interval, next, count]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  if (count === 0) return null;
  const slide = slides[index];

  const Slide = (
    <picture className="pbanner__media">
      <source media="(max-width: 599px)" srcSet={slide.mobileImage || slide.image} />
      <img
        src={slide.image}
        alt={slide.alt}
        className="pbanner__img"
        loading={index === 0 ? "eager" : "lazy"}
      />
    </picture>
  );

  return (
    <div
      className={`pbanner ${className}`}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="pbanner__viewport">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {slide.href ? (
            <motion.a
              key={slide.id}
              href={slide.href}
              className="pbanner__slide"
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {Slide}
            </motion.a>
          ) : (
            <motion.div
              key={slide.id}
              className="pbanner__slide"
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {Slide}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          {/* <button className="pbanner__arrow pbanner__arrow--prev" aria-label="Previous slide" onClick={prev}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button> */}
          {/* <button className="pbanner__arrow pbanner__arrow--next" aria-label="Next slide" onClick={next}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button> */}

          <div className="pbanner__dots" role="tablist" aria-label="Slide selection">
            {slides.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                className={`pbanner__dot ${i === index ? "is-active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}