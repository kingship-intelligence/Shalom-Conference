import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function RegistrationClosed() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex flex-1 items-center px-4 py-24 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <p className="mt-6 font-mono text-sm uppercase tracking-widest text-primary">
            Shalom 2026 has concluded
          </p>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-tighter text-ink sm:text-6xl">
            Registration is closed
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Thank you to everyone who joined us for The Comforter. Explore the
            2026 conference page or revisit previous Shalom gatherings.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full uppercase tracking-wider">
              <Link href="/2026">
                View Shalom 2026 <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-ink/20 uppercase tracking-wider"
            >
              <Link href="/archive">Past conferences</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
