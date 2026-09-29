import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
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
const HERO_DESKTOP_MEDIA_QUERY = "(min-width: 768px)";
const CONFERENCE_START = new Date("2026-10-09T19:00:00-04:00").getTime();

function getCountdownParts() {
  const remaining = Math.max(0, CONFERENCE_START - Date.now());

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
          Friday, October 9 · Doors 7 PM
        </p>
        <h2
          className="mt-4 text-3xl font-bold uppercase tracking-wide sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {countdown.hasStarted ? "Shalom 2026 is happening now" : "Shalom 2026 is coming"}
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

export default function Home() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroSegment, setHeroSegment] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(HERO_DESKTOP_MEDIA_QUERY).matches,
  );

  const startHeroPlayback = useCallback(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia(HERO_DESKTOP_MEDIA_QUERY).matches
    ) {
      video.pause();
      return;
    }

    // Set both properties before calling play(). This is important on iOS,
    // where the muted property must be present when autoplay is evaluated.
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("muted", "");

    video.play().catch(() => {
      // If autoplay is unavailable, quietly retain the hero background image.
    });
  }, []);

  useEffect(() => {
    const desktopPreference = window.matchMedia(HERO_DESKTOP_MEDIA_QUERY);
    const syncViewport = () => setIsDesktop(desktopPreference.matches);

    syncViewport();
    desktopPreference.addEventListener?.("change", syncViewport);
    return () => desktopPreference.removeEventListener?.("change", syncViewport);
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (!isDesktop || motionPreference.matches) {
        heroVideoRef.current?.pause();
      } else {
        startHeroPlayback();
      }
    };

    syncPlayback();
    const video = heroVideoRef.current;
    video?.addEventListener("loadeddata", syncPlayback);
    video?.addEventListener("canplay", syncPlayback);
    motionPreference.addEventListener?.("change", syncPlayback);
    return () => {
      video?.removeEventListener("loadeddata", syncPlayback);
      video?.removeEventListener("canplay", syncPlayback);
      motionPreference.removeEventListener?.("change", syncPlayback);
    };
  }, [heroSegment, isDesktop, startHeroPlayback]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero: still image on phones, looping video on larger screens */}
      <section
        className="relative isolate flex min-h-[min(760px,calc(100svh-76px))] items-center overflow-hidden bg-background px-6 py-20 text-white sm:px-10 lg:px-16"
        style={{
          backgroundImage: `url('${
            isDesktop
              ? "/images/home/shalom-hero-video-poster.jpg"
              : "/images/home/shalom-hero-new.jpg"
          }')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {isDesktop && (
          <video
            key={heroSegment}
            ref={heroVideoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/images/home/shalom-hero-video-poster.jpg"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            onEnded={() => setHeroSegment((segment) => (segment + 1) % HERO_SEGMENT_COUNT)}
            aria-hidden="true"
          >
            <source
              src={`/videos/shalom-hero-segments/segment-${String(heroSegment + 1).padStart(2, "0")}.mp4`}
              type="video/mp4"
            />
          </video>
        )}
        <div className="hero-overlay-shift absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto flex max-w-3xl flex-col items-center text-center"
          >
            <h1
              className="mb-6 text-[3.25rem] font-bold uppercase leading-[0.88] tracking-wide text-white sm:text-6xl lg:text-[4.5rem] xl:text-[5.5rem] italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {currentConference.year}: {currentConference.theme}
            </h1>
            <p className="mb-8 max-w-xl text-lg font-medium leading-relaxed text-white/80">
              {currentConference.date}, Windsor Mill, MD. Two nights of worship and prayer
              for students and young adults.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
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
                <Link href="/2026">Learn More</Link>
              </Button>
            </div>
          </motion.div>
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
