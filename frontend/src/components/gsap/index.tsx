import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Helper: detect prefers-reduced-motion                               */
/* ------------------------------------------------------------------ */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>";

/* ------------------------------------------------------------------ */
/* GsapScrambleText — characters scramble from random to real text    */
/* on scroll into view (or on mount with delay). Manual char split.   */
/* ------------------------------------------------------------------ */

export function GsapScrambleText({
  children,
  className = "",
  scrambleDuration = 1.2,
  stagger = 0.035,
  triggerOnScroll = true,
  startDelay = 0,
  tag: Tag = "span",
}: {
  children: string;
  className?: string;
  /** Total per-character scramble+resolve time (s). */
  scrambleDuration?: number;
  /** Stagger between characters starting to resolve (s). */
  stagger?: number;
  /** Use ScrollTrigger (true) or mount-delayed timeline (false). */
  triggerOnScroll?: boolean;
  /** Extra delay before scramble starts (s), for mount-triggered mode. */
  startDelay?: number;
  tag?: "span" | "h1" | "h2" | "h3" | "p" | "div";
}) {
  const containerRef = useRef<HTMLElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const text = typeof children === "string" ? children : String(children);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = containerRef.current;
      if (!el) return;

      const chars = charsRef.current.filter(Boolean);
      if (chars.length === 0) return;

      // Set initial scrambled state
      chars.forEach((span) => {
        if (span.textContent !== " ") {
          span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      });

      const tl = gsap.timeline({
        delay: triggerOnScroll ? 0 : startDelay,
        scrollTrigger: triggerOnScroll
          ? {
              trigger: el,
              start: "top 85%",
              once: true,
            }
          : undefined,
      });

      chars.forEach((span, i) => {
        const finalChar = text[i] || " ";
        if (finalChar === " ") return; // skip spaces

        const proxy = { progress: 0 };
        tl.to(
          proxy,
          {
            progress: 1,
            duration: scrambleDuration,
            ease: "none",
            onUpdate() {
              const p = proxy.progress;
              // Show random chars for 75% of the duration, then snap to real char
              span.textContent =
                p > 0.75
                  ? finalChar
                  : CHARS[Math.floor(Math.random() * CHARS.length)];
            },
          },
          i * stagger,
        );
      });
    },
    { scope: containerRef, dependencies: [text] },
  );

  return (
    <Tag
      ref={containerRef as React.Ref<any>}
      className={className}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            if (el) charsRef.current[i] = el;
          }}
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : undefined,
          }}
          aria-hidden="true"
        >
          {prefersReducedMotion() ? char : CHARS[Math.floor(Math.random() * CHARS.length)]}
        </span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* GsapScrollReveal — ScrollTrigger.batch wrapper that staggers        */
/* direct children in with transform + opacity. 60fps-safe.           */
/* ------------------------------------------------------------------ */

export function GsapScrollReveal({
  children,
  className = "",
  staggerAmount = 0.1,
  y = 40,
  rotateX = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger between children (s). */
  staggerAmount?: number;
  /** Slide-up distance (px). */
  y?: number;
  /** Slight 3D tilt (deg). */
  rotateX?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = containerRef.current;
      if (!el) return;

      const items = Array.from(el.children) as HTMLElement[];
      if (items.length === 0) return;

      gsap.set(items, {
        opacity: 0,
        y,
        rotateX,
        transformPerspective: 800,
        transformOrigin: "center bottom",
      });

      ScrollTrigger.batch(items, {
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: staggerAmount,
            ease: "power3.out",
          });
        },
        start: "top 90%",
        once: true,
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GsapTextSplit — word-by-word scroll-scrub reveal (gsap.com style)  */
/* ------------------------------------------------------------------ */

export function GsapTextSplit({
  children,
  className = "",
  innerClassName = "",
  as: Tag = "p",
}: {
  children: string;
  className?: string;
  innerClassName?: string;
  as?: "p" | "h2" | "h3" | "div";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const text = typeof children === "string" ? children : String(children);
  const words = text.split(/(\s+)/); // keep spaces as tokens

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = containerRef.current;
      if (!el) return;

      const wordEls = wordsRef.current.filter(Boolean);
      if (wordEls.length === 0) return;

      gsap.set(wordEls, { opacity: 0.15, y: 8 });

      gsap.to(wordEls, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "top 30%",
          scrub: 0.8,
        },
      });
    },
    { scope: containerRef, dependencies: [text] },
  );

  return (
    <div ref={containerRef} className={className}>
      <Tag className={innerClassName} aria-label={text}>
        {words.map((word, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) wordsRef.current[i] = el;
            }}
            style={{
              display: "inline-block",
              willChange: "opacity, transform",
            }}
          >
            {word}
          </span>
        ))}
      </Tag>
    </div>
  );
}
