import { Link } from "wouter";
import { ArrowRight, Calendar, Mail, MapPin, MessageSquare, Sparkles, Users, Zap } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { currentConference, getConferenceByYear } from "@/data/conferences";
import NotFound from "@/pages/not-found";
import SiteHeader from "@/components/SiteHeader";
import shalomLogo from "@assets/logo_1778697155106.png";

type ConferenceYearProps = {
  year?: string;
};

export default function ConferenceYear({ year = currentConference.year }: ConferenceYearProps) {
  const conference = getConferenceByYear(year);

  if (!conference) {
    return <NotFound />;
  }

  const isCurrent = conference.year === currentConference.year;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {conference.flyer ? (
          <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pb-20 pt-28 sm:px-6">
            {/* Flyer backdrop */}
            <div className="absolute inset-0">
              <img
                src={conference.flyer}
                alt=""
                aria-hidden="true"
                className="h-full w-full scale-110 object-cover opacity-40 blur-2xl"
              />
              <div className="absolute inset-0 bg-background/70" />
            </div>

            <div className="container relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
              {/* Poster */}
              <div className="flex justify-center lg:justify-start">
                <img
                  src={conference.flyer}
                  alt={`Shalom ${conference.year} — ${conference.theme}`}
                  className="max-h-[78vh] w-auto max-w-sm rounded-2xl shadow-2xl ring-1 ring-white/10 sm:max-w-md"
                />
              </div>

              {/* About */}
              <div className="text-center lg:text-left">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary sm:text-sm sm:tracking-[0.35em]">
                  About Shalom {conference.year}
                </p>
                <h2 className="mb-6 text-2xl font-black uppercase tracking-tighter text-white sm:text-3xl lg:text-4xl">
                  {conference.summary}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {conference.description}
                </p>

                {isCurrent ? (
                  <Button
                    asChild
                    size="lg"
                    className="mt-10 h-14 w-full max-w-xs rounded-full bg-primary px-8 text-lg font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90"
                  >
                    <Link href="/register">
                      Register for Shalom {conference.year}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
        ) : (
          <section className="relative flex min-h-[85dvh] items-center overflow-hidden px-4 pb-20 pt-40 text-center sm:px-6 sm:pb-24 sm:pt-32 sm:text-left">
            <div className="absolute inset-0">
              <img
                src={conference.image}
                alt={`${conference.year} ${conference.theme}`}
                className="h-full w-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/78 to-background" />
              <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
            </div>

            <div className="container relative z-10 mx-auto max-w-6xl">
              <div className="mb-8 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                <Zap className="mr-2 h-4 w-4" />
                <span>
                  Shalom {conference.year} {isCurrent ? "Registration Open" : "Archive"}
                </span>
              </div>

              <h1 className="mb-6 text-4xl font-black uppercase leading-none tracking-tighter text-glow sm:text-6xl md:text-9xl">
                {conference.theme}
              </h1>
              <p className="mx-auto mb-10 max-w-3xl text-lg font-light leading-relaxed text-muted-foreground sm:mx-0 sm:text-2xl md:text-3xl">
                {conference.tagline}
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                {isCurrent && conference.registrationUrl ? (
                  <Button
                    asChild
                    size="lg"
                    className="h-14 w-full max-w-xs rounded-none px-8 text-lg font-bold uppercase tracking-wider bg-glow sm:w-auto"
                  >
                    <a href={conference.registrationUrl} target="_blank" rel="noreferrer">
                      Register for Shalom {conference.year}
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </Button>
                ) : null}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 w-full max-w-xs rounded-none border-white/20 px-8 text-lg font-medium uppercase tracking-wider sm:w-auto"
                >
                  <Link href="/archive">
                    View Archives <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        <section className="border-y border-white/10 bg-card px-4 py-16 sm:px-6">
          <div className="container mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-white">Location</h2>
                <p className="text-muted-foreground">{conference.location}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
              <Calendar className="h-8 w-8 text-secondary" />
              <div>
                <h2 className="text-xl font-bold text-white">Date</h2>
                <p className="text-muted-foreground">{conference.date}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card px-4 py-20 sm:px-6 sm:py-24">
          <div className="container mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h2 className="mb-10 text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl md:text-6xl">
                Schedule
              </h2>
              <div className="space-y-6">
                {conference.schedule.map((event) => (
                  <div
                    key={`${event.time}-${event.title}`}
                    className="border-b border-white/10 pb-6 last:border-0"
                  >
                    <p className="mb-2 font-mono text-sm uppercase tracking-widest text-primary">
                      {event.time}
                    </p>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">{event.title}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="mb-10 text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl md:text-6xl">
                Lineup
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {conference.speakers.map((speaker) => (
                  <div key={speaker.name} className="border border-white/10 bg-background/60 p-6 text-center sm:text-left">
                    <Users className="mx-auto mb-6 h-8 w-8 text-primary sm:mx-0" />
                    <h3 className="text-2xl font-bold text-white">{speaker.name}</h3>
                    <p className="text-muted-foreground">{speaker.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 px-4 pb-10 pt-16 text-white sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 flex justify-center">
            <img src={shalomLogo} alt="SHALOM" className="h-14 w-auto object-contain" />
          </div>

          <div className="mb-12 grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Contact</p>
              <a
                href="mailto:admin@shalomconference.com"
                className="flex items-center justify-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                admin@shalomconference.com
              </a>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Giving</p>
              <a
                href="mailto:finance@shalomconference.com"
                className="flex items-center justify-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                finance@shalomconference.com
              </a>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Testimonies</p>
              <Link
                href="/testimonies"
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                Share Your Testimony
              </Link>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Media</p>
              <a
                href="mailto:media@shalomconference.com"
                className="flex items-center justify-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                media@shalomconference.com
              </a>
            </div>
          </div>

          <div className="mb-8 h-px w-full bg-white/10" />

          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
              © {new Date().getFullYear()} Shalom Conference. All rights reserved.
            </p>
            <a
              href="https://www.instagram.com/shalomconference/"
              target="_blank"
              rel="noreferrer"
              aria-label="Shalom Conference on Instagram"
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-primary"
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
