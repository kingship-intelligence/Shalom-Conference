import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
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
const HERO_CROSSFADE_MS = 700;
const HERO_TITLE_PREFIX = `${currentConference.year}: `;
const HERO_TITLE_THEME = currentConference.theme.toUpperCase();
const HERO_TITLE = `${HERO_TITLE_PREFIX}${HERO_TITLE_THEME}`;
// Countdown target comes from the conference data so there is one place to update.
const CONFERENCE_START = currentConference.startsAt
  ? new Date(currentConference.startsAt).getTime()
  : null;

const heroSegmentSrc = (segment: number) =>
  `/videos/shalom-hero-segments/segment-${String(segment + 1).padStart(2, "0")}.mp4`;

function HeroFirefall({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} aria-hidden="true" className="hero-firefall" data-running={enabled && inView}>
      {Array.from({ length: 28 }, (_, index) => (
        <span
          key={index}
          className={`${index > 15 ? "fire-tongue fire-tongue-desktop" : "fire-tongue"} ${
            index % 2 === 0 ? "fire-tongue-left" : "fire-tongue-right"
          }`}
          style={{
            left: `${(index * 43 + 5) % 100}%`,
            width: `${18 + (index % 5) * 3}px`,
            height: `${40 + (index % 6) * 5}px`,
            animationDuration: `${5.2 + (index % 7) * 0.5}s`,
            animationDelay: `${-index * 0.53}s`,
            opacity: 0.38 + (index % 4) * 0.08,
          }}
        />
      ))}
    </div>
  );
}

function HeroTypewriterTitle({
  enabled,
  reducedMotion,
}: {
  enabled: boolean;
  reducedMotion: boolean;
}) {
  const [visibleCharacters, setVisibleCharacters] = useState(
    reducedMotion ? HERO_TITLE.length : 0,
  );

  useEffect(() => {
    if (reducedMotion) {
      setVisibleCharacters(HERO_TITLE.length);
      return;
    }
    if (!enabled || visibleCharacters >= HERO_TITLE.length) return;

    const nextCharacter = HERO_TITLE[visibleCharacters];
    const timer = window.setTimeout(
      () => setVisibleCharacters((count) => count + 1),
      nextCharacter === "\n" ? 240 : 72,
    );
    return () => window.clearTimeout(timer);
  }, [enabled, reducedMotion, visibleCharacters]);

  const visiblePrefix = HERO_TITLE_PREFIX.slice(0, visibleCharacters);
  const visibleTheme = HERO_TITLE_THEME.slice(
    0,
    Math.max(0, visibleCharacters - HERO_TITLE_PREFIX.length),
  );

  return (
    <h1
      className="hero-title mb-5 whitespace-nowrap text-[clamp(1.9rem,8.5vw,2.5rem)] font-bold uppercase leading-[0.92] tracking-tight text-black sm:text-[2.5rem] lg:mb-8 lg:text-[3rem] xl:text-[4rem] 2xl:text-[4.4rem] italic"
      style={{ fontFamily: "var(--font-display)" }}
      aria-label={HERO_TITLE.replace("\n", " ")}
    >
      <span className="block min-h-[0.92em]" aria-hidden="true">
        {visiblePrefix}
        <span className="-mr-[0.18em] inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text pr-[0.18em] text-transparent">
          {visibleTheme}
        </span>
        {!reducedMotion && visibleCharacters < HERO_TITLE.length && (
          <span className="hero-typewriter-cursor" />
        )}
      </span>
    </h1>
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

function HeroVideo({ enabled }: { enabled: boolean }) {
  const players = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [active, setActive] = useState(0);
  const [segments, setSegments] = useState<[number, number]>([0, 1]);

  const play = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.play().catch(() => {
      // The poster remains visible if autoplay is unavailable.
    });
  }, []);

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
    // The player refs remain stable for the lifetime of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, enabled, play]);

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
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}

function HeroFeature({ enabled, reducedMotion }: { enabled: boolean; reducedMotion: boolean }) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!enabled || reducedMotion) return;
    const timer = window.setTimeout(() => setShowVideo((current) => !current), 8_000);
    return () => window.clearTimeout(timer);
  }, [enabled, reducedMotion, showVideo]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: enabled ? 0.8 : 0, delay: enabled ? 0.2 : 0 }}
      className="relative mx-auto min-h-[510px] w-full max-w-[680px] xl:min-h-[570px] 2xl:min-h-[650px]"
    >
      <div className="absolute inset-x-0 top-0 bottom-14" style={{ perspective: 1400 }}>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: showVideo ? 0 : 1,
            rotateY: showVideo ? 90 : 0,
          }}
          transition={{ duration: enabled ? 0.6 : 0, ease: [0.22, 1, 0.36, 1] }}
          style={{ backfaceVisibility: "hidden" }}
          aria-hidden={showVideo}
        >
          <div className="w-full max-w-[360px] rounded-2xl border border-primary/20 bg-white/85 p-2 shadow-[0_20px_55px_-35px_rgba(19,16,28,0.45)] xl:max-w-[420px] 2xl:max-w-[480px]">
            <img
              src={HERO_FLYER}
              alt={`Shalom ${currentConference.year} flyer: ${currentConference.theme}`}
              className="h-auto w-full object-contain"
            />
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: showVideo ? 1 : 0,
            rotateY: showVideo ? 0 : -90,
          }}
          transition={{ duration: enabled ? 0.6 : 0, ease: [0.22, 1, 0.36, 1] }}
          style={{ backfaceVisibility: "hidden" }}
          aria-hidden={!showVideo}
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-primary/20 bg-black shadow-[0_24px_65px_-36px_rgba(19,16,28,0.55)]">
            <img
              src={HERO_POSTER}
              alt=""
              width={960}
              height={540}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <HeroVideo enabled={enabled && showVideo} />
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-primary/20 bg-white/90 p-2 shadow-sm backdrop-blur-sm">
        {(["Flyer", "Video"] as const).map((label, index) => {
          const selected = showVideo === (index === 1);
          return (
            <button
              key={label}
              type="button"
              onClick={() => setShowVideo(index === 1)}
              aria-label={`Show ${label.toLowerCase()}`}
              aria-pressed={selected}
              className={`min-h-10 rounded-full px-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                selected ? "bg-primary text-white" : "text-slate-600 hover:bg-primary/10"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </motion.div>
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
              <HeroTypewriterTitle enabled={motionEnabled} reducedMotion={prefersReducedMotion} />
              <p className="mb-6 max-w-xl text-base font-medium leading-relaxed text-slate-600 lg:mb-9 lg:text-xl xl:text-2xl">
                Two nights of worship and prayer for students and young adults, built
                around the Holy Spirit.
              </p>
              <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="group h-14 rounded-full border-none bg-primary px-10 text-base font-bold uppercase tracking-widest text-white shadow-[0_8px_35px_-10px_rgba(249,89,31,0.7)] transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:brightness-110 motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:h-16 lg:px-12 lg:text-lg xl:h-[4.5rem] xl:px-14 xl:text-xl"
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
                  className="h-14 rounded-full border-slate-300 bg-transparent px-10 text-base font-bold uppercase tracking-widest text-[#13101c] hover:bg-slate-100 hover:text-[#13101c] lg:h-16 lg:px-12 lg:text-lg xl:h-[4.5rem] xl:px-14 xl:text-xl"
                >
                  <Link href="/2026">See the lineup</Link>
                </Button>
              </div>
              {currentConference.scriptureText && (
                <div
                  className="mt-10 hidden max-w-xl rounded-2xl border border-primary/20 bg-white/85 p-6 text-left text-[#13101c] shadow-[0_20px_55px_-35px_rgba(19,16,28,0.35)] lg:block 2xl:p-8"
                  data-testid="desktop-hero-scripture"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                    {currentConference.scripture}
                  </p>
                  <blockquote className="mt-4 text-base font-medium leading-relaxed text-slate-700 xl:text-lg">
                    “{currentConference.scriptureText}”
                  </blockquote>
                </div>
              )}
            </motion.div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="home-scroll-story">
      <ScrollPage enabled={motionEnabled}>
      <section className={`home-hero relative isolate flex flex-col items-center overflow-hidden bg-white px-6 pb-6 pt-10 text-[#13101c] sm:px-10 lg:min-h-[min(760px,calc(100svh-76px))] lg:flex-row lg:px-16 lg:py-16 2xl:min-h-[min(900px,calc(100svh-76px))] ${!motionEnabled ? "hero-motion-paused" : ""}`}>
        <HeroFirefall enabled={motionEnabled} />
        <div className="container relative z-10 mx-auto w-full max-w-[1500px]">
          {isDesktop ? (
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:gap-16">
              {heroContent}
              <HeroFeature enabled={motionEnabled} reducedMotion={prefersReducedMotion} />
            </div>
          ) : heroContent}
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
