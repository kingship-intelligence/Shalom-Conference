import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function Shop() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex flex-1 items-center px-4 py-24 sm:px-6">
        <section className="container mx-auto max-w-4xl text-center">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Shalom Shop
          </p>
          <h1
            className="text-6xl font-black uppercase leading-none tracking-tighter text-white sm:text-8xl md:text-9xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Coming Soon
          </h1>
          <div className="mx-auto my-8 h-px w-20 bg-primary" />
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Shalom merchandise is on the way. Check back soon for updates.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}