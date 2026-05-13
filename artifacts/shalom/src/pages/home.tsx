import React from "react";
import shalomLogo from "@assets/logo_1778697155106.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, Heart, Zap, Users, Sparkles } from "lucide-react";

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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
              <Zap className="mr-2 h-4 w-4" />
              <span>A Generation Awakening • Oct 12-14, 2024</span>
            </div>
          </motion.div>
          
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
              Peace. Wholeness. Flourishing. <br className="hidden md:block" />
              Not just a conference—a collision with the Divine.
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 bg-glow rounded-none uppercase tracking-wider" data-testid="button-register-hero">
                Register Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-medium border-white/20 hover:bg-white/5 rounded-none uppercase tracking-wider" data-testid="button-watch-trailer">
                Watch Trailer
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2. THE VIBE (MANIFESTO) */}
      <section className="py-32 px-6 bg-background relative">
        <div className="container max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-bold mb-10 text-white tracking-tight">WE REFUSE TO BE BORED.</h2>
            <div className="space-y-8 text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              <p>
                There's a cultural script that says youth gatherings have to be generic. Safe. Predictable. We're tearing up that script.
              </p>
              <p className="text-white">
                Shalom is the moment the bass drops and the presence of God fills the room. It's the sacred and the electric. It's deep community, unmatched energy, and a generation desperate for real truth.
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
                src="/images/community.png" 
                alt="Youth community" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-2xl md:text-4xl font-bold text-white max-w-2xl">
                  Find your people. Find your purpose.
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
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-20 text-center tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">What to Expect</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Zap className="h-10 w-10 text-primary" />,
                title: "Electric Worship",
                desc: "High energy, deep reverence. We're turning up the volume and pressing in. No holding back."
              },
              {
                icon: <Heart className="h-10 w-10 text-secondary" />,
                title: "Real Encounter",
                desc: "Beyond the hype. We create space for genuine, life-altering moments with the Spirit."
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Deep Community",
                desc: "Nobody stands alone. Form bonds that outlast the weekend in our squad sessions."
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

      {/* 5. LINEUP */}
      <section className="py-32 px-6">
        <div className="container max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">The Lineup</h2>
              <p className="text-xl text-muted-foreground max-w-md md:text-right">
                Voices that challenge the status quo and lead with fire.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Sarah Jenkins", role: "Keynote Speaker", color: "from-primary/20 to-transparent" },
              { name: "Shalom Worship", role: "House Band", color: "from-secondary/20 to-transparent" },
              { name: "Marcus Doe", role: "Guest Speaker", color: "from-primary/20 to-transparent" },
              { name: "DJ Elevate", role: "Afterparty", color: "from-secondary/20 to-transparent" }
            ].map((speaker, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group relative aspect-[3/4] overflow-hidden bg-muted rounded-none cursor-pointer">
                  <div className={`absolute inset-0 bg-gradient-to-t ${speaker.color} z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                    <h3 className="text-2xl font-bold text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{speaker.name}</h3>
                    <p className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 delay-75">{speaker.role}</p>
                  </div>
                  {/* Placeholder for actual speaker images if we had them */}
                  <div className="absolute inset-0 bg-background flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-20">
                    <Users className="w-20 h-20 text-white/20" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
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
                day: "Friday Night",
                events: [
                  { time: "6:00 PM", title: "Doors Open & Pre-Party" },
                  { time: "7:30 PM", title: "Session 1: The Awakening" }
                ]
              },
              {
                day: "Saturday",
                events: [
                  { time: "10:00 AM", title: "Session 2: Deep Waters" },
                  { time: "1:00 PM", title: "Squad Connect & Lunch" },
                  { time: "3:00 PM", title: "Masterclasses" },
                  { time: "7:00 PM", title: "Session 3: The Outpouring" },
                  { time: "10:00 PM", title: "Neon Afterparty" }
                ]
              },
              {
                day: "Sunday Morning",
                events: [
                  { time: "10:30 AM", title: "Session 4: Sent Out" }
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
              <h3 className="text-2xl font-bold text-white">The Warehouse</h3>
              <p className="text-muted-foreground">123 Industrial Ave, Downtown</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">October 12-14, 2024</h3>
              <p className="text-muted-foreground">All weekend event</p>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.4} className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">$49 Early Bird</h3>
              <p className="text-muted-foreground">Includes all access & merch</p>
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
              Don't Miss It
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12 font-medium">
              Spaces are limited. The moment is now. Gather your crew.
            </p>
            <Button size="lg" className="h-16 px-10 text-xl font-bold bg-background text-foreground hover:bg-background/90 rounded-none uppercase tracking-wider" data-testid="button-register-footer">
              Secure Your Spot <ArrowRight className="ml-2 h-6 w-6" />
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
