import { Link } from "wouter";
import shalomLogo from "@assets/logo_1778697155106.png";
import { ArrowRight, Calendar, MapPin, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentConference, getConferenceByYear } from "@/data/conferences";
import NotFound from "@/pages/not-found";

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
      <header className="absolute left-0 right-0 top-0 z-20 px-4 py-5 sm:px-6">
        <nav className="container mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={shalomLogo} alt="SHALOM" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-widest text-white/70 sm:gap-5 sm:text-sm">
            <Link href="/2026" className={isCurrent ? "text-primary" : "hover:text-primary"}>
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

      <main>
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

        <section className="border-y border-white/10 bg-card px-4 py-16 sm:px-6">
          <div className="container mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
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
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-white">Theme</h2>
                <p className="text-muted-foreground">{conference.theme}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="container mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_0.8fr]">
            <div className="text-center lg:text-left">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary sm:text-sm sm:tracking-[0.35em]">
                About Shalom {conference.year}
              </p>
              <h2 className="mb-8 text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl md:text-6xl">
                {conference.summary}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {conference.description}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6 text-center sm:p-8 sm:text-left">
              <h3 className="mb-6 flex flex-col items-center gap-3 text-2xl font-bold text-white sm:flex-row">
                <Sparkles className="h-6 w-6 text-primary" />
                Highlights
              </h3>
              {conference.scripture ? (
                <div className="mb-8 rounded-xl border border-white/10 bg-background/60 p-5">
                  <p className="mb-3 font-mono text-sm uppercase tracking-widest text-primary">
                    {conference.scripture}
                  </p>
                  {conference.scriptureText ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {conference.scriptureText}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="space-y-4">
                {conference.highlights.map((highlight) => (
                  <div key={highlight} className="flex flex-col items-center gap-3 text-muted-foreground sm:flex-row">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span>{highlight}</span>
                  </div>
                ))}
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
    </div>
  );
}
