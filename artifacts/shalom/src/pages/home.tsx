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
const HERO_TITLE_PREFIX = `${currentConference.year}: `;
const HERO_TITLE_THEME = currentConference.theme.toUpperCase();
const HERO_TITLE = `${HERO_TITLE_PREFIX}${HERO_TITLE_THEME}`;
// Countdown target comes from the conference data so there is one place to update.
const CONFERENCE_START = currentConference.startsAt
  ? new Date(currentConference.startsAt).getTime()
  : null;

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
      className="hero-title mb-7 whitespace-nowrap text-[clamp(1.75rem,7.8vw,2.3rem)] font-bold uppercase leading-[0.92] tracking-tight text-black sm:text-[3rem] lg:mb-10 lg:text-[5rem] xl:text-[6.25rem] 2xl:text-[7rem] italic"
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
              className="mx-auto flex max-w-6xl flex-col items-center text-center"
            >
              <HeroTypewriterTitle enabled={motionEnabled} reducedMotion={prefersReducedMotion} />
              {currentConference.scriptureText && (
                <div className="mb-9 max-w-4xl">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                    {currentConference.scripture}
                  </p>
                  <blockquote className="mt-5 text-lg font-medium leading-relaxed text-slate-700 sm:text-xl lg:text-2xl xl:text-3xl">
                    “{currentConference.scriptureText}”
                  </blockquote>
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-3">
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
            </motion.div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="home-scroll-story">
      <ScrollPage enabled={motionEnabled}>
      <section className={`home-hero relative isolate flex flex-col items-center overflow-hidden bg-white px-6 pb-6 pt-10 text-[#13101c] sm:px-10 lg:min-h-[min(760px,calc(100svh-76px))] lg:flex-row lg:px-16 lg:py-16 2xl:min-h-[min(900px,calc(100svh-76px))] ${!motionEnabled ? "hero-motion-paused" : ""}`}>
        <div className="container relative z-10 mx-auto w-full max-w-[1500px]">
          {heroContent}
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
