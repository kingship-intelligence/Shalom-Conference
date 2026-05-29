import { Link } from "wouter";
import shalomLogo from "@assets/logo_1778697155106.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, Heart, Zap, Users, Sparkles, BookOpen, Mail, MessageSquare } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { currentConference } from "@/data/conferences";

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

export default function Home() {
  return (
    <div className="min-h-screen text-gray-900 bg-white">

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-black">
        <nav className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={shalomLogo} alt="SHALOM" className="h-9 w-auto object-contain" />
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-white/60">
            <Link href="/2026" className="hover:text-primary transition-colors">2026</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/partner" className="hover:text-primary transition-colors">Partner</Link>
            <Link href="/testimonies" className="hover:text-primary transition-colors">Testimonies</Link>
            <Link href="/archive" className="hover:text-primary transition-colors">Archive</Link>
          </div>
          <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest border-none px-6 h-10">
            <Link href="/register">Register</Link>
          </Button>
        </nav>
      </header>

      {/* HERO — split layout */}
      <section className="flex min-h-[calc(100vh-65px)] flex-col lg:flex-row">
        {/* Left: Text */}
        <div className="flex flex-col justify-center bg-white px-6 py-20 lg:w-[52%] lg:px-14 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block mb-6 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Shalom 2026
            </span>
            <h1
              className="mb-6 text-[3.25rem] font-bold uppercase leading-[0.88] tracking-wide text-gray-900 sm:text-6xl lg:text-[4.5rem] xl:text-[5.5rem] italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {currentConference.theme}
            </h1>
            <p className="mb-8 text-lg font-medium leading-relaxed text-gray-500 max-w-md">
              A two-day gathering for genuine worship, spiritual awakening, deliverance, and renewal in the presence of the Holy Spirit.
            </p>
            <div className="flex flex-col gap-3 mb-10">
              {[
                { icon: <Calendar className="h-4 w-4" />, label: "Date", value: currentConference.date },
                { icon: <MapPin className="h-4 w-4" />, label: "Location", value: currentConference.location },
                { icon: <Sparkles className="h-4 w-4" />, label: "Theme", value: currentConference.theme },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 w-16">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
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
                className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 font-bold uppercase tracking-widest h-14 px-10 text-base bg-transparent"
              >
                <Link href="/2026">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right: Image */}
        <div className="relative min-h-[55vw] lg:min-h-full lg:w-[48%] overflow-hidden">
          <img
            src="/images/home/shalom-hero-new.jpg"
            alt="Shalom worship gathering"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </section>

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

          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 sm:text-left mb-12">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Contact</p>
              <a
                href="mailto:admin@shalomconference.com"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors sm:justify-start text-sm"
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
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors sm:justify-start text-sm"
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
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors sm:justify-start text-sm font-medium"
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
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors sm:justify-start text-sm"
                data-testid="link-media-email"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                media@shalomconference.com
              </a>
            </div>
          </div>

          <div className="h-px w-full bg-white/10 mb-8" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
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
