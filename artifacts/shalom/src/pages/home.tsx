import React from "react";
import { Link } from "wouter";
import shalomLogo from "@assets/logo_1778697155106.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, Heart, Zap, Users, Sparkles, ChevronDown } from "lucide-react";
import { currentConference } from "@/data/conferences";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <header className="absolute left-0 right-0 top-0 z-20 px-4 py-5 sm:px-6">
        <nav className="container mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={shalomLogo} alt="SHALOM" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-widest text-white/70 sm:gap-5 sm:text-sm">
            <Link href="/2026" className="hover:text-primary">
              2026
            </Link>
            <Link href="/about" className="hover:text-primary">
              About
            </Link>
            <Link href="/partner" className="hover:text-primary">
              Partner
            </Link>
            <Link href="/archive" className="hover:text-primary">
              Archive
            </Link>
          </div>
        </nav>
      </header>
      
      {/* 1. HERO SECTION */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-24 pt-32 sm:px-6 sm:pt-24">
        <div className="absolute inset-0 bg-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.08),transparent_32rem)]" />
        </div>

        <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-primary/90 sm:text-sm"
          >
            Shalom 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 text-5xl font-black uppercase leading-none tracking-tight text-glow sm:text-7xl md:text-9xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentConference.theme}
          </motion.h1>

          <FadeIn delay={0.25} className="mx-auto max-w-2xl">
            <p className="text-lg font-light leading-relaxed text-white/80 sm:text-xl md:text-2xl">
              A two-day gathering for genuine worship, spiritual awakening,
              deliverance, and renewal in the presence of the Holy Spirit.
            </p>
          </FadeIn>

          <FadeIn delay={0.35} className="mt-8 w-full max-w-3xl">
            <div className="grid gap-3 border-y border-white/10 py-5 text-sm sm:grid-cols-3">
              {[
                currentConference.shortDate,
                currentConference.scripture,
                "Windsor Mill, MD",
              ].map((item) => (
                <p key={item} className="font-medium text-white/75">
                  {item}
                </p>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.45} className="mt-8 w-full sm:w-auto">
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="h-14 w-full max-w-xs rounded-sm bg-primary px-8 text-lg font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 sm:w-auto" data-testid="button-register-hero">
                <a href={currentConference.registrationUrl} target="_blank" rel="noreferrer">
                  Register <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 w-full max-w-xs rounded-sm border-white/20 px-8 text-lg font-medium uppercase tracking-wider hover:bg-white/5 sm:w-auto">
                <Link href="/2026">Details</Link>
              </Button>
            </div>
          </FadeIn>
        </div>

        <motion.a
          href="#details"
          aria-label="Scroll to event details"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 1 },
            y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/55 transition-colors hover:text-primary"
        >
          <ChevronDown className="h-8 w-8" aria-hidden="true" />
        </motion.a>
      </section>

      {/* 2. DETAILS */}
      <section id="details" className="border-y border-white/10 bg-card/50 px-4 py-20 sm:px-6">
        <div className="container mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <FadeIn>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">The Invitation</p>
            <h2 className="mb-6 text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
              A simple room for encounter.
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                Shalom 2026 is centered on {currentConference.scripture} and
                the ministry of the Comforter.
              </p>
              <p className="text-white/85">
                We are gathering for worship, teaching, prayer, deliverance,
                and spiritual renewal for everyone earnestly seeking Christ.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="divide-y divide-white/10 rounded-sm border border-white/10 bg-background/45 p-6">
              {[
                { icon: <Calendar className="h-5 w-5" />, label: "Date", value: currentConference.date },
                { icon: <MapPin className="h-5 w-5" />, label: "Location", value: currentConference.location },
                { icon: <Sparkles className="h-5 w-5" />, label: "Theme", value: currentConference.theme },
              ].map((item) => (
                <div key={item.label} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <div className="mt-1 text-primary">{item.icon}</div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/90">{item.label}</p>
                    <p className="mt-1 text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 3. WORSHIP MOMENT */}
      <section className="px-4 py-16 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <FadeIn>
            <div className="relative aspect-video overflow-hidden rounded-sm border border-white/10 bg-muted">
              <img
                src="/images/home/shalom-hero-worship-hd.png"
                alt="Shalom worship moment"
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <p className="absolute bottom-6 left-6 right-6 max-w-xl text-2xl font-semibold text-white sm:bottom-8 sm:left-8 sm:text-3xl">
                Worship that makes space to listen, respond, and be renewed.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. EXPECTATIONS */}
      <section className="px-4 py-20 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">What To Expect</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
                Worship. Freedom. Renewal.
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: <Zap className="h-7 w-7 text-primary" />,
                title: "Pure Worship",
                desc: "Undistracted worship centered on Jesus.",
              },
              {
                icon: <Heart className="h-7 w-7 text-primary" />,
                title: "Deliverance",
                desc: "Prayer and ministry for freedom and healing.",
              },
              {
                icon: <Users className="h-7 w-7 text-primary" />,
                title: "Spiritual Renewal",
                desc: "A place to be refreshed, restored, and sent.",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="h-full rounded-sm border border-white/10 bg-card/60 p-6 text-center md:text-left">
                  <div className="mx-auto mb-5 w-fit rounded-sm bg-primary/10 p-3 md:mx-0">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">{item.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SCHEDULE */}
      <section className="border-y border-white/10 bg-card/50 px-4 py-20 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <FadeIn>
            <div className="mb-10 text-center">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">Schedule</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
                Two-Day Flow
              </h2>
            </div>
          </FadeIn>

          <div className="divide-y divide-white/10 rounded-sm border border-white/10 bg-background/45">
            {[
              { time: "Fri 7:00 PM", title: "Opening Night: Worship & Prayer" },
              { time: "Sat 10:00 AM", title: "Doors Open & Community" },
              { time: "Sat 11:00 AM", title: "Session 1: The Promise" },
              { time: "Sat 3:00 PM", title: "Session 2: The Comforter" },
              { time: "Sat 6:30 PM", title: "Pure Worship & Deliverance Prayer" },
            ].map((event, i) => (
              <FadeIn key={event.title} delay={i * 0.05}>
                <div className="flex flex-col gap-2 p-5 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
                  <span className="font-mono text-sm uppercase tracking-widest text-primary/90 sm:w-32">{event.time}</span>
                  <span className="text-lg font-semibold text-white">{event.title}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <section className="px-4 py-24 text-center sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <FadeIn>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">Join Us</p>
            <h2 className="mb-6 text-4xl font-black uppercase tracking-tighter text-white sm:text-6xl">
              Register for 2026
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              A simple invitation to gather, worship, pray, and encounter the
              Comforter together.
            </p>
            <Button asChild size="lg" className="h-16 w-full max-w-xs rounded-sm bg-primary px-10 text-xl font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 sm:w-auto" data-testid="button-register-footer">
              <a href={currentConference.registrationUrl} target="_blank" rel="noreferrer">
                Secure Your Spot <ArrowRight className="ml-2 h-6 w-6" />
              </a>
            </Button>
          </FadeIn>
        </div>
      </section>

      <footer className="py-12 px-6 bg-background text-center border-t border-white/5">
        <img
          src={shalomLogo}
          alt="SHALOM"
          className="h-16 w-auto mx-auto object-contain mb-6 opacity-80"
          data-testid="img-shalom-logo-footer"
        />
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
          © {new Date().getFullYear()} Shalom Conference. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
