import { useRef } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

const HERO_PHOTOS = [
  "/images/home/shalom-2026-prayer-1.jpg",
  "/images/home/shalom-2026-prayer-middle.jpg",
  "/images/home/shalom-2026-prayer-3.jpg",
];

function ScrollPage({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 30 });
  const rotateX = useTransform(progress, [0, 0.3, 0.42, 0.65, 1], [18, 4, 0, 0, -16]);
  const scale = useTransform(progress, [0, 0.35, 0.65, 1], [0.94, 1, 1, 0.96]);
  const foldOpacity = useTransform(progress, [0, 0.35, 0.65, 1], [0.65, 0, 0, 0.55]);

  return (
    <div ref={ref} className="home-scroll-chapter" data-testid="scroll-page">
      <motion.div className="home-scroll-page" style={{ rotateX: enabled ? rotateX : 0, scale: enabled ? scale : 1 }}>
        {children}
        <motion.div aria-hidden="true" className="home-page-fold" style={{ opacity: enabled ? foldOpacity : 0 }} />
      </motion.div>
    </div>
  );
}

export default function Home() {
  // framer's hook tracks prefers-reduced-motion and updates live.
  const prefersReducedMotion = useReducedMotion() ?? false;
  const motionEnabled = !prefersReducedMotion;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="home-scroll-story">
      <ScrollPage enabled={motionEnabled}>
      <section
        aria-label="Shalom conference"
        className="home-hero relative isolate min-h-[min(640px,calc(100svh-76px))] overflow-hidden bg-black lg:min-h-[min(600px,calc(100svh-76px))] 2xl:min-h-[min(680px,calc(100svh-76px))]"
      >
        <h1 className="sr-only">Shalom Youth Conference</h1>
        <div className="absolute inset-0 lg:hidden">
          <img
            src={HERO_PHOTOS[0]}
            alt="A worshipper praying at Shalom Conference"
            className="h-full w-full object-cover object-center"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 hidden grid-cols-3 gap-px bg-white/20 lg:grid">
          {HERO_PHOTOS.map((photo, index) => (
            <div key={photo} className="relative overflow-hidden bg-black">
              <img
                src={photo}
                alt={[
                  "A worshipper praying at Shalom Conference",
                  "A worship leader at Shalom Conference",
                  "Congregants praying together at Shalom Conference",
                ][index]}
                className="h-full w-full object-cover object-center"
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            </div>
          ))}
        </div>
      </section>

      </ScrollPage>

      <ScrollPage enabled={motionEnabled}>
        <section id="about-shalom" className="bg-background px-4 py-20 sm:px-6 sm:py-28">
          <FadeIn className="container mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <h2
                className="text-5xl font-bold uppercase leading-[0.9] tracking-tight text-ink sm:text-7xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What is Shalom?
              </h2>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xl font-medium leading-relaxed text-ink sm:text-2xl">
                Shalom is an annual conference for students and young adults,
                hosted by Reveille, the youth ministry of RCCG Higher Ground
                Assembly in Windsor Mill, Maryland.
              </p>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                At its heart, Shalom is a space to worship without distraction,
                pray for one another, and make room for the Holy Spirit to do
                what only He can do.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 font-bold uppercase tracking-widest"
                >
                  <Link href="/about">
                    Learn about Shalom <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-ink/20 px-8 font-bold uppercase tracking-widest"
                >
                  <Link href="/archive">Past conferences</Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </section>
      </ScrollPage>
      </main>

      <ScrollPage enabled={motionEnabled}>
        <SiteFooter />
      </ScrollPage>
    </div>
  );
}
