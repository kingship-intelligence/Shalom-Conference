import { Link } from "wouter";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Mail, MapPin, MessageSquare } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { currentConference } from "@/data/conferences";
import SiteHeader from "@/components/SiteHeader";
import shalomLogo from "@assets/logo_1778697155106.png";
import { useRef } from "react";

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

function ScrollHero() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion || !Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }

    try {
      video.currentTime = progress * Math.max(video.duration - 0.05, 0);
    } catch {
      // Some mobile browsers prevent seeking until the video has buffered.
    }
  });

  const introOpacity = useTransform(scrollYProgress, [0, 0.16, 0.34], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.34], [0, -72]);
  const storyOpacity = useTransform(scrollYProgress, [0.22, 0.4, 0.68, 0.84], [0, 1, 1, 0]);
  const storyY = useTransform(scrollYProgress, [0.22, 0.4, 0.84], [48, 0, -24]);
  const registerOpacity = useTransform(scrollYProgress, [0.62, 0.78, 1], [0, 1, 1]);
  const registerY = useTransform(scrollYProgress, [0.62, 0.78], [34, 0]);

  return (
    <section ref={heroRef} className="relative h-[220vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/hero-video.mp4"
          poster="/images/home/shalom-hero-worship-hd.png"
          muted
          playsInline
          autoPlay={!prefersReducedMotion}
          loop={!prefersReducedMotion}
          aria-hidden="true"
        />

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/15 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-primary/10" />

        <div className="relative z-10 flex h-full items-center justify-center px-6 text-white">
          <motion.div
            style={{ opacity: introOpacity, y: introY }}
            className="absolute inset-x-6 top-[18%] mx-auto max-w-4xl text-center"
          >
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.45em] text-primary sm:text-sm">
              Shalom Conference
            </p>
            <h1
              className="text-[clamp(4rem,13vw,10rem)] font-bold uppercase leading-[0.78] tracking-[0.02em] text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {currentConference.year}
              <span className="block text-primary">{currentConference.theme}</span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-base font-medium leading-relaxed text-white/75 sm:text-xl">
              A place to gather, worship, and encounter the presence of God.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: storyOpacity, y: storyY }}
            className="absolute inset-x-6 bottom-[18%] mx-auto max-w-xl text-center"
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-primary">
              Come expecting
            </p>
            <p className="text-3xl font-bold leading-tight sm:text-5xl">
              Undistracted worship.
              <br />
              Spiritual renewal.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: registerOpacity, y: registerY }}
            className="absolute inset-x-6 bottom-[10%] mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[0.2em] text-white/75 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {currentConference.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Baltimore, MD
              </span>
            </div>
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full bg-primary px-10 text-base font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_45px_rgba(255,85,35,0.45)] hover:bg-primary/90"
              data-testid="button-register-hero"
            >
              <Link href="/register">
                Register <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-white/60">
          <span>Scroll to enter</span>
          <div className="h-12 w-px overflow-hidden bg-white/25">
            <motion.div
              className="h-full w-full origin-top bg-primary"
              style={{ scaleY: scrollYProgress }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen text-gray-900 bg-white">
      <SiteHeader />

      <ScrollHero />

      {/* CTA — solid orange */}
      <section className="bg-primary px-4 py-28 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <FadeIn>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-white/70">Don't Miss Out</p>
            <h2
              className="mb-6 text-6xl font-bold uppercase tracking-wide text-white sm:text-8xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Join Us For 2026
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-xl font-medium text-white/85">
              A simple invitation to gather, worship, pray, and encounter the Comforter together.
            </p>
            <Button
              asChild
              size="lg"
              className="h-16 rounded-full bg-white px-12 text-xl font-bold uppercase tracking-widest text-primary hover:bg-white/92 border-none shadow-lg"
              data-testid="button-register-footer"
            >
              <Link href="/register">
                Secure Your Spot <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white px-4 pt-16 pb-10 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center mb-12">
            <img
              src={shalomLogo}
              alt="SHALOM"
              className="h-14 w-auto object-contain"
              data-testid="img-shalom-logo-footer"
            />
          </div>

          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Contact</p>
              <a
                href="mailto:admin@shalomconference.com"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                data-testid="link-contact-email"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                admin@shalomconference.com
              </a>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Giving</p>
              <a
                href="mailto:finance@shalomconference.com"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                data-testid="link-finance-email"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                finance@shalomconference.com
              </a>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Testimonies</p>
              <Link
                href="/testimonies"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                data-testid="link-share-testimony-footer"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                Share Your Testimony
              </Link>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Media</p>
              <a
                href="mailto:media@shalomconference.com"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                data-testid="link-media-email"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                media@shalomconference.com
              </a>
            </div>
          </div>

          <div className="h-px w-full bg-white/10 mb-8" />

          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">
            <p className="text-gray-500 text-sm uppercase tracking-[0.15em] font-semibold">
              © {new Date().getFullYear()} Shalom Conference. All rights reserved.
            </p>
            <a
              href="https://www.instagram.com/shalomconference/"
              target="_blank"
              rel="noreferrer"
              aria-label="Shalom Conference on Instagram"
              className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
              data-testid="link-instagram"
            >
              <SiInstagram className="h-5 w-5" />
              @shalomconference
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
