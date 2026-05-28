import { Link } from "wouter";
import shalomLogo from "@assets/logo_1778697155106.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, Heart, Zap, Users, Sparkles, ChevronDown, BookOpen } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-primary-foreground relative">

      <header className="absolute left-0 right-0 top-0 z-20 px-4 py-5 sm:px-6">
        <nav className="container mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={shalomLogo} alt="SHALOM" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-bold uppercase tracking-widest text-white/70 sm:gap-5 sm:text-sm">
            <Link href="/2026" className="hover:text-primary transition-colors">
              2026
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/partner" className="hover:text-primary transition-colors">
              Partner
            </Link>
            <Link href="/archive" className="hover:text-primary transition-colors">
              Archive
            </Link>
          </div>
        </nav>
      </header>
      
      {/* 1. HERO SECTION */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-24 pt-32 sm:px-6 sm:pt-24 z-10">
        <div className="absolute inset-0 bg-background">
          <video
            className="h-full w-full object-cover object-center opacity-30 mix-blend-luminosity"
            autoPlay
            muted
            loop
            playsInline
            poster="/images/home/shalom-hero-worship-hd.png"
            aria-label="Shalom worship atmosphere"
          >
            <source src="/videos/herox.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>

        <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-8 rounded-full border border-primary/50 bg-primary/10 px-6 py-2 text-sm font-bold uppercase tracking-[0.2em] text-primary backdrop-blur-md"
          >
            Shalom 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 text-7xl font-bold uppercase leading-[0.85] tracking-wide text-white sm:text-8xl md:text-[10rem] text-glow relative z-10"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentConference.theme}
          </motion.h1>

          <FadeIn delay={0.25} className="mx-auto max-w-2xl relative z-10">
            <p className="text-xl font-medium leading-relaxed text-white/80 sm:text-2xl md:text-3xl">
              A two-day gathering for genuine worship, spiritual awakening,
              deliverance, and renewal in the presence of the Holy Spirit.
            </p>
          </FadeIn>

          <FadeIn delay={0.35} className="mt-10 w-full max-w-4xl relative z-10">
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base font-bold">
              {[
                { icon: <Calendar className="h-4 w-4" />, text: currentConference.shortDate },
                { icon: <BookOpen className="h-4 w-4" />, text: currentConference.scripture },
                { icon: <MapPin className="h-4 w-4" />, text: "Windsor Mill, MD" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-full bg-white/5 px-5 py-2 border border-white/10 backdrop-blur-sm">
                  <span className="text-primary">{item.icon}</span>
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.45} className="mt-12 w-full sm:w-auto relative z-10">
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button asChild size="lg" className="h-16 w-full max-w-xs rounded-full bg-gradient-to-r from-primary to-secondary px-10 text-xl font-bold uppercase tracking-widest text-white shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_50px_rgba(234,88,12,0.6)] sm:w-auto border-none" data-testid="button-register-hero">
                  <a href={currentConference.registrationUrl} target="_blank" rel="noreferrer">
                    Register <ArrowRight className="ml-2 h-6 w-6" />
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button asChild variant="outline" size="lg" className="h-16 w-full max-w-xs rounded-full border-white/20 px-10 text-xl font-bold uppercase tracking-widest text-white hover:bg-white/10 backdrop-blur-sm sm:w-auto bg-transparent">
                  <Link href="/2026">Details</Link>
                </Button>
              </motion.div>
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
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-white/50 transition-colors hover:text-primary"
        >
          <ChevronDown className="h-10 w-10" aria-hidden="true" />
        </motion.a>
      </section>

      {/* 2. DETAILS */}
      <section id="details" className="relative z-10 px-4 py-24 sm:px-6">
        <div className="container mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <FadeIn>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gradient">The Invitation</p>
            <h2 className="mb-8 text-5xl font-bold uppercase leading-none tracking-wide text-white sm:text-6xl md:text-7xl">
              A simple room for encounter.
            </h2>
            <div className="space-y-6 text-xl font-medium leading-relaxed text-white/70">
              <p>
                Shalom 2026 is centered on <span className="text-primary">{currentConference.scripture}</span> and
                the ministry of the Comforter.
              </p>
              <p>
                We are gathering for worship, teaching, prayer, deliverance,
                and spiritual renewal for everyone earnestly seeking Christ.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-primary/30 blur-[40px]" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-secondary/30 blur-[40px]" />
              
              <div className="relative z-10 flex flex-col gap-8">
                {[
                  { icon: <Calendar className="h-6 w-6" />, label: "Date", value: currentConference.date },
                  { icon: <MapPin className="h-6 w-6" />, label: "Location", value: currentConference.location },
                  { icon: <Sparkles className="h-6 w-6" />, label: "Theme", value: currentConference.theme },
                ].map((item, idx) => (
                  <div key={item.label} className="flex gap-5 items-start">
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-white/50">{item.label}</p>
                      <p className="mt-1 text-2xl font-bold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 3. WORSHIP MOMENT */}
      <section className="relative z-10 px-4 py-16 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <FadeIn>
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-muted shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <img
                src="/images/home/shalom-hero-worship-hd.png"
                alt="Shalom worship moment"
                className="h-full w-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 mix-blend-overlay" />
              <p className="absolute bottom-8 left-8 right-8 max-w-3xl text-3xl font-bold text-white sm:bottom-12 sm:left-12 sm:text-5xl leading-tight">
                Worship that makes space to listen, respond, and be renewed.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. EXPECTATIONS */}
      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-16 text-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gradient">What To Expect</p>
              <h2 className="text-5xl font-bold uppercase tracking-wide text-white sm:text-7xl">
                Worship. Freedom. Renewal.
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <Zap className="h-8 w-8 text-primary" />,
                title: "Pure Worship",
                desc: "Undistracted worship centered on Jesus.",
                num: "01"
              },
              {
                icon: <Heart className="h-8 w-8 text-secondary" />,
                title: "Deliverance",
                desc: "Prayer and ministry for freedom and healing.",
                num: "02"
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Spiritual Renewal",
                desc: "A place to be refreshed, restored, and sent.",
                num: "03"
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <motion.div 
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]"
                >
                  <div className="absolute -top-px left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Decorative background number */}
                  <div className="absolute -bottom-10 -right-6 text-[10rem] font-bold leading-none text-white/5 group-hover:text-primary/10 transition-colors pointer-events-none select-none" style={{ fontFamily: "var(--font-display)" }}>
                    {item.num}
                  </div>

                  <div className="relative z-10">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                      {item.icon}
                    </div>
                    <h3 className="mb-4 text-3xl font-bold text-white uppercase tracking-wide">{item.title}</h3>
                    <p className="text-lg font-medium text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SCHEDULE */}
      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <FadeIn>
            <div className="mb-16 text-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gradient">Schedule</p>
              <h2 className="text-5xl font-bold uppercase tracking-wide text-white sm:text-7xl">
                Two-Day Flow
              </h2>
            </div>
          </FadeIn>

          <div className="relative border-l-2 border-white/10 ml-4 sm:ml-8 pl-8 sm:pl-12 space-y-12 py-4">
            {[
              { time: "Fri 7:00 PM", title: "Opening Night: Worship & Prayer" },
              { time: "Sat 10:00 AM", title: "Doors Open & Community" },
              { time: "Sat 11:00 AM", title: "Session 1: The Promise" },
              { time: "Sat 3:00 PM", title: "Session 2: The Comforter" },
              { time: "Sat 6:30 PM", title: "Pure Worship & Deliverance Prayer" },
            ].map((event, i) => (
              <FadeIn key={event.title} delay={i * 0.1}>
                <div className="relative group">
                  {/* Glowing dot */}
                  <div className="absolute -left-[39px] sm:-left-[55px] top-2 h-4 w-4 rounded-full bg-background border-2 border-primary group-hover:bg-primary group-hover:shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-300" />
                  
                  <div className="flex flex-col gap-3">
                    <span className="inline-block w-fit rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-primary border border-white/5 backdrop-blur-md">
                      {event.time}
                    </span>
                    <span className="text-2xl sm:text-4xl font-bold text-white uppercase tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
                      {event.title}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <section className="relative z-10 overflow-hidden px-4 py-32 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-primary/20 -rotate-12 blur-3xl pointer-events-none" />
        
        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <FadeIn>
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.3em] text-white">Don't Miss Out</p>
            <h2 className="mb-8 text-6xl font-bold uppercase tracking-wide text-white sm:text-8xl text-glow" style={{ fontFamily: "var(--font-display)" }}>
              Join Us For 2026
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl sm:text-2xl font-medium text-white/90">
              A simple invitation to gather, worship, pray, and encounter the
              Comforter together.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button asChild size="lg" className="h-20 w-full max-w-sm rounded-full bg-white px-12 text-2xl font-bold uppercase tracking-widest text-background shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:bg-white/90 hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] sm:w-auto" data-testid="button-register-footer">
                <a href={currentConference.registrationUrl} target="_blank" rel="noreferrer">
                  Secure Your Spot <ArrowRight className="ml-3 h-8 w-8" />
                </a>
              </Button>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      <footer className="relative z-10 bg-background pt-20 pb-10 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full" />
          <img
            src={shalomLogo}
            alt="SHALOM"
            className="relative h-20 w-auto mx-auto object-contain z-10"
            data-testid="img-shalom-logo-footer"
          />
        </div>
        
        <p className="text-white/40 font-bold text-sm uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Shalom Conference. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
