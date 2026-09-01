import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, MessageSquare } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { currentConference } from "@/data/conferences";
import SiteHeader from "@/components/SiteHeader";
import shalomLogo from "@assets/logo_1778697155106.png";

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

export default function Home() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroSegment, setHeroSegment] = useState(0);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (motionPreference.matches) {
        heroVideoRef.current?.pause();
      } else {
        heroVideoRef.current?.play().catch(() => undefined);
      }
    };

    syncPlayback();
    motionPreference.addEventListener?.("change", syncPlayback);
    return () => motionPreference.removeEventListener?.("change", syncPlayback);
  }, [heroSegment]);

  return (
    <div className="min-h-screen text-gray-900 bg-white">
      <SiteHeader overlay />

      {/* HERO — full-bleed video */}
      <section
        className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-gray-950 px-6 pb-20 pt-36 text-white sm:px-10 sm:pb-24 lg:px-16 lg:pb-28"
        style={{ backgroundImage: "url('/images/home/shalom-hero-video-poster.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
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
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,3,15,0.88)_0%,rgba(20,5,28,0.5)_48%,rgba(22,95,125,0.18)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />

        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex max-w-4xl flex-col items-start text-left"
          >
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.38em] text-primary sm:text-sm">
              Shalom {currentConference.year}
            </p>
            <h1
              className="mb-8 max-w-4xl text-[clamp(4.25rem,11vw,9rem)] font-normal leading-[0.82] tracking-[-0.055em] text-white"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <span className="block">Welcome to</span>
              <span className="block italic text-[#b9eafa]">{currentConference.theme}</span>
            </h1>
            <p className="mb-9 max-w-xl text-base font-medium leading-relaxed text-white/80 sm:text-lg">
              A two-day gathering for genuine worship, spiritual awakening, deliverance, and renewal in the presence of the Holy Spirit.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest border-none h-14 px-10 text-base shadow-md"
                data-testid="button-register-hero"
              >
                <Link href="/register">
                  Register <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* CTA — editorial light field */}
      <section className="bg-[#b9eafa] px-6 py-24 text-[#111827] sm:px-10 lg:px-16 lg:py-32">
        <div className="container mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <FadeIn>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-primary">Don't Miss Out</p>
            <h2
              className="mb-6 max-w-3xl text-6xl font-normal leading-[0.88] tracking-[-0.04em] sm:text-8xl"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Join Us For 2026
            </h2>
          </FadeIn>
          <FadeIn delay={0.1} className="lg:justify-self-end">
            <p className="mb-8 max-w-md text-lg font-medium leading-relaxed text-[#233044]/80">
              A simple invitation to gather, worship, pray, and encounter the Comforter together.
            </p>
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full bg-primary px-10 text-base font-bold uppercase tracking-widest text-white hover:bg-primary/90 border-none shadow-lg"
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
