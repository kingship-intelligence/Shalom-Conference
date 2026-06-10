import { ArrowRight, Flame, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { currentConference } from "@/data/conferences";
import SiteHeader from "@/components/SiteHeader";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-24 sm:text-left">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--secondary)/0.18),transparent_45%)]" />
          <div className="container relative z-10 mx-auto max-w-6xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-primary sm:text-sm sm:tracking-[0.35em]">
              About Shalom
            </p>
            <h1 className="mb-8 text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-6xl md:text-8xl">
              What Is Shalom?
            </h1>
            <p className="mx-auto max-w-4xl text-lg font-light leading-relaxed text-muted-foreground sm:mx-0 sm:text-2xl">
              Shalom is an annual conference inspired by the Holy Spirit.
            </p>
            <p className="mx-auto mt-6 max-w-4xl text-lg font-light leading-relaxed text-muted-foreground sm:mx-0 sm:text-2xl">
              We aim to create an atmosphere that will foster genuine worship,
              spiritual awakening, and deliverance in the lives of those who are
              earnestly seeking Christ with an extreme thirst after righteousness.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="container mx-auto max-w-7xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-card sm:aspect-video md:aspect-[21/9]">
              <img
                src="/images/home/shalom-about-worship.png"
                alt="Shalom worship moment"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-card px-4 py-16 sm:px-6 sm:py-20">
          <div className="container mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
            {[
              {
                icon: <Heart className="h-8 w-8 text-primary" />,
                title: "Pure Worship",
                text: "We make room for undistracted worship that turns hearts toward Jesus.",
              },
              {
                icon: <Flame className="h-8 w-8 text-secondary" />,
                title: "Deliverance",
                text: "We believe God still breaks chains, restores lives, and meets people with freedom.",
              },
              {
                icon: <Sparkles className="h-8 w-8 text-primary" />,
                title: "Spiritual Renewal",
                text: "We gather with expectation for fresh hunger, healing, courage, and peace.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-background/60 p-8 text-center md:text-left">
                <div className="mx-auto mb-6 w-fit rounded-xl bg-white/5 p-4 md:mx-0">{item.icon}</div>
                <h2 className="mb-4 text-2xl font-bold text-white">{item.title}</h2>
                <p className="leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center lg:text-left">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary sm:text-sm sm:tracking-[0.35em]">
                The Heart
              </p>
              <h2 className="mb-8 text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl md:text-6xl">
                We Are Gathering Around The Comforter
              </h2>
              <div className="space-y-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                <p>
                  The 2026 theme is The Comforter, taken from{" "}
                  {currentConference.scripture}. We are asking God to meet
                  people with the comfort, conviction, freedom, and renewal that
                  only the Holy Spirit can bring.
                </p>
                <p>
                  This is more than an event page. It is becoming a catalog of
                  what God has done through Shalom and a simple invitation into
                  what He is doing next.
                </p>
              </div>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Button asChild size="lg" className="w-full max-w-xs rounded-none uppercase tracking-wider sm:w-auto">
                  <a href={currentConference.registrationUrl} target="_blank" rel="noreferrer">
                    Register for 2026 <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full max-w-xs rounded-none border-white/20 uppercase tracking-wider sm:w-auto"
                >
                  <Link href="/archive">
                    View Archive <ArrowRight className="h-5 w-5" />
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
