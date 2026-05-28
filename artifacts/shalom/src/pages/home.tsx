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
            <div className="flex flex-wrap gap-2.5 mb-10">
              {[
                { icon: <Calendar className="h-3.5 w-3.5" />, text: currentConference.shortDate },
                { icon: <MapPin className="h-3.5 w-3.5" />, text: "Windsor Mill, MD" },
                { icon: <BookOpen className="h-3.5 w-3.5" />, text: currentConference.scripture },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">
                  <span className="text-primary">{item.icon}</span>
                  {item.text}
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
            src="/images/home/shalom-hero-worship-hd.png"
            alt="Shalom worship gathering"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </section>

      {/* INVITATION */}
      <section id="details" className="bg-gray-50 px-4 py-24 sm:px-6">
        <div className="container mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <FadeIn>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">The Invitation</p>
            <h2
              className="mb-8 text-5xl font-bold uppercase leading-none tracking-wide text-gray-900 sm:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              A simple room for encounter.
            </h2>
            <div className="space-y-5 text-lg font-medium leading-relaxed text-gray-500">
              <p>
                Shalom 2026 is centered on{" "}
                <span className="font-bold text-primary">{currentConference.scripture}</span>{" "}
                — the promise and ministry of the Comforter.
              </p>
              <p>
                We are gathering for worship, teaching, prayer, deliverance, and spiritual renewal for everyone earnestly seeking Christ.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-7">
                {[
                  { icon: <Calendar className="h-5 w-5" />, label: "Date", value: currentConference.date },
                  { icon: <MapPin className="h-5 w-5" />, label: "Location", value: currentConference.location },
                  { icon: <Sparkles className="h-5 w-5" />, label: "Theme", value: currentConference.theme },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4 items-start">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{item.label}</p>
                      <p className="mt-1 text-xl font-bold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FULL-WIDTH PHOTO */}
      <section className="px-4 py-16 sm:px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <FadeIn>
            <div className="relative w-full overflow-hidden rounded-2xl aspect-[21/9]">
              <img
                src="/images/home/shalom-hero-worship-hd.png"
                alt="Shalom worship moment"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <p
                className="absolute bottom-8 left-8 right-8 max-w-2xl text-2xl font-bold text-white sm:bottom-10 sm:left-12 sm:text-4xl leading-snug"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Worship that makes space to listen, respond, and be renewed.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section className="bg-gray-50 px-4 py-24 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">What To Expect</p>
              <h2
                className="text-5xl font-bold uppercase tracking-wide text-gray-900 sm:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Worship. Freedom. Renewal.
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <Zap className="h-7 w-7" />,
                title: "Pure Worship",
                desc: "Undistracted worship centered on Jesus — no performance, just presence.",
              },
              {
                icon: <Heart className="h-7 w-7" />,
                title: "Deliverance",
                desc: "Prayer and ministry for freedom, healing, and wholeness.",
              },
              {
                icon: <Users className="h-7 w-7" />,
                title: "Spiritual Renewal",
                desc: "A place to be refreshed, restored, and sent back renewed.",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <h3
                    className="mb-3 text-2xl font-bold text-gray-900 uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-base font-medium text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section className="bg-white px-4 py-24 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <FadeIn>
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Schedule</p>
              <h2
                className="text-5xl font-bold uppercase tracking-wide text-gray-900 sm:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Two-Day Flow
              </h2>
            </div>
          </FadeIn>

          <div className="relative border-l-2 border-gray-200 ml-4 sm:ml-8 pl-8 sm:pl-12 space-y-10 py-2">
            {[
              { time: "Fri 7:00 PM", title: "Opening Night: Worship & Prayer" },
              { time: "Sat 10:00 AM", title: "Doors Open & Community" },
              { time: "Sat 11:00 AM", title: "Session 1: The Promise" },
              { time: "Sat 3:00 PM", title: "Session 2: The Comforter" },
              { time: "Sat 6:30 PM", title: "Pure Worship & Deliverance Prayer" },
            ].map((event, i) => (
              <FadeIn key={event.title} delay={i * 0.08}>
                <div className="relative group">
                  <div className="absolute -left-[39px] sm:-left-[55px] top-2 h-4 w-4 rounded-full bg-white border-2 border-gray-300 group-hover:border-primary group-hover:bg-primary transition-all duration-200" />
                  <div className="flex flex-col gap-2">
                    <span className="inline-block w-fit rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                      {event.time}
                    </span>
                    <span
                      className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {event.title}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
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
