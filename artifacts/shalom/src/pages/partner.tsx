import { Link } from "wouter";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentConference } from "@/data/conferences";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const CASH_APP_URL = "https://cash.app/$HGAReveille";
const ZEFFY_URL =
  "https://www.zeffy.com/en-US/donation-form/donate-towards-shalom-conference";
const FINANCE_EMAIL = "finance@shalomconference.com";
const CONTACT_EMAIL = "admin@shalomconference.com";

export default function Partner() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="px-4 py-20 text-center sm:px-6 sm:py-24 sm:text-left">
          <div className="container mx-auto max-w-6xl">
            <h1 className="mb-8 text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-6xl md:text-8xl">
              Partner with us
            </h1>
            <p className="mx-auto max-w-4xl text-lg font-light leading-relaxed text-muted-foreground sm:mx-0 sm:text-2xl">
              Shalom happens because people give, serve, and bring their friends. Here are
              the ways to help.
            </p>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 sm:pb-24">
          <div className="container mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-card p-8 text-center lg:text-left">
              <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-white">
                Shalom {currentConference.year}
              </h2>
              <p className="font-mono text-sm uppercase tracking-widest text-primary">
                {currentConference.date}
              </p>
              <p className="mt-2 text-muted-foreground">{currentConference.location}</p>
              <p className="mt-6 text-muted-foreground">
                Every gift goes toward putting on the conference and making the room ready
                for whoever walks in.
              </p>
            </div>

            <div className="text-center lg:text-left">
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                      Give
                    </h3>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                      Cash App is the quickest way. Zeffy works too if you'd rather use a card.
                    </p>
                  </div>
                  <p className="shrink-0 rounded-full border border-primary/40 bg-background/70 px-4 py-2 font-mono text-base font-bold text-white">
                    $HGAReveille
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="w-full rounded-full bg-primary uppercase tracking-wider text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  >
                    <a href={CASH_APP_URL} target="_blank" rel="noopener noreferrer">
                      Cash App <ArrowUpRight className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-primary/40 uppercase tracking-wider text-white hover:bg-primary/10 hover:text-white sm:w-auto"
                  >
                    <a href={ZEFFY_URL} target="_blank" rel="noopener noreferrer">
                      Zeffy <ArrowUpRight className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  Need a receipt, or want to talk about sponsoring? Email{" "}
                  <a
                    href={`mailto:${FINANCE_EMAIL}?subject=Shalom%20giving`}
                    className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:text-white"
                  >
                    {FINANCE_EMAIL}
                  </a>{" "}
                  with the date and amount and we'll sort it out.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-card/60 p-6 text-left sm:p-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Serve
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  We need ushers, media, parking, welcome team, setup and clean-up crews, and
                  people to help with the kids. You can pick a team when you register.
                </p>
                <Link
                  href="/register"
                  className="mt-5 inline-flex items-center gap-2 font-bold uppercase tracking-wider text-primary hover:text-white"
                >
                  Register and volunteer <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-card/60 p-6 text-left sm:p-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Bring people
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  The best thing you can do is invite someone. Your youth group, your campus
                  fellowship, the friend who has stopped coming to church. If you're bringing a
                  group and want to coordinate, email us.
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Bringing%20a%20group%20to%20Shalom`}
                  className="mt-5 inline-flex items-center gap-2 font-bold uppercase tracking-wider text-primary hover:text-white"
                >
                  {CONTACT_EMAIL} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
