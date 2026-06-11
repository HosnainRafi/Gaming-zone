/**
 * Advanced Motion Effects — Inspired by 21st.dev, Aceternity UI, Magic UI
 * Aurora backgrounds, sparkles, text animations, gradient borders
 */
import { motion } from "framer-motion";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Aurora Background ───────────────────────────────────────────────────────

export function AuroraBackground({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="pointer-events-none absolute -inset-[10px] opacity-50"
          style={{
            background:
              "repeating-linear-gradient(100deg, #7c3aed 10%, #06b6d4 15%, #ec4899 20%, #7c3aed 25%, #06b6d4 30%)",
            backgroundSize: "300% 300%",
            animation: "aurora 8s ease infinite",
            filter: "blur(80px) saturate(1.5)",
          }}
        />
        <div
          className="pointer-events-none absolute -inset-[10px] opacity-30"
          style={{
            background:
              "repeating-linear-gradient(100deg, transparent 0%, transparent 7%, rgba(255,255,255,0.05) 10%, transparent 12%, transparent 16%)",
            backgroundSize: "300% 300%",
            animation: "aurora 6s ease infinite reverse",
          }}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

// ─── Sparkles Text ───────────────────────────────────────────────────────────

interface Sparkle {
  id: string;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

function generateSparkle(colors?: string[]): Sparkle {
  const palette = colors ?? ["#7c3aed", "#06b6d4", "#ec4899", "#ffffff"];
  return {
    id: Math.random().toString(36).slice(2),
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: Math.random() * 10 + 8,
    delay: Math.random() * 2,
    duration: Math.random() * 1.5 + 0.5,
    color: palette[Math.floor(Math.random() * palette.length)],
  };
}

export function SparklesText({
  children,
  className = "",
  sparkleCount = 10,
  colors,
}: {
  children: ReactNode;
  className?: string;
  sparkleCount?: number;
  colors?: string[];
}) {
  const sparkles = useMemo(
    () => Array.from({ length: sparkleCount }, () => generateSparkle(colors)),
    [sparkleCount, colors],
  );

  return (
    <span className="relative inline-block">
      {sparkles.map((sparkle) => (
        <motion.svg
          key={sparkle.id}
          className="pointer-events-none absolute z-20"
          style={{ left: sparkle.x, top: sparkle.y, color: "unset" }}
          width={sparkle.size}
          height={sparkle.size}
          viewBox="0 0 160 160"
          fill="none"
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3 + 1,
            ease: "easeInOut",
          }}
        >
          <path
            d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
            style={{ fill: sparkle.color }}
          />
        </motion.svg>
      ))}
      <span className={`relative z-10 ${className}`}>{children}</span>
    </span>
  );
}

// ─── Animated Text Cycle ─────────────────────────────────────────────────────

export function TextCycle({
  words,
  className = "",
  interval = 3000,
}: {
  words: string[];
  className?: string;
  interval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className="relative inline-flex overflow-hidden">
      <motion.span
        key={currentIndex}
        initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
        animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
        exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          mass: 0.8,
        }}
        className={`inline-block ${className}`}
      >
        {words[currentIndex]}
      </motion.span>
    </span>
  );
}

// ─── Animated Gradient Border ────────────────────────────────────────────────

export function GradientBorder({
  children,
  className = "",
  borderWidth = 1,
  duration = 3,
}: {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  duration?: number;
}) {
  return (
    <div className={`relative rounded-2xl ${className}`}>
      <div
        className="absolute -inset-px rounded-[inherit] opacity-60"
        style={{
          background:
            "conic-gradient(from var(--border-angle, 0deg), #7c3aed, #06b6d4, #ec4899, #7c3aed)",
          animation: `spin ${duration}s linear infinite`,
          padding: borderWidth,
        }}
      />
      <div className="relative rounded-[inherit] bg-[#0d0d15]">{children}</div>
    </div>
  );
}

// ─── Floating Particles ──────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function FloatingParticles({
  count = 30,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.5 + 0.1,
      })),
    [count],
  );

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-purple-500"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [
              particle.opacity,
              particle.opacity * 1.5,
              particle.opacity,
            ],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Spotlight Card (cursor-following spotlight) ─────────────────────────────

export function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouse}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl border border-white/5 bg-[#0d0d15] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(124, 58, 237, 0.1), transparent 40%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(124, 58, 237, 0.15), transparent 40%)`,
          mixBlendMode: "overlay",
        }}
      />
      {children}
    </div>
  );
}

// ─── Animated Grid Pattern (background) ──────────────────────────────────────

export function GridPattern({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(124, 58, 237, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(124, 58, 237, 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(124, 58, 237, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(124, 58, 237, 0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 60%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 60%)",
        }}
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── Infinite Scroll Marquee (for logos/games) ───────────────────────────────

export function InfiniteMarquee({
  children,
  className = "",
  speed = 40,
  direction = "left",
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
}) {
  const animation =
    direction === "left" ? { x: ["0%", "-50%"] } : { x: ["-50%", "0%"] };

  return (
    <div
      className={`group flex overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
      }}
    >
      <motion.div
        className={`flex shrink-0 gap-6 ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        animate={animation}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// ─── Glowing Orb (animated background orb) ───────────────────────────────────

export function GlowingOrb({
  className = "",
  color = "orange",
  size = 400,
}: {
  className?: string;
  color?: "orange" | "purple" | "cyan";
  size?: number;
}) {
  const colorMap = {
    orange: "bg-orange-500/20",
    purple: "bg-purple-500/20",
    cyan: "bg-cyan-500/20",
  };

  return (
    <motion.div
      className={`absolute rounded-full blur-[100px] ${colorMap[color]} ${className}`}
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        x: [0, 20, 0],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// ─── Typewriter Effect ───────────────────────────────────────────────────────

export function Typewriter({
  text,
  className = "",
  speed = 50,
  delay = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, started]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-[2px] h-[1em] bg-purple-500 ml-0.5 align-middle"
      />
    </span>
  );
}
