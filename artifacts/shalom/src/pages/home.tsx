import React from "react";
import { Link } from "wouter";
import shalomLogo from "@assets/logo_1778697155106.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, Heart, Zap, Users, Sparkles } from "lucide-react";
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
      <header className="absolute left-0 right-0 top-0 z-20 px-6 py-5">
        <nav className="container mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={shalomLogo} alt="SHALOM" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium uppercase tracking-widest text-white/70">
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
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background z-10" />
          <img 
            src="/images/worship.png" 
            alt="Worship atmosphere" 
            className="w-full h-full object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        </div>

        <div className="relative z-10 container max-w-6xl mx-auto flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-7xl md:text-9xl font-black tracking-tighter uppercase text-glow mb-6 leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            SHALOM
          </motion.h1>

          <FadeIn delay={0.4} className="max-w-2xl mx-auto mb-10">
            <p className="text-xl md:text-3xl text-muted-foreground font-light leading-relaxed">
              Pure worship. Deliverance. Spiritual renewal. <br className="hidden md:block" />
              Shalom 2026 is centered on the Comforter.
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 bg-glow rounded-none uppercase tracking-wider" data-testid="button-register-hero">
                <a href={currentConference.registrationUrl} target="_blank" rel="noreferrer">
                  Register for 2026 <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-medium border-white/20 hover:bg-white/5 rounded-none uppercase tracking-wider">
                <Link href="/archive">Explore Archives</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2. THE VIBE (MANIFESTO) */}
      <section className="py-32 px-6 bg-background relative">
        <div className="container max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-bold mb-10 text-white tracking-tight">THE COMFORTER IS NEAR.</h2>
            <div className="space-y-8 text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
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
      <section className="py-12 px-6">
        <div className="container max-w-7xl mx-auto">
          <FadeIn>
            <div className="relative aspect-video md:aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
              <img 
                src="/images/home/shalom-worship-moment.png" 
                alt="Shalom worship moment" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-2xl md:text-4xl font-bold text-white max-w-2xl">
                  One conference. Many years of testimony.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. PILLARS */}
      <section className="py-32 px-6 bg-card border-y border-white/5">
        <div className="container max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-20 text-center tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Shalom 2026</h2>
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
                <div className="flex flex-col space-y-4 p-8 rounded-2xl bg-background/50 border border-white/5 hover:border-primary/30 transition-colors duration-300">
                  <div className="p-4 bg-white/5 w-fit rounded-xl">
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
      <section className="py-32 px-6">
        <div className="container max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">The Archive</h2>
              <p className="text-xl text-muted-foreground max-w-md md:text-right">
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
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                    <p className="font-mono text-sm uppercase tracking-widest text-primary mb-3">
                      {conference.year}
                    </p>
                    <h3 className="text-3xl font-bold text-white">{conference.theme}</h3>
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
      <section className="py-32 px-6 bg-card">
        <div className="container max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-5xl font-black uppercase mb-16 text-center tracking-tighter">The Schedule</h2>
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
                <h3 className="text-3xl font-bold text-primary mb-6">{day.day}</h3>
                <div className="space-y-4">
                  {day.events.map((event, j) => (
                    <div key={j} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 group">
                      <span className="text-muted-foreground w-28 font-mono text-sm">{event.time}</span>
                      <span className="text-xl font-medium text-white group-hover:text-primary transition-colors">{event.title}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 7. DETAILS */}
      <section className="py-24 px-6 border-y border-white/5 bg-background">
        <div className="container max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center justify-between">
          <FadeIn className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Owings Mills, Maryland</h3>
              <p className="text-muted-foreground">{currentConference.location}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{currentConference.date}</h3>
              <p className="text-muted-foreground">One-day event</p>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.4} className="flex items-center gap-6">
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
      <section className="py-32 px-6 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('/images/worship.png')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent mix-blend-multiply" />
        
        <div className="container relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-primary-foreground mb-8">
              Register for 2026
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12 font-medium">
              Join us for pure worship, deliverance, and spiritual renewal.
            </p>
            <Button asChild size="lg" className="h-16 px-10 text-xl font-bold bg-background text-foreground hover:bg-background/90 rounded-none uppercase tracking-wider" data-testid="button-register-footer">
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
