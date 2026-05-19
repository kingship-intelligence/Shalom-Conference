import React from "react";
import { Link } from "wouter";
import shalomLogo from "@assets/logo_1778697155106.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, Heart, Zap, Users, Sparkles, ChevronDown } from "lucide-react";
import { archivedConferences, currentConference } from "@/data/conferences";

const featuredArchiveYears = new Set(["2025", "2024"]);
const featuredArchiveConferences = archivedConferences.filter((conference) =>
  featuredArchiveYears.has(conference.year),
);

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
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden px-4 pb-28 pt-32 sm:px-6 sm:pb-32 sm:pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background z-10" />
          <img 
            src="/images/worship.png" 
            alt="Worship atmosphere" 
            className="w-full h-full object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        </div>

        <div className="relative z-10 container mx-auto flex max-w-6xl flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-6xl font-black uppercase leading-none tracking-tighter text-glow sm:text-7xl md:text-9xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            SHALOM
          </motion.h1>

          <FadeIn delay={0.4} className="max-w-2xl mx-auto mb-10">
            <p className="text-lg font-light leading-relaxed text-muted-foreground sm:text-xl md:text-3xl">
              Pure worship. Deliverance. Spiritual renewal. <br className="hidden md:block" />
              Shalom 2026 is centered on the Comforter.
            </p>
          </FadeIn>

          <FadeIn delay={0.6} className="w-full sm:w-auto">
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="h-14 w-full max-w-xs rounded-none bg-primary px-8 text-lg font-bold uppercase tracking-wider text-primary-foreground bg-glow hover:bg-primary/90 sm:w-auto" data-testid="button-register-hero">
                <a href={currentConference.registrationUrl} target="_blank" rel="noreferrer">
                  Register for 2026 <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 w-full max-w-xs rounded-none border-white/20 px-8 text-lg font-medium uppercase tracking-wider hover:bg-white/5 sm:w-auto">
                <Link href="/archive">Explore Archives</Link>
              </Button>
            </div>
          </FadeIn>
        </div>

        <motion.a
          href="#comforter"
          aria-label="Scroll to learn more"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: [0, 12, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 1 },
            y: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-colors hover:text-primary"
        >
          <span className="text-xs font-bold uppercase tracking-[0.35em]">Scroll</span>
          <ChevronDown className="h-8 w-8" aria-hidden="true" />
        </motion.a>
      </section>

      {/* 2. THE VIBE (MANIFESTO) */}
      <section id="comforter" className="relative bg-background px-4 py-24 sm:px-6 sm:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <FadeIn>
            <h2 className="mb-10 text-4xl font-bold tracking-tight text-white md:text-6xl">THE COMFORTER IS NEAR.</h2>
            <div className="space-y-8 text-lg font-light leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
              <p>
                Shalom 2026 is a one-day gathering for pure worship,
                deliverance, and spiritual renewal in the presence of God.
              </p>
              <p className="text-white">
                The theme is The Comforter, taken from {currentConference.scripture}:
                the Holy Spirit drawing close to bring freedom, renewal,
                conviction, healing, and real peace.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 3. IMAGE BREAK */}
      <section className="px-4 py-12 sm:px-6">
        <div className="container max-w-7xl mx-auto">
          <FadeIn>
            <div className="relative aspect-video md:aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
              <img 
                src="/images/home/shalom-worship-moment.png" 
                alt="Shalom worship moment" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-center sm:bottom-8 sm:left-8 sm:right-8 sm:text-left">
                <p className="mx-auto max-w-2xl text-2xl font-bold text-white sm:mx-0 md:text-4xl">
                  One conference. Many years of testimony.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. PILLARS */}
      <section className="border-y border-white/5 bg-card px-4 py-24 sm:px-6 sm:py-32">
        <div className="container max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="mb-14 bg-gradient-to-r from-primary to-secondary bg-clip-text text-center text-4xl font-black uppercase tracking-tighter text-transparent sm:text-5xl md:mb-20 md:text-7xl">Shalom 2026</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Zap className="h-10 w-10 text-primary" />,
                title: "Pure Worship",
                desc: "A room turned toward Jesus with space to listen, respond, and encounter the Holy Spirit."
              },
              {
                icon: <Heart className="h-10 w-10 text-secondary" />,
                title: "Deliverance",
                desc: "Prayer and ministry focused on the freedom, healing, and restoration God brings."
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Spiritual Renewal",
                desc: "A place for students and young adults to be refreshed, revived, and sent with purpose."
              }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.2}>
                <div className="flex flex-col items-center space-y-4 rounded-2xl border border-white/5 bg-background/50 p-8 text-center transition-colors duration-300 hover:border-primary/30 md:items-start md:text-left">
                  <div className="w-fit rounded-xl bg-white/5 p-4">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ARCHIVE */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="container max-w-7xl mx-auto">
          <FadeIn>
            <div className="mb-12 flex flex-col items-center justify-between gap-6 text-center md:mb-16 md:flex-row md:items-end md:text-left">
              <h2 className="text-4xl font-black uppercase tracking-tighter sm:text-5xl md:text-7xl">The Archive</h2>
              <p className="max-w-md text-lg text-muted-foreground sm:text-xl md:text-right">
                A living catalog of previous Shalom gatherings, themes, and moments.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredArchiveConferences.map((conference, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <Link href={`/archive/${conference.year}`} className="group relative block aspect-[4/3] overflow-hidden bg-muted rounded-2xl cursor-pointer">
                  <img
                    src={conference.image}
                    alt={`${conference.year} ${conference.theme}`}
                    className="absolute inset-0 h-full w-full object-cover opacity-30 transition duration-500 group-hover:scale-105 group-hover:opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 text-center sm:p-6 sm:text-left">
                    <p className="font-mono text-sm uppercase tracking-widest text-primary mb-3">
                      {conference.year}
                    </p>
                    <h3 className="text-2xl font-bold text-white sm:text-3xl">{conference.theme}</h3>
                    <p className="text-muted-foreground mt-3 max-w-md">{conference.summary}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2} className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="rounded-none border-white/20 uppercase tracking-wider">
              <Link href="/archive">
                View Full Archive <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* 6. SCHEDULE */}
      <section className="bg-card px-4 py-24 sm:px-6 sm:py-32">
        <div className="container max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="mb-14 text-center text-4xl font-black uppercase tracking-tighter sm:text-5xl md:mb-16">The Schedule</h2>
          </FadeIn>
          
          <div className="space-y-12">
            {[
              {
                day: "Morning",
                events: [
                  { time: "10:00 AM", title: "Doors Open & Community" },
                  { time: "11:00 AM", title: "Session 1: The Promise" }
                ]
              },
              {
                day: "Midday",
                events: [
                  { time: "1:00 PM", title: "Lunch & Connect" },
                  { time: "3:00 PM", title: "Session 2: The Comforter" }
                ]
              },
              {
                day: "Evening",
                events: [
                  { time: "6:30 PM", title: "Pure Worship & Deliverance Prayer" }
                ]
              }
            ].map((day, i) => (
              <FadeIn key={i} delay={i * 0.1} className="border-b border-white/10 pb-12 last:border-0">
                <h3 className="mb-6 text-center text-3xl font-bold text-primary sm:text-left">{day.day}</h3>
                <div className="space-y-4">
                  {day.events.map((event, j) => (
                    <div key={j} className="group flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
                      <span className="w-28 font-mono text-sm text-muted-foreground">{event.time}</span>
                      <span className="text-xl font-medium text-white transition-colors group-hover:text-primary">{event.title}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 7. DETAILS */}
      <section className="border-y border-white/5 bg-background px-4 py-20 sm:px-6 sm:py-24">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 md:flex-row">
          <FadeIn className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Owings Mills, Maryland</h3>
              <p className="text-muted-foreground">{currentConference.location}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{currentConference.date}</h3>
              <p className="text-muted-foreground">One-day event</p>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.4} className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">The Comforter</h3>
              <p className="text-muted-foreground">Theme for Shalom 2026</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 8. CTA / FOOTER */}
      <section className="relative overflow-hidden bg-primary px-4 py-24 sm:px-6 sm:py-32">
        <div className="absolute inset-0 bg-[url('/images/worship.png')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent mix-blend-multiply" />
        
        <div className="container relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="mb-8 text-4xl font-black uppercase tracking-tighter text-primary-foreground sm:text-6xl md:text-8xl">
              Register for 2026
            </h2>
            <p className="mb-12 text-lg font-medium text-primary-foreground/80 sm:text-xl md:text-2xl">
              Join us for pure worship, deliverance, and spiritual renewal.
            </p>
            <Button asChild size="lg" className="h-16 w-full max-w-xs rounded-none bg-background px-10 text-xl font-bold uppercase tracking-wider text-foreground hover:bg-background/90 sm:w-auto" data-testid="button-register-footer">
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
