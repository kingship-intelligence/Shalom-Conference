import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CalendarDays, Check, CheckCircle2, Clock3 } from "lucide-react";
import { motion } from "framer-motion";
import { useCreatePrayerChainSignup } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { useToast } from "@/hooks/use-toast";
const prayerChargeFlyer = "/images/2026/prayer-charge.webp";

const PRAYER_CHAIN_SLOTS = [
  { value: "00:00", label: "12 AM – 1 AM" },
  { value: "01:00", label: "1 AM – 2 AM" },
  { value: "02:00", label: "2 AM – 3 AM" },
  { value: "03:00", label: "3 AM – 4 AM" },
  { value: "04:00", label: "4 AM – 5 AM" },
  { value: "05:00", label: "5 AM – 6 AM" },
  { value: "06:00", label: "6 AM – 7 AM" },
  { value: "07:00", label: "7 AM – 8 AM" },
  { value: "08:00", label: "8 AM – 9 AM" },
  { value: "09:00", label: "9 AM – 10 AM" },
  { value: "10:00", label: "10 AM – 11 AM" },
  { value: "11:00", label: "11 AM – 12 PM" },
] as const;

function upsertMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export default function PrayerCharge() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const createSignup = useCreatePrayerChainSignup();

  useEffect(() => {
    const title = "Prayer Charge | Shalom Conference";
    const description =
      "Join Shalom for a 12-hour prayer charge on September 26, 2026, as we spiritually prepare for Shalom Conference 2026.";

    document.title = title;
    upsertMeta("description", description);
    upsertProperty("og:title", title);
    upsertProperty("og:description", description);
    upsertProperty("og:type", "website");

    return () => {
      document.title = "Shalom Conference";
    };
  }, []);

  function toggleSlot(value: string) {
    setSelectedSlots((current) =>
      current.includes(value)
        ? current.filter((slot) => slot !== value)
        : PRAYER_CHAIN_SLOTS
            .map((slot) => slot.value)
            .filter((slot) => [...current, value].includes(slot)),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedSlots.length === 0) {
      toast({
        title: "Choose a time",
        description: "Select at least one hour when you can join the prayer chain.",
        variant: "destructive",
      });
      return;
    }

    createSignup.mutate(
      {
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          timeSlots: selectedSlots as Array<(typeof PRAYER_CHAIN_SLOTS)[number]["value"]>,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setName("");
          setEmail("");
          setPhone("");
        },
        onError: (error: any) => {
          toast({
            title: "Unable to save your time",
            description: error.data?.error || "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,hsl(var(--primary)/0.16),transparent_34%),radial-gradient(circle_at_82%_70%,hsl(var(--secondary)/0.12),transparent_32%)]" />

          <div className="container relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="order-2 text-center lg:order-1 lg:text-left"
            >
              <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-7xl">
                Prayer
                <span className="block text-primary">Charge</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65 lg:mx-0">
                Before we gather for Shalom Conference 2026, we gather in prayer.
                Join us for twelve intentional hours of seeking God together.
              </p>

              <div className="mt-8 grid gap-3 text-left sm:grid-cols-2 lg:max-w-lg">
                <div className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-4">
                  <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/45">Date</p>
                    <p className="mt-1 font-semibold text-white">September 26, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-4">
                  <Clock3 className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/45">Time</p>
                    <p className="mt-1 font-semibold text-white">12 AM – 12 PM</p>
                  </div>
                </div>
              </div>

              <Button
                asChild
                className="mt-8 h-12 rounded-full bg-primary px-7 font-bold uppercase tracking-widest text-white hover:bg-primary/90"
              >
                <Link href="/2026">
                  See Shalom 2026
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="order-1 mx-auto w-full max-w-md lg:order-2"
            >
              <img
                src={prayerChargeFlyer}
                alt="12-Hour Prayer Charge, September 26, 2026, from 12 AM to 12 PM"
                className="h-auto w-full shadow-2xl shadow-black/40"
              />
            </motion.div>
          </div>
        </section>

        <section id="prayer-chain-signup" className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
                September 26, 2026
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase leading-tight text-white sm:text-5xl">
                Join the prayer chain
              </h2>
              <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
                Choose one or more hours when you can pray with us between midnight and noon.
                Your availability helps us build continuous prayer coverage for all twelve hours.
              </p>
              <div className="mt-8 border-l-2 border-primary pl-5">
                <p className="text-sm font-bold uppercase tracking-widest text-white">
                  Select every hour that works for you
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  The Shalom team will use your contact information only to coordinate the Prayer Charge.
                </p>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.035] p-5 sm:p-8">
              {submitted ? (
                <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <h3 className="mt-6 text-3xl font-bold text-white">You’re on the prayer chain.</h3>
                  <p className="mt-3 max-w-md text-white/55">
                    Thank you for committing time to pray with us on September 26.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setSelectedSlots([]);
                    }}
                    className="mt-8 rounded-full border-white/20 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
                  >
                    Add another signup
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="prayer-name" className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">
                        Full name
                      </label>
                      <Input
                        id="prayer-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        maxLength={160}
                        autoComplete="name"
                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/25"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="prayer-email" className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">
                        Email
                      </label>
                      <Input
                        id="prayer-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        autoComplete="email"
                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/25"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="prayer-phone" className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">
                        Phone
                      </label>
                      <Input
                        id="prayer-phone"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        required
                        minLength={7}
                        maxLength={40}
                        autoComplete="tel"
                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-white/25"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  <fieldset>
                    <legend className="text-xs font-bold uppercase tracking-widest text-white/50">
                      Available prayer times
                    </legend>
                    <p className="mt-2 text-sm text-white/35">Select one or more one-hour slots.</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {PRAYER_CHAIN_SLOTS.map((slot) => {
                        const selected = selectedSlots.includes(slot.value);
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleSlot(slot.value)}
                            className={`flex min-h-14 items-center justify-between border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                              selected
                                ? "border-primary bg-primary text-white"
                                : "border-white/10 bg-white/[0.025] text-white/65 hover:border-primary/50 hover:text-white"
                            }`}
                          >
                            <span>{slot.label}</span>
                            {selected && <Check className="h-4 w-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <Button
                    type="submit"
                    disabled={createSignup.isPending}
                    className="h-14 w-full rounded-full bg-primary text-base font-bold uppercase tracking-widest text-white hover:bg-primary/90"
                  >
                    {createSignup.isPending ? "Saving your time…" : `Join ${selectedSlots.length || ""} ${selectedSlots.length === 1 ? "hour" : "hours"}`.trim()}
                  </Button>
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