import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
const prayerChargeFlyer = "/images/2026/prayer-charge.webp";

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

        <section className="px-4 py-16 text-center sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Preparing the way for Shalom 2026.
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Prayer Charge is a lead-up gathering for the same Shalom Conference
              community and theme. Come ready to pray, worship, and make room for
              what God wants to do.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}