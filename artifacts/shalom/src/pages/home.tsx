import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
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

const HERO_DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const HERO_VIDEO_SRC = "/videos/shalom-hero.mp4";
const HERO_POSTER_SRC = "/images/home/shalom-hero-poster.webp";
// Countdown target comes from the conference data so there is one place to update.
const CONFERENCE_START = currentConference.startsAt
  ? new Date(currentConference.startsAt).getTime()
  : null;
const CONFERENCE_END = currentConference.endsAt
  ? new Date(currentConference.endsAt).getTime()
  : null;

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
    hasEnded: CONFERENCE_END !== null && Date.now() >= CONFERENCE_END,
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

  if (countdown.hasEnded) {
    return (
      <section className="border-y border-white/10 bg-[#090910] px-4 py-14 text-white sm:px-6 sm:py-16">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f9591f]">
            Shalom 2026
          </p>
          <h2
            className="mt-4 text-3xl font-bold uppercase tracking-wide sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Thank you for joining us
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
            The Comforter has concluded. Revisit the program, speakers, and
            moments from this year&apos;s gathering.
          </p>
        </div>
      </section>
    );
  }

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

export default function Home() {
  // framer's hook tracks prefers-reduced-motion and updates live.
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [motionPaused, setMotionPaused] = useState(false);
  const motionEnabled = !prefersReducedMotion && !motionPaused;
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(HERO_DESKTOP_MEDIA_QUERY).matches,
  );
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia(HERO_DESKTOP_MEDIA_QUERY);
    const sync = () => setIsDesktop(desktop.matches);

    sync();
    desktop.addEventListener?.("change", sync);
    return () => desktop.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || prefersReducedMotion) return;
    if (motionEnabled) {
      void video.play().catch(() => {});
      return;
    }
    video.pause();
  }, [motionEnabled, prefersReducedMotion]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="home-scroll-story">
      <ScrollPage enabled={motionEnabled}>
      <section
        aria-label="Shalom conference"
        className={`home-hero relative isolate flex min-h-[min(640px,calc(100svh-76px))] flex-col overflow-hidden lg:min-h-[min(600px,calc(100svh-76px))] 2xl:min-h-[min(680px,calc(100svh-76px))] ${!motionEnabled ? "hero-motion-paused" : ""}`}
      >
        <h1 className="sr-only">Shalom Youth Conference</h1>
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          {prefersReducedMotion ? (
            <img
              src={HERO_POSTER_SRC}
              alt=""
              className="home-hero-media"
              fetchPriority="high"
            />
          ) : (
            <video
              ref={heroVideoRef}
              className="home-hero-media"
              autoPlay
              muted
              loop
              playsInline
              poster={HERO_POSTER_SRC}
              preload="auto"
            >
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
            </video>
          )}
        </div>
        {isDesktop && !prefersReducedMotion && (
          <button
            type="button"
            onClick={() => setMotionPaused((paused) => !paused)}
            aria-label={motionPaused ? "Play hero motion" : "Pause hero motion"}
            aria-pressed={motionPaused}
            className="relative z-10 ml-auto flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-[10px] uppercase tracking-widest text-white/90 backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:absolute lg:bottom-5 lg:right-6 lg:min-h-0 lg:px-3"
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
              Thank you
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-xl font-medium text-white/85">
              Shalom 2026 has concluded. Thank you for worshipping, praying,
              serving, and gathering with us.
            </p>
            <Button
              asChild
              size="lg"
              className="h-16 rounded-full bg-white px-12 text-xl font-bold uppercase tracking-widest text-primary hover:bg-white/92 border-none shadow-lg"
              data-testid="button-conference-footer"
            >
              <Link href="/2026">
                View the conference <ArrowRight className="ml-3 h-6 w-6" />
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
