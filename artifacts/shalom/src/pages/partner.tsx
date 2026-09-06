import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, HandHeart, HeartHandshake, Mail, Megaphone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentConference } from "@/data/conferences";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const partnerPaths = [
  {
    icon: <HeartHandshake className="h-8 w-8 text-primary" />,
    title: "Sponsor The Gathering",
    text: "Help make space for students and young adults to encounter God through worship, ministry, and community.",
  },
  {
    icon: <HandHeart className="h-8 w-8 text-secondary" />,
    title: "Serve With Us",
    text: "Join the volunteer team that welcomes guests, supports prayer moments, and helps the day run with excellence.",
  },
  {
    icon: <Megaphone className="h-8 w-8 text-primary" />,
    title: "Spread The Word",
    text: "Invite your church, youth group, campus ministry, and community into what God is doing through Shalom.",
  },
];

const CASH_APP_URL = "https://cash.app/$HGAReveille";
const ZEFFY_URL = "https://www.zeffy.com/en-US/donation-form/donate-towards-shalom-conference";
const FINANCE_EMAIL = "finance@shalomconference.com";

export default function Partner() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-24 sm:text-left">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--secondary)/0.16),transparent_46%)]" />
          <div className="container relative z-10 mx-auto max-w-6xl">
            <h1 className="mb-8 text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-6xl md:text-8xl">
              Help Carry The Vision
            </h1>
            <p className="mx-auto max-w-4xl text-lg font-light leading-relaxed text-muted-foreground sm:mx-0 sm:text-2xl">
              Shalom is built through prayer, generosity, service, and shared
              faith. Partner with us as we prepare a place for pure worship,
              deliverance, and spiritual renewal.
            </p>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card px-4 py-16 sm:px-6 sm:py-20">
          <div className="container mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
            {partnerPaths.map((path) => (
              <article key={path.title} className="rounded-2xl border border-white/10 bg-background/60 p-8 text-center md:text-left">
                <div className="mx-auto mb-6 w-fit rounded-xl bg-white/5 p-4 md:mx-0">{path.icon}</div>
                <h2 className="mb-4 text-2xl font-bold text-white">{path.title}</h2>
                <p className="leading-relaxed text-muted-foreground">{path.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="container mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-card p-8 text-center lg:text-left">
              <ShieldCheck className="mx-auto mb-6 h-10 w-10 text-primary lg:mx-0" />
              <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-white">
                Shalom {currentConference.year}
              </h2>
              <p className="mb-6 text-muted-foreground">
                Every partnership helps create an environment where people can
                encounter the Comforter and leave renewed.
              </p>
              <p className="font-mono text-sm uppercase tracking-widest text-primary">
                {currentConference.date}
              </p>
              <p className="mt-2 text-muted-foreground">{currentConference.location}</p>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="mb-8 text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl md:text-6xl">
                Pray, Give, Serve, Invite
              </h2>
              <div className="space-y-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                <p>
                  Partnership is more than funding an event. It is joining the
                  mission to see students and young adults meet Jesus, receive
                  deliverance, and experience spiritual renewal.
                </p>
                <p>
                  If you want to sponsor, volunteer, bring a group, or help
                  promote Shalom 2026, start the conversation with our team.
                </p>
              </div>

                <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/10 p-6 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                        Give via Cash App
                      </h3>
                      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                        Help make Shalom possible through a one-time gift. Use
                        the button or search this handle directly in Cash App.
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
                      className="w-full rounded-none bg-primary uppercase tracking-wider text-primary-foreground hover:bg-primary/90 sm:w-auto"
                    >
                      <a
                        href={CASH_APP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Give via Cash App to HGA Reveille"
                      >
                        Give via Cash App <ArrowUpRight className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="w-full rounded-none border-primary/40 uppercase tracking-wider text-white hover:bg-primary/10 hover:text-white sm:w-auto"
                    >
                      <a
                        href={ZEFFY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Donate through Zeffy"
                      >
                        Give via Zeffy <ArrowUpRight className="h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                  <div className="mt-8 border-t border-primary/20 pt-6">
                    <div className="flex items-start gap-3 text-left">
                      <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <h4 className="font-bold uppercase tracking-wide text-white">
                          Need a receipt or payment confirmation?
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          Email{" "}
                          <a
                            href={`mailto:${FINANCE_EMAIL}?subject=Donation%20receipt%20request`}
                            className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:text-white"
                          >
                            {FINANCE_EMAIL}
                          </a>{" "}
                          after giving. To help us find the gift, share only the
                          donation date, amount, Cash App name or transaction
                          reference, and whether it was personal or organizational.
                          Please do not send bank details, passwords, or other
                          sensitive payment information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-card/60 p-6 text-left sm:p-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Sponsorships &amp; larger gifts
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  For sponsorship questions, matching gifts, or a larger
                  contribution, email the finance team before or after giving.
                  Finance will confirm the gift, clarify any receipt or
                  payment-confirmation needs, and follow up directly about
                  sponsorship details. Please send donor information only when it
                  is needed for that follow-up.
                </p>
                <a
                  href={`mailto:${FINANCE_EMAIL}?subject=Sponsorship%20or%20donation%20question`}
                  className="mt-5 inline-flex items-center gap-2 font-bold uppercase tracking-wider text-primary hover:text-white"
                >
                  Email finance <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Button asChild size="lg" className="w-full max-w-xs rounded-none uppercase tracking-wider sm:w-auto">
                  <a href="mailto:hello@shalomconference.com?subject=Partner%20With%20Shalom">
                    Partner With Us <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full max-w-xs rounded-none border-white/20 uppercase tracking-wider sm:w-auto"
                >
                  <Link href="/about">
                    Learn About Shalom <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
