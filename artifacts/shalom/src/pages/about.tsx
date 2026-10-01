import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { currentConference } from "@/data/conferences";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="px-4 py-20 text-center sm:px-6 sm:py-24 sm:text-left">
          <div className="container mx-auto max-w-6xl">
            <h1 className="mb-8 text-4xl font-black uppercase leading-none tracking-tighter text-ink sm:text-6xl md:text-8xl">
              What is Shalom?
            </h1>
            <p className="mx-auto max-w-4xl text-lg font-light leading-relaxed text-muted-foreground sm:mx-0 sm:text-2xl">
              Shalom is a yearly conference for students and young adults, put on by
              Reveille, the youth ministry of RCCG Higher Ground Assembly in Windsor Mill,
              Maryland.
            </p>
            <p className="mx-auto mt-6 max-w-4xl text-lg font-light leading-relaxed text-muted-foreground sm:mx-0 sm:text-2xl">
              The early years were a single night of worship, and that is still the heart of
              it. We come to worship without distraction, to pray for each other, and to make
              room for the Holy Spirit to do what only He can do.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="container mx-auto max-w-7xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ink/10 bg-card sm:aspect-video md:aspect-[21/9]">
              <img
                src="/images/home/shalom-about-worship.png"
                alt="Young people worshipping at a Shalom conference"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center lg:text-left">
              <h2 className="mb-8 text-3xl font-black uppercase tracking-tighter text-ink sm:text-4xl md:text-6xl">
                This year: The Comforter
              </h2>
              <div className="space-y-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                <p>
                  The theme for {currentConference.year} comes from {currentConference.scripture}, where
                  Jesus promises His friends that the Father will send the Holy Spirit to teach them,
                  remind them, and leave them with a peace the world can't give.
                </p>
                <p>
                  That's what we're praying for over these two nights. If you've been carrying
                  something heavy, this is a good place to set it down.
                </p>
              </div>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="w-full max-w-xs rounded-full uppercase tracking-wider sm:w-auto"
                >
                  <Link href="/register">
                    Register for {currentConference.year} <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full max-w-xs rounded-full border-ink/20 uppercase tracking-wider sm:w-auto"
                >
                  <Link href="/archive">
                    Past years <ArrowRight className="h-5 w-5" />
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
