import { Link } from "wouter";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { archivedConferences } from "@/data/conferences";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";

export default function Archive() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="container mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16 md:mx-0 md:text-left">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary sm:text-sm sm:tracking-[0.35em]">
                Conference Archive
              </p>
              <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl md:text-7xl">
                Previous Shalom Gatherings
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Explore the themes, moments, and stories from past Shalom
                conferences as the movement continues year after year.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {archivedConferences.map((conference) => (
                <article
                  key={conference.year}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-card"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={conference.image}
                      alt={`${conference.year} ${conference.theme}`}
                      className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-center sm:bottom-6 sm:left-6 sm:right-6 sm:text-left">
                      <p className="mb-2 font-mono text-sm uppercase tracking-widest text-primary">
                        {conference.year}
                      </p>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                        {conference.theme}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-6 p-6 text-center sm:p-8 sm:text-left">
                    <p className="text-base text-muted-foreground sm:text-lg">{conference.summary}</p>
                    <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{conference.date}</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{conference.location}</span>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full max-w-xs rounded-none border-white/20 uppercase tracking-wider sm:w-auto"
                    >
                      <Link href={`/archive/${conference.year}`}>
                        View Archive <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
