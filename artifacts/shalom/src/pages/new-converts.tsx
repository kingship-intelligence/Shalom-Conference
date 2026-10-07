import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowRight, Heart, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const scriptures = [
  { title: "Saved by grace", reference: "Ephesians 2:8–9", text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast." },
  { title: "Loved by God", reference: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { title: "You belong to His family", reference: "John 1:12", text: "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:" },
];

export default function NewConverts() {
  const [state, setState] = useState<"idle" | "saving" | "success">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "saving") return;
    const data = new FormData(event.currentTarget);
    setState("saving");
    setError("");
    try {
      const response = await fetch("/api/new-converts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), email: data.get("email"), phone: data.get("phone"), city: data.get("city"), hasLocalChurch: data.get("hasLocalChurch") === "yes" ? true : data.get("hasLocalChurch") === "no" ? false : null, consentToContact: data.get("consent") === "on" }),
      });
      if (!response.ok) throw new Error("We couldn’t save your details. Please try again.");
      const result = await response.json();
      if (result.success !== true) throw new Error("We couldn’t save your details. Please try again.");
      setState("success");
    } catch {
      setError("We couldn’t save your details. Please try again, or email admin@shalomconference.com.");
      setState("idle");
    }
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-primary/5 px-6 py-14 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <Heart className="mx-auto mb-6 h-9 w-9 text-primary" aria-hidden="true" />
            <h1 className="text-4xl font-bold uppercase leading-[1.05] sm:text-7xl">Welcome to the<br /><span className="text-primary">family of God.</span></h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">If you’ve put your faith in Jesus, this is a beautiful new beginning. You are loved, you belong, and you don’t have to walk this journey alone.</p>
            <Button asChild className="mt-8 h-12 rounded-full px-7"><a href="#stay-connected">Let’s walk together <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
          </div>
        </section>
        <section aria-label="Promises from Scripture" className="mx-auto grid max-w-6xl gap-5 px-6 py-12 lg:grid-cols-3 lg:py-20">
          {scriptures.map((verse, index) => (
            <article key={verse.reference} className="rounded-2xl border border-border bg-card p-7 sm:p-8">
              <span className="font-mono text-sm text-primary" aria-hidden="true">0{index + 1}</span>
              <h2 className="mt-5 text-xl font-bold">{verse.title}</h2>
              <blockquote className="my-5 font-serif text-lg leading-relaxed text-foreground">“{verse.text}”</blockquote>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">{verse.reference} <span className="text-muted-foreground">· KJV</span></p>
            </article>
          ))}
        </section>
        <section id="stay-connected" className="scroll-mt-24 border-y border-border bg-card px-6 py-14 sm:py-20">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold uppercase sm:text-4xl">Your next step,<br /><span className="text-primary">together.</span></h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">We’d love to get to know you, pray with you, and help you grow in your faith. Share your details so the Shalom team can follow up with you.</p>
              <ol className="mt-8 space-y-5 text-sm leading-relaxed">
                <li><strong className="block text-base">Talk to God.</strong>You can pray in your own words. He hears you.</li>
                <li><strong className="block text-base">Start with the Gospel of John.</strong>Read a little each day and get to know Jesus.</li>
                <li><strong className="block text-base">Find community.</strong>Connect with other believers and a local church.</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
              {state === "success" ? (
                <div role="status" className="py-10 text-center">
                  <CheckCircle2 className="mx-auto mb-5 h-12 w-12 text-primary" aria-hidden="true" />
                  <h3 className="text-2xl font-bold">We’re glad you’re here.</h3>
                  <p className="mt-4 leading-relaxed text-muted-foreground">Your details have been saved for the Shalom follow-up team. Welcome to the family—we look forward to connecting with you.</p>
                  <Button asChild className="mt-7"><Link href="/">Back to Shalom</Link></Button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5" aria-label="New believers follow-up form">
                  <h3 className="text-xl font-bold">Let’s stay connected</h3>
                  <p className="text-sm text-muted-foreground">Name, email, and permission to contact you are required.</p>
                  <div><label htmlFor="convert-name" className="mb-2 block text-sm font-medium">Full name</label><Input id="convert-name" name="name" autoComplete="name" maxLength={120} required className="h-12" /></div>
                  <div><label htmlFor="convert-email" className="mb-2 block text-sm font-medium">Email address</label><Input id="convert-email" name="email" type="email" autoComplete="email" maxLength={254} required className="h-12" /></div>
                  <div><label htmlFor="convert-phone" className="mb-2 block text-sm font-medium">Phone number <span className="text-muted-foreground">(optional)</span></label><Input id="convert-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className="h-12" /></div>
                  <div><label htmlFor="convert-city" className="mb-2 block text-sm font-medium">City / town <span className="text-muted-foreground">(optional)</span></label><Input id="convert-city" name="city" autoComplete="address-level2" maxLength={120} className="h-12" /></div>
                  <div>
                    <label htmlFor="convert-local-church" className="mb-2 block text-sm font-medium">Do you already have a local church? <span className="text-muted-foreground">(optional)</span></label>
                    <select id="convert-local-church" name="hasLocalChurch" defaultValue="" className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select an answer</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"><input name="consent" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-primary)]" /><span>I agree that the Shalom team may contact me by email or the phone number I provide to support me in my faith journey.</span></label>
                  <p className="text-xs leading-relaxed text-muted-foreground">Your details are for the Shalom follow-up team. Read our <Link href="/privacy" className="underline underline-offset-4">privacy policy</Link>.</p>
                  {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                  <Button type="submit" disabled={state === "saving"} className="h-12 w-full rounded-full">{state === "saving" ? "Saving your details…" : "Connect with the team"}</Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
