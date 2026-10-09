import { useEffect, useRef, useState } from "react";
import { useCreateFirstTimerResponse } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Calendar, CheckCircle2, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentConference, getConferenceByYear, type Conference } from "@/data/conferences";
import NotFound from "@/pages/not-found";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type ConferenceYearProps = {
  year?: string;
};

const SPEAKER_AUTO_FLIP_DELAY_MS = 5000;

function FirstTimerForm({ conferenceYear }: { conferenceYear: number }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const createResponse = useCreateFirstTimerResponse();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (!name.trim() || !email.trim() || isFirstTime === null) {
      setFeedback("We need your name, your email, and a yes or no.");
      return;
    }

    createResponse.mutate(
      {
        data: {
          name: name.trim(),
          email: email.trim(),
          isFirstTime,
          conferenceYear,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setName("");
          setEmail("");
          setIsFirstTime(null);
        },
        onError: (error: any) => {
          setFeedback(
            error.data?.error ||
              "That didn't go through. Check your connection and try once more.",
          );
        },
      },
    );
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h3 className="mt-5 text-2xl font-black uppercase text-ink">Got it</h3>
        <p className="mt-3 max-w-md text-copy-60">
          Thanks for letting us know. See you in October.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="first-timer-name" className="mb-2 block text-xs font-bold uppercase tracking-widest text-copy-55">
          Full name
        </label>
        <Input
          id="first-timer-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
          maxLength={160}
          className="h-12 rounded-xl border-ink/15 bg-shade/20 text-ink placeholder:text-copy-30"
          placeholder="Your full name"
        />
      </div>
      <div>
        <label htmlFor="first-timer-email" className="mb-2 block text-xs font-bold uppercase tracking-widest text-copy-55">
          Email address
        </label>
        <Input
          id="first-timer-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          maxLength={254}
          className="h-12 rounded-xl border-ink/15 bg-shade/20 text-ink placeholder:text-copy-30"
          placeholder="you@example.com"
        />
      </div>
      <fieldset>
        <legend className="mb-3 text-xs font-bold uppercase tracking-widest text-copy-55">
          Is this your first Shalom?
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((option) => (
            <label
              key={option.label}
              className={`cursor-pointer rounded-full border px-4 py-3 text-center text-sm font-bold uppercase tracking-wider transition-colors ${
                isFirstTime === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-ink/15 bg-shade/20 text-copy-65 hover:border-primary/60"
              }`}
            >
              <input
                type="radio"
                name="isFirstTime"
                value={String(option.value)}
                checked={isFirstTime === option.value}
                onChange={() => setIsFirstTime(option.value)}
                required
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      {feedback && (
        <p role="alert" className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {feedback}
        </p>
      )}
      <Button
        type="submit"
        disabled={createResponse.isPending}
        className="h-12 w-full rounded-full font-bold uppercase tracking-widest"
      >
        {createResponse.isPending ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}

function SpeakerCard({
  speaker,
  autoFlip = false,
}: {
  speaker: NonNullable<Conference["speakers"]>[number];
  autoFlip?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isLandscape = speaker.imageLayout === "landscape";

  useEffect(() => {
    if (
      !speaker.bio ||
      !autoFlip ||
      !cardRef.current ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const card = cardRef.current;
    let timeout: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(card);
          timeout = window.setTimeout(() => setFlipped(true), SPEAKER_AUTO_FLIP_DELAY_MS);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(card);
    return () => {
      observer.disconnect();
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, [autoFlip, speaker.bio]);

  const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";
  const imageClass = "h-full w-full object-contain";

  if (!speaker.bio) {
    return (
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-background/60 text-center sm:text-left">
        {speaker.image ? (
          <img
            src={speaker.image}
            alt={speaker.name}
            loading="lazy"
            decoding="async"
            className={`${aspectClass} h-auto w-full bg-background/60 object-contain`}
          />
        ) : (
          <div className={`${aspectClass} flex items-center justify-center bg-primary/5`}>
            <Users className="h-10 w-10 text-primary" />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-ink">{speaker.name}</h3>
          <p className="text-muted-foreground">{speaker.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="group">
      <button
        type="button"
        onClick={() => setFlipped((current) => !current)}
        className={`relative block w-full ${aspectClass} [perspective:1200px]`}
        aria-label={`${flipped ? "Show photo" : "Read bio"} for ${speaker.name}`}
        aria-pressed={flipped}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-ink/10 bg-background/60 text-left transition-transform duration-700 [backface-visibility:hidden] [transform-style:preserve-3d] motion-reduce:transition-none"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {speaker.image ? (
            <img
              src={speaker.image}
              alt={speaker.name}
              loading="lazy"
              decoding="async"
              className={imageClass}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/5">
              <Users className="h-10 w-10 text-primary" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-5 pb-5 pt-16">
            <h3 className="text-2xl font-bold text-white">{speaker.name}</h3>
            <p className="text-sm text-white/75">{speaker.role}</p>
          </div>
        </div>

        <div
          className="absolute inset-0 flex flex-col overflow-y-auto rounded-2xl border border-primary/30 bg-background p-5 text-left transition-transform duration-700 [backface-visibility:hidden] [transform:rotateY(180deg)] [transform-style:preserve-3d] motion-reduce:transition-none sm:p-6"
          style={{ transform: flipped ? "rotateY(0deg)" : "rotateY(-180deg)" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{speaker.role}</p>
          <h3 className="mt-3 text-2xl font-bold text-ink">{speaker.name}</h3>
          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{speaker.bio}</p>
        </div>
      </button>
      <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-copy-45">
        Tap to {flipped ? "see photo" : "read bio"}
      </p>
    </div>
  );
}

export default function ConferenceYear({ year = currentConference.year }: ConferenceYearProps) {
  const conference = getConferenceByYear(year);

  if (!conference) {
    return <NotFound />;
  }

  const isCurrent = conference.year === currentConference.year;
  const schedule = conference.schedule ?? [];
  const speakers = conference.speakers ?? [];
  const hasProgramme = schedule.length > 0 || speakers.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {conference.flyer ? (
          <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pb-20 pt-28 sm:px-6">
            {/* Flyer, blurred, as the backdrop */}
            <div className="absolute inset-0">
              <img
                src={conference.flyer}
                alt=""
                aria-hidden="true"
                decoding="async"
                className="h-full w-full scale-110 object-cover opacity-40 blur-2xl"
              />
              <div className="absolute inset-0 bg-background/70" />
            </div>

            <div className="container relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
              <div className="flex justify-center lg:justify-start">
                <img
                  src={conference.flyer}
                  alt={`Shalom ${conference.year} flyer: ${conference.theme}`}
                  fetchPriority="high"
                  className="max-h-[78vh] w-auto max-w-sm rounded-2xl shadow-2xl ring-1 ring-ink/10 sm:max-w-md"
                />
              </div>

              <div className="text-center lg:text-left">
                <h2 className="mb-6 text-2xl font-black uppercase tracking-tighter text-ink sm:text-3xl lg:text-4xl">
                  {conference.summary}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {conference.description}
                </p>

                {isCurrent ? (
                  <div className="mt-10 flex flex-col items-center gap-3 lg:items-start">
                    <Button
                      asChild
                      size="lg"
                      className="h-14 w-full max-w-xs rounded-full bg-primary px-8 text-base font-bold uppercase tracking-wide text-primary-foreground shadow-lg hover:bg-primary/90 sm:text-lg sm:tracking-wider"
                    >
                      <Link href="/register">
                        Register for Shalom {conference.year}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    {conference.schedulePdf ? (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="min-h-12 w-full max-w-xs rounded-full border-ink/20 px-8 text-base font-semibold text-ink hover:border-primary hover:bg-primary/10"
                      >
                        <a href={conference.schedulePdf} target="_blank" rel="noopener noreferrer">
                          View the schedule
                          <Calendar className="ml-2 h-5 w-5" />
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="h-auto min-h-12 w-full max-w-xs whitespace-normal rounded-full border-ink/20 bg-ink/5 px-5 py-3 text-xs font-bold uppercase leading-snug tracking-wide text-ink hover:border-primary hover:bg-primary/10 hover:text-ink sm:text-sm"
                    >
                      <Link href="/register?badge=1">
                        Already registered? Make your badge
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : (
          <section className="relative flex min-h-[85dvh] items-center overflow-hidden px-4 pb-20 pt-40 text-center sm:px-6 sm:pb-24 sm:pt-32 sm:text-left">
            <div className="absolute inset-0">
              <img
                src={conference.image}
                alt={`Shalom ${conference.year}: ${conference.theme}`}
                className="h-full w-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/78 to-background" />
            </div>

            <div className="container relative z-10 mx-auto max-w-6xl">
              <p className="mb-6 font-mono text-sm uppercase tracking-widest text-primary">
                Shalom {conference.year}
              </p>

              <h1 className="mb-6 text-4xl font-black uppercase leading-none tracking-tighter text-ink sm:text-6xl md:text-9xl">
                {conference.theme}
              </h1>
              <p className="mx-auto mb-10 max-w-3xl text-lg font-light leading-relaxed text-muted-foreground sm:mx-0 sm:text-2xl md:text-3xl">
                {conference.tagline}
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                {isCurrent ? (
                  <Button
                    asChild
                    size="lg"
                    className="h-14 w-full max-w-xs rounded-full px-8 text-base font-bold uppercase tracking-wide sm:w-auto sm:text-lg"
                  >
                    <Link href="/register">
                      Register for Shalom {conference.year}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                ) : null}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 w-full max-w-xs rounded-full border-ink/20 px-8 text-base font-medium uppercase tracking-wide sm:w-auto sm:text-lg"
                >
                  <Link href="/archive">
                    Back to the archive <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        <section className="border-y border-ink/10 bg-card px-4 py-16 sm:px-6">
          <div className="container mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-ink">When</h2>
                <p className="text-muted-foreground">{conference.date}</p>
              </div>
            </div>
            {conference.location ? (
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-ink">Where</h2>
                  <p className="text-muted-foreground">{conference.location}</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {conference.scripture && conference.scriptureText ? (
          <section className="px-4 py-20 sm:px-6 sm:py-24">
            <blockquote className="container mx-auto max-w-4xl text-center">
              <p className="text-2xl font-light italic leading-snug text-ink sm:text-3xl md:text-4xl">
                “{conference.scriptureText}”
              </p>
              <footer className="mt-6 font-mono text-sm uppercase tracking-widest text-primary">
                {conference.scripture}
              </footer>
            </blockquote>
          </section>
        ) : null}

        {isCurrent && conference.year === "2026" ? (
          <section id="first-timers" className="scroll-mt-24 border-t border-ink/10 px-4 py-20 sm:px-6 sm:py-24">
            <div className="container mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
              <div className="text-center lg:text-left">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-ink sm:text-6xl">
                  First time at Shalom?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-copy-60 lg:mx-0">
                  Tell us so we can look out for you when you arrive. This is a separate,
                  quick form. It doesn't register you for the conference.
                </p>
              </div>
              <FirstTimerForm conferenceYear={Number(conference.year)} />
            </div>
          </section>
        ) : null}

        {hasProgramme ? (
          <section className="bg-card px-4 py-20 sm:px-6 sm:py-24">
            <div className="container mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
              {schedule.length > 0 ? (
                <div id="lineup" className="scroll-mt-24 text-center lg:text-left">
                  <h2 className="mb-10 text-3xl font-black uppercase tracking-tighter text-ink sm:text-4xl md:text-6xl">
                    Schedule
                  </h2>
                  <div className="space-y-6">
                    {schedule.map((event) => (
                      <div
                        key={`${event.time}-${event.title}`}
                        className="border-b border-ink/10 pb-6 last:border-0"
                      >
                        <p className="mb-2 font-mono text-sm uppercase tracking-widest text-primary">
                          {event.time}
                        </p>
                        {event.label && (
                          <p className="mb-1 text-sm font-bold uppercase tracking-[0.2em] text-copy-60">
                            {event.label}
                          </p>
                        )}
                        <h3 className="text-xl font-bold text-ink sm:text-2xl">{event.title}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {speakers.length > 0 ? (
                <div className="text-center lg:text-left">
                  <h2 className="mb-10 text-3xl font-black uppercase tracking-tighter text-ink sm:text-4xl md:text-6xl">
                    {isCurrent ? "Who's ministering" : "Who ministered"}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {speakers.map((speaker) => (
                      <SpeakerCard
                        key={speaker.name}
                        speaker={speaker}
                        autoFlip={isCurrent}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
