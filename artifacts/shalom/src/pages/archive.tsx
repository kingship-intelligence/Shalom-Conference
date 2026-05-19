import { Link } from "wouter";
import shalomLogo from "@assets/logo_1778697155106.png";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { archivedConferences } from "@/data/conferences";
import { Button } from "@/components/ui/button";

export default function Archive() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 px-6 py-5">
        <nav className="container mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={shalomLogo} alt="SHALOM" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            <Link href="/2026" className="hover:text-primary">
              2026
            </Link>
            <Link href="/about" className="hover:text-primary">
              About
            </Link>
            <Link href="/partner" className="hover:text-primary">
              Partner
            </Link>
            <Link href="/archive" className="text-primary">
              Archive
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="px-6 py-24">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-16 max-w-3xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-primary">
                Conference Archive
              </p>
              <h1 className="mb-6 text-5xl font-black uppercase tracking-tighter text-white md:text-7xl">
                Previous Shalom Gatherings
              </h1>
              <p className="text-xl leading-relaxed text-muted-foreground">
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
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="mb-2 font-mono text-sm uppercase tracking-widest text-primary">
                        {conference.year}
                      </p>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                        {conference.theme}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-6 p-8">
                    <p className="text-lg text-muted-foreground">{conference.summary}</p>
                    <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{conference.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{conference.location}</span>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-none border-white/20 uppercase tracking-wider"
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
