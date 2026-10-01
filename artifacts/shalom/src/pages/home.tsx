import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pause, Play } from "lucide-react";
import { currentConference } from "@/data/conferences";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

const HERO_SEGMENT_COUNT = 15;
const HERO_DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const HERO_POSTER = "/images/home/shalom-hero-poster.webp";
const HERO_FLYER = currentConference.flyer ?? currentConference.image;
const HERO_CROSSFADE_MS = 700; // keep in step with duration-700 on the video elements
// Countdown target comes from the conference data so there is one place to update.
const CONFERENCE_START = currentConference.startsAt
  ? new Date(currentConference.startsAt).getTime()
  : null;

const heroSegmentSrc = (segment: number) =>
  `/videos/shalom-hero-segments/segment-${String(segment + 1).padStart(2, "0")}.mp4`;

function HeroRain({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} aria-hidden="true" className="hero-rain" data-running={enabled && inView}>
      {Array.from({ length: 36 }, (_, index) => (
        <span key={index} className={index > 19 ? "rain-drop rain-drop-desktop" : "rain-drop"} style={{
          left: `${(index * 37 + 7) % 100}%`,
          height: `${45 + (index * 19) % 75}px`,
          animationDuration: `${1.8 + (index % 7) * 0.24}s`,
          animationDelay: `${-index * 0.37}s`,
          opacity: 0.2 + (index % 4) * 0.1,
        }} />
      ))}
    </div>
  );
}

function ScrollPage({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 30 });
  const rotateX = useTransform(progress, [0, 0.3, 0.42, 0.65, 1], [18, 4, 0, 0, -16]);
  const scale = useTransform(progress, [0, 0.35, 0.65, 1], [0.94, 1, 1, 0.96]);
  const foldOpacity = useTransform(progress, [0, 0.35, 0.65, 1], [0.65, 0, 0, 0.55]);

  return (
    <div ref={ref} className="home-scroll-chapter" data-testid="scroll-page">
      <motion.div className="home-scroll-page" style={{ rotateX: enabled ? rotateX : 0, scale: enabled ? scale : 1 }}>
        {children}
        <motion.div aria-hidden="true" className="home-page-fold" style={{ opacity: enabled ? foldOpacity : 0 }} />
      </motion.div>
    </div>
  );
}

function getCountdownParts() {
  const remaining = Math.max(0, (CONFERENCE_START ?? 0) - Date.now());

  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining % 86_400_000) / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1_000),
    hasStarted: remaining === 0,
  };
}

function ConferenceCountdown() {
  const [countdown, setCountdown] = useState(getCountdownParts);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdownParts());
    }, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  if (CONFERENCE_START === null) return null;

  const units = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Minutes", value: countdown.minutes },
    { label: "Seconds", value: countdown.seconds },
  ];

  return (
    <section className="border-y border-white/10 bg-[#090910] px-4 py-14 text-white sm:px-6 sm:py-16">
      <div className="container mx-auto max-w-5xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f9591f]">
          {countdown.hasStarted ? "Happening now" : "Countdown"}
        </p>
        <h2
          className="mt-4 text-3xl font-bold uppercase tracking-wide sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {countdown.hasStarted ? "Shalom 2026 is happening now" : "Doors open Friday at 7 PM"}
        </h2>

        {!countdown.hasStarted && (
          <div
            className="mx-auto mt-10 grid max-w-3xl grid-cols-4 border-y border-white/15"
            aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, and ${countdown.seconds} seconds until Shalom 2026`}
          >
            {units.map((unit, index) => (
              <div
                key={unit.label}
                className={`py-6 sm:py-8 ${index > 0 ? "border-l border-white/15" : ""}`}
              >
                <span className="block font-mono text-3xl font-bold tabular-nums sm:text-6xl">
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-white/60 sm:text-xs sm:tracking-[0.25em]">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Hero video. The footage is 15 ten-second clips. Two <video>
 * elements take turns: while one plays, the other has the next clip loaded
 * and waiting, so the handoff is a short crossfade instead of a remount,
 * a black frame, and a flash of the poster.
 */
function HeroVideo({ enabled }: { enabled: boolean }) {
  const players = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  // Which player is on screen, and which clip each player currently holds.
  const [active, setActive] = useState(0);
  const [segments, setSegments] = useState<[number, number]>([0, 1]);

  const play = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    // Set both before play(). iOS evaluates autoplay eligibility against the
    // muted property, not just the attribute.
    video.defaultMuted = true;
    video.muted = true;
    video.play().catch(() => {
      // Autoplay refused: the poster stays up, which is fine.
    });
  }, []);

  // Start, pause, or resume the visible player whenever eligibility changes.
  useEffect(() => {
    const visible = players[active].current;
    if (!enabled) {
      players.forEach((player) => player.current?.pause());
      return;
    }
    if (!visible) return;

    const tryPlay = () => play(visible);
    tryPlay();
    visible.addEventListener("canplay", tryPlay);
    return () => visible.removeEventListener("canplay", tryPlay);
    // players[] refs are stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, enabled, play]);

  // Swapping src resets a <video> to its poster, so wait until the outgoing
  // player has fully faded before pointing it at the next clip.
  const swapTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
    },
    [],
  );

  const handleEnded = (index: number) => {
    if (!enabled || index !== active) return;
    const next = index === 0 ? 1 : 0;
    play(players[next].current);
    setActive(next);
    swapTimer.current = window.setTimeout(() => {
      setSegments((current) => {
        const updated: [number, number] = [...current];
        updated[index] = (current[next] + 1) % HERO_SEGMENT_COUNT;
        return updated;
      });
    }, HERO_CROSSFADE_MS + 50);
  };

  return (
    <>
      {players.map((ref, index) => (
        <video
          key={index}
          ref={ref}
          src={heroSegmentSrc(segments[index])}
          muted
          playsInline
          preload="auto"
          poster={index === 0 ? HERO_POSTER : undefined}
          onEnded={() => handleEnded(index)}
          aria-hidden="true"
          className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-700 ease-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}

function MobileHero({ children, enabled, reducedMotion, onToggleMotion }: { children: React.ReactNode; enabled: boolean; reducedMotion: boolean; onToggleMotion: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const inView = useInView(heroRef, { amount: 0.6 });
  const [panel, setPanel] = useState<0 | 1 | 2>(0);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);

  useEffect(() => {
    if (!inView || !enabled || reducedMotion || !autoAdvanceEnabled) return;
    const videoTimer = window.setTimeout(() => {
      setPanel(1);
    }, 4_000);
    const flyerTimer = window.setTimeout(() => {
      setPanel(2);
      setAutoAdvanceEnabled(false);
    }, 8_000);
    return () => {
      window.clearTimeout(videoTimer);
      window.clearTimeout(flyerTimer);
    };
  }, [inView, enabled, reducedMotion, autoAdvanceEnabled]);

  const flipButtonLabel =
    panel === 0 ? "Flip to video" : panel === 1 ? "Flip to flyer" : "Back to the title";

  return (
    <div ref={heroRef} className="relative mx-auto w-full max-w-xl" style={{ perspective: 1400 }}>
      <motion.div
        className="grid"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: panel === 0 ? 0 : 180 }}
        transition={{ duration: reducedMotion || !enabled ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          aria-hidden={panel !== 0}
          inert={panel !== 0}
          onFocusCapture={() => setAutoAdvanceEnabled(false)}
          onPointerDownCapture={() => setAutoAdvanceEnabled(false)}
          className="col-start-1 row-start-1 self-center [backface-visibility:hidden]"
          data-testid="hero-front"
        >
          {children}
        </div>
        <div
          aria-hidden={panel === 0}
          inert={panel === 0}
          className="col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          data-testid="hero-back"
        >
          <motion.div
            className="grid"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: panel === 2 ? 180 : 0 }}
            transition={{ duration: reducedMotion || !enabled ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              aria-hidden={panel !== 1}
              inert={panel !== 1}
              className="col-start-1 row-start-1 [backface-visibility:hidden]"
              data-testid="hero-video-panel"
            >
              <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-black/10 bg-black shadow-lg" data-testid="video-home-hero">
                <img src={HERO_POSTER} alt="" width={960} height={540} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
                <HeroVideo enabled={enabled && panel === 1 && inView} />
                <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              {currentConference.scriptureText && (
                <div className="mt-5 rounded-2xl border border-primary/20 bg-card p-5 text-foreground" data-testid="hero-scripture">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{currentConference.scripture}</p>
                  <blockquote className="mt-3 text-sm leading-relaxed">“{currentConference.scriptureText}”</blockquote>
                </div>
              )}
              <Link href="/register" className="mt-4 flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-primary">
                Register for Shalom <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div
              aria-hidden={panel !== 2}
              inert={panel !== 2}
              className="col-start-1 row-start-1 flex flex-col items-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
              data-testid="hero-flyer-panel"
            >
              <img
                src={HERO_FLYER}
                alt={`Shalom ${currentConference.year} flyer: ${currentConference.theme}`}
                className="max-h-[65svh] w-auto max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-black/10"
              />
              <Link href="/2026" className="mt-4 flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-primary">
                View Shalom {currentConference.year} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setAutoAdvanceEnabled(false);
            setPanel((current) => (current === 2 ? 0 : (current + 1) as 1 | 2));
          }}
          aria-label={flipButtonLabel}
          className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {flipButtonLabel} <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </button>
        {!reducedMotion && (
          <button
            type="button"
            onClick={onToggleMotion}
            aria-label={enabled ? "Pause hero motion" : "Play hero motion"}
            aria-pressed={!enabled}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {enabled ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}

function HeroFilm({ enabled, reducedMotion, desktop, onToggleMotion }: { enabled: boolean; reducedMotion: boolean; desktop: boolean; onToggleMotion: () => void }) {
  const spring = { stiffness: 120, damping: 24, mass: 0.7 };
  const pointerX = useSpring(0, spring);
  const pointerY = useSpring(0, spring);
  const reflectionOpacity = useSpring(0, spring);
  const rotateX = useTransform(pointerY, [-1, 1], [7, -7]);
  const rotateY = useTransform(pointerX, [-1, 1], [-9, 9]);
  const footageX = useTransform(pointerX, [-1, 1], [10, -10]);
  const footageY = useTransform(pointerY, [-1, 1], [8, -8]);
  const outlineX = useTransform(pointerX, [-1, 1], [-12, 12]);
  const outlineY = useTransform(pointerY, [-1, 1], [-8, 8]);
  const lightX = useTransform(pointerX, [-1, 1], [10, 90]);
  const lightY = useTransform(pointerY, [-1, 1], [10, 90]);
  const reflection = useMotionTemplate`radial-gradient(ellipse at ${lightX}% ${lightY}%, rgba(255,255,255,0.65), rgba(255,255,255,0.12) 35%, transparent 70%)`;

  useEffect(() => {
    if (!enabled || !desktop) {
      pointerX.jump(0);
      pointerY.jump(0);
      reflectionOpacity.jump(0);
    }
  }, [enabled, desktop, pointerX, pointerY, reflectionOpacity]);

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
    reflectionOpacity.set(0);
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[650px]"
      style={{ perspective: 1200 }}
      onPointerMove={(event) => {
        if (!enabled || !desktop || event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerX.set(Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)));
        pointerY.set(Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)));
        reflectionOpacity.set(0.55);
      }}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
    >
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0, y: desktop ? 28 : 12, rotateY: desktop ? -18 : 0 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: enabled ? (desktop ? 1.3 : 0.6) : 0, delay: enabled ? 0.2 : 0, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div className="relative" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
          <motion.div
            className="hero-film-outline hidden lg:block"
            style={{ x: outlineX, y: outlineY, z: -35, rotate: -4 }}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: enabled ? 1.4 : 0, delay: enabled ? 0.45 : 0, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="relative aspect-video overflow-hidden rounded-[2rem] border border-black/10 bg-black shadow-[0_30px_80px_-32px_rgba(19,16,28,0.3)] lg:aspect-[16/11]"
            data-testid="video-home-hero"
            style={{ z: 20 }}
            initial={reducedMotion || !desktop ? false : { clipPath: "inset(0 49% 0 49% round 2rem)" }}
            animate={{ clipPath: "inset(0 0% 0 0% round 2rem)" }}
            transition={{ duration: enabled ? 1.5 : 0, delay: enabled ? 0.25 : 0, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div className="absolute inset-0" style={{ x: footageX, y: footageY, scale: 1.06 }}>
              <img
                src={HERO_POSTER}
                alt=""
                width={960}
                height={540}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <HeroVideo enabled={enabled} />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/5 via-transparent to-black/15" />
            <motion.div
              className="pointer-events-none absolute inset-0 z-30"
              style={{ background: reflection, opacity: reflectionOpacity }}
            />
            <div className="pointer-events-none absolute inset-0 z-30 rounded-[2rem] ring-1 ring-inset ring-white/20" />
          </motion.div>
        </motion.div>
      </motion.div>
      {!desktop && !reducedMotion && (
        <button
          type="button"
          onClick={onToggleMotion}
          aria-label={enabled ? "Pause hero motion" : "Play hero motion"}
          aria-pressed={!enabled}
          className="absolute bottom-3 right-3 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/65 text-white backdrop-blur-sm hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {enabled ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}

export default function Home() {
  // framer's hook tracks prefers-reduced-motion and updates live.
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [motionPaused, setMotionPaused] = useState(false);
  const motionEnabled = !prefersReducedMotion && !motionPaused;
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(HERO_DESKTOP_MEDIA_QUERY).matches,
  );

  useEffect(() => {
    const desktop = window.matchMedia(HERO_DESKTOP_MEDIA_QUERY);
    const sync = () => setIsDesktop(desktop.matches);

    sync();
    desktop.addEventListener?.("change", sync);
    return () => desktop.removeEventListener?.("change", sync);
  }, []);

  const heroContent = (
    <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mx-auto flex max-w-3xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left"
            >
              <h1
                className="hero-title mb-5 text-[clamp(2.8rem,12vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-tight text-black sm:text-7xl lg:mb-7 lg:text-[4.75rem] xl:text-[5.5rem] 2xl:text-[6.5rem] italic"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {`${currentConference.year}:${currentConference.theme}`.split(" ").map((word, index) => (
                  <motion.span
                    key={`${word}-${index}`}
                    className="block"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 + index * 0.12 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              <p className="mb-6 max-w-xl text-base font-medium leading-relaxed text-slate-600 lg:mb-8 lg:text-lg">
                Two nights of worship and prayer for students and young adults, built
                around the Holy Spirit.
              </p>
              <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="group rounded-full bg-primary text-white font-bold uppercase tracking-widest border-none h-14 px-10 text-base shadow-[0_8px_35px_-10px_rgba(249,89,31,0.7)] transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:brightness-110 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  data-testid="button-register-hero"
                >
                  <Link href="/register">
                    Register <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-slate-300 text-[#13101c] hover:bg-slate-100 hover:text-[#13101c] font-bold uppercase tracking-widest h-14 px-10 text-base bg-transparent"
                >
                  <Link href="/2026">See the lineup</Link>
                </Button>
              </div>
            </motion.div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="home-scroll-story">
      <ScrollPage enabled={motionEnabled}>
      <section className={`home-hero relative isolate flex flex-col items-center overflow-hidden bg-white px-6 pb-6 pt-10 text-[#13101c] sm:px-10 lg:min-h-[min(760px,calc(100svh-76px))] lg:flex-row lg:px-16 lg:py-24 ${!motionEnabled ? "hero-motion-paused" : ""}`}>
        <HeroRain enabled={motionEnabled} />
        <div className="container relative z-10 mx-auto max-w-7xl">
          {isDesktop ? (
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-16">
              {heroContent}
              <HeroFilm enabled={motionEnabled} reducedMotion={prefersReducedMotion} desktop={isDesktop} onToggleMotion={() => setMotionPaused((paused) => !paused)} />
            </div>
          ) : (
            <MobileHero enabled={motionEnabled} reducedMotion={prefersReducedMotion} onToggleMotion={() => setMotionPaused((paused) => !paused)}>
              {heroContent}
            </MobileHero>
          )}
        </div>
        {isDesktop && !prefersReducedMotion && (
          <button
            type="button"
            onClick={() => setMotionPaused((paused) => !paused)}
            aria-label={motionPaused ? "Play hero motion" : "Pause hero motion"}
            aria-pressed={motionPaused}
            className="relative z-20 ml-auto mt-5 flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:absolute lg:bottom-5 lg:right-6 lg:mt-0 lg:min-h-0 lg:px-3"
          >
            {motionPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {motionPaused ? "Play motion" : "Pause motion"}
          </button>
        )}
      </section>

      </ScrollPage>

      <ScrollPage enabled={motionEnabled}>
        <ConferenceCountdown />
      </ScrollPage>

      <ScrollPage enabled={motionEnabled}>

      <section id="home-cta" className="bg-primary px-4 py-28 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <FadeIn>
            <h2
              className="mb-6 text-6xl font-bold uppercase tracking-wide text-white sm:text-8xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Come as you are
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-xl font-medium text-white/85">
              Bring a friend. Registration takes about a minute and we'll email you
              everything you need for the door.
            </p>
            <Button
              asChild
              size="lg"
              className="h-16 rounded-full bg-white px-12 text-xl font-bold uppercase tracking-widest text-primary hover:bg-white/92 border-none shadow-lg"
              data-testid="button-register-footer"
            >
              <Link href="/register">
                Register <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      </ScrollPage>
      </main>

      <ScrollPage enabled={motionEnabled}>
        <SiteFooter />
      </ScrollPage>
    </div>
  );
}
