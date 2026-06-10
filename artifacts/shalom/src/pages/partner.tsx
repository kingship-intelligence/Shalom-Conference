import { Link } from "wouter";
import { ArrowRight, HandHeart, HeartHandshake, Megaphone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentConference } from "@/data/conferences";
import SiteHeader from "@/components/SiteHeader";

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

export default function Partner() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-24 sm:text-left">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--secondary)/0.16),transparent_46%)]" />
          <div className="container relative z-10 mx-auto max-w-6xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-primary sm:text-sm sm:tracking-[0.35em]">
              Partner With Us
            </p>
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
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary sm:text-sm sm:tracking-[0.35em]">
                Ways To Partner
              </p>
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
    </div>
  );
}
