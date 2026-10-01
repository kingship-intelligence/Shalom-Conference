import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex flex-1 items-center px-4 py-24 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-primary">404</p>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-tighter text-ink sm:text-6xl">
            That page isn't here
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            The link may be old, or something got mistyped. Everything you need is one click
            away.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full uppercase tracking-wider">
              <Link href="/">
                Home <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-ink/20 uppercase tracking-wider"
            >
              <Link href="/register">Register for Shalom</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
