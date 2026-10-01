import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
const HERO_CROSSFADE_MS = 700; // keep in step with duration-700 on the video elements
// Countdown target comes from the conference data so there is one place to update.
const CONFERENCE_START = currentConference.startsAt
  ? new Date(currentConference.startsAt).getTime()
  : null;

const heroSegmentSrc = (segment: number) =>
  `/videos/shalom-hero-segments/segment-${String(segment + 1).padStart(2, "0")}.mp4`;

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
    <section className="border-y border-white/10 bg-background px-4 py-14 text-white sm:px-6 sm:py-16">
      <div className="container mx-auto max-w-5xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
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
                <span className="mt-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:text-xs sm:tracking-[0.25em]">
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
 * Desktop hero video. The footage is 15 ten-second clips. Two <video>
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
    if (index !== active) return;
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

export default function Home() {
  // framer's hook tracks prefers-reduced-motion and updates live.
  const prefersReducedMotion = useReducedMotion() ?? false;
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero: mobile still-image backdrop; desktop split layout with oval video */}
      <section className="relative isolate flex min-h-[min(760px,calc(100svh-76px))] items-center overflow-hidden bg-background px-6 py-20 text-white sm:px-10 lg:px-16">
        {!isDesktop ? (
          <>
            <img
              src="/images/home/shalom-hero-mobile-1080.webp"
              srcSet="/images/home/shalom-hero-mobile-1080.webp 1080w, /images/home/shalom-hero-mobile-1620.webp 1620w"
              sizes="100vw"
              alt=""
              width={1080}
              height={1440}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <div className="hero-overlay-shift absolute inset-0 -z-10" />
          </>
        ) : null}
        <div className="container relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-16">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mx-auto flex max-w-3xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left"
            >
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-white/75 sm:text-sm">
                Shalom {currentConference.year} · {currentConference.date} · Windsor Mill, MD
              </p>
              <h1
                className="mb-6 text-[3.75rem] font-bold uppercase leading-[0.88] tracking-wide text-white sm:text-7xl lg:text-[4.75rem] xl:text-[5.5rem] 2xl:text-[6.5rem] italic"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {currentConference.theme}
              </h1>
              <p className="mb-8 max-w-xl text-lg font-medium leading-relaxed text-white/80">
                Two nights of worship and prayer for students and young adults, built
                around the Holy Spirit.
              </p>
              <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="group rounded-full bg-primary text-white font-bold uppercase tracking-widest border-none h-14 px-10 text-base shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:brightness-110 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
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
                  className="rounded-full border-white/70 text-white hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest h-14 px-10 text-base bg-transparent"
                >
                  <Link href="/2026">See the lineup</Link>
                </Button>
              </div>
            </motion.div>
            {isDesktop && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: prefersReducedMotion ? 0 : 0.12 }}
                className="relative mx-auto w-full max-w-[650px]"
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden rounded-[50%] border border-white/25 bg-black shadow-[0_30px_100px_-32px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
                  aria-hidden="true"
                  data-testid="video-home-hero"
                >
                  <img
                    src={HERO_POSTER}
                    alt=""
                    width={960}
                    height={540}
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                  />
                  <HeroVideo enabled={!prefersReducedMotion} />
                  <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <ConferenceCountdown />

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

      <SiteFooter />
    </div>
  );
}
