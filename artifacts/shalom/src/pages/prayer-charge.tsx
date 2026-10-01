import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  useCreatePrayerChargeSurveyResponse,
} from "@workspace/api-client-react";
import thankYouArtwork from "@assets/B7342044-B25D-43CA-A29D-7DACA0E28D48_1790469794325.PNG?url";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

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

const ATTENDANCE_OPTIONS = [
  { value: "yes", label: "Yes, gladly" },
  { value: "maybe", label: "I’m not sure yet" },
  { value: "no", label: "Not this time" },
] as const;

type AttendanceChoice = (typeof ATTENDANCE_OPTIONS)[number]["value"];

type SurveyFormValues = {
  rating: number | null;
  meaningfulMoment: string;
  suggestion: string;
  wouldAttendAgain: AttendanceChoice | "";
};

const CELEBRATION_PARTICLES = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * Math.PI * 2;
  const distance = 72 + (index % 4) * 17;
  const colors = ["#ff5a1f", "#f7be51", "#ffffff", "#c92d22", "#f18a33"];

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.72,
    rotation: 180 + index * 41,
    color: colors[index % colors.length],
  };
});

export default function PrayerCharge() {
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [countdownHours, setCountdownHours] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const form = useForm<SurveyFormValues>({
    defaultValues: {
      rating: null,
      meaningfulMoment: "",
      suggestion: "",
      wouldAttendAgain: "",
    },
  });
  const createSurvey = useCreatePrayerChargeSurveyResponse({
    request: { credentials: "include" },
  });
  const meaningfulMoment = form.watch("meaningfulMoment");
  const suggestion = form.watch("suggestion");

  useEffect(() => {
    let confettiTimeout: number | undefined;

    if (prefersReducedMotion) {
      setCountdownHours(12);
      setShowConfetti(true);
      confettiTimeout = window.setTimeout(() => setShowConfetti(false), 1900);

      return () => {
        if (confettiTimeout !== undefined) {
          window.clearTimeout(confettiTimeout);
        }
      };
    }

    let currentHour = 0;
    const countdownInterval = window.setInterval(() => {
      currentHour += 1;
      setCountdownHours(currentHour);

      if (currentHour === 12) {
        window.clearInterval(countdownInterval);
        setShowConfetti(true);
        confettiTimeout = window.setTimeout(() => setShowConfetti(false), 1900);
      }
    }, 170);

    return () => {
      window.clearInterval(countdownInterval);
      if (confettiTimeout !== undefined) {
        window.clearTimeout(confettiTimeout);
      }
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const title = "Thank You for Joining the Prayer Charge | Shalom Conference";
    const description =
      "Thank you for sharing the Prayer Charge with the Shalom Conference community.";
    document.title = title;
    upsertMeta("description", description);
    upsertProperty("og:title", title);
    upsertProperty("og:description", description);
    upsertProperty("og:type", "website");

    return () => {
      document.title = "Shalom Conference";
    };
  }, []);

  function handleSubmit(values: SurveyFormValues) {
    setFormError("");

    if (values.rating === null || values.wouldAttendAgain === "") {
      setFormError(
        "Please share a rating and let us know if you would join us again.",
      );
      return;
    }

    createSurvey.mutate(
      {
        data: {
          rating: values.rating,
          meaningfulMoment: values.meaningfulMoment.trim(),
          suggestion: values.suggestion.trim(),
          wouldAttendAgain: values.wouldAttendAgain,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setFormError("");
        },
        onError: (error: any) => {
          setFormError(
            error?.data?.error ||
              "We could not save your response just now. Your answers are still here; please try sending them again.",
          );
        },
      },
    );
  }

  function resetForm() {
    setSubmitted(false);
    form.reset();
    setFormError("");
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="relative border-b border-ink/10 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,hsl(var(--primary)/0.2),transparent_31%),radial-gradient(circle_at_88%_30%,hsl(var(--secondary)/0.13),transparent_28%)]" />
          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.82fr] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <h1 className="max-w-2xl text-5xl font-black uppercase leading-[0.92] tracking-tight text-ink sm:text-7xl">
                Thank you for
                <span className="block text-primary">praying with us.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-copy-65 sm:text-xl">
                The Prayer Charge was made meaningful by every voice, every
                quiet moment, and every heart that showed up. We are grateful
                you were part of it.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-12 rounded-full bg-primary px-7 font-bold uppercase tracking-widest text-white hover:bg-primary/90"
                  data-testid="button-share-feedback"
                >
                  <a href="#share-feedback">Share your reflection</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-ink/20 bg-transparent px-7 font-bold uppercase tracking-widest text-ink hover:bg-ink/10 hover:text-ink"
                  data-testid="link-see-2026"
                >
                  <Link href="/2026">Visit Shalom 2026</Link>
                </Button>
              </div>
              <div className="mt-12 max-w-lg border-t border-ink/10 pt-5">
                <div
                  className="relative isolate border border-primary/25 bg-ink/[0.035] p-5 sm:p-6"
                  data-testid="status-prayer-charge-countdown"
                >
                  {showConfetti && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-20 overflow-visible"
                    >
                      {CELEBRATION_PARTICLES.map((particle, index) => (
                        <motion.span
                          key={`celebration-${index}`}
                          className="absolute left-[24%] top-[36%] h-2.5 w-1.5 rounded-[1px]"
                          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
                          animate={{
                            opacity: prefersReducedMotion ? 0.85 : [0, 1, 1, 0],
                            x: prefersReducedMotion ? particle.x * 0.6 : particle.x,
                            y: prefersReducedMotion ? particle.y * 0.6 : particle.y,
                            rotate: particle.rotation,
                          }}
                          transition={{
                            duration: prefersReducedMotion ? 0 : 1.4,
                            delay: prefersReducedMotion ? 0 : index * 0.008,
                            ease: "easeOut",
                          }}
                          style={{ backgroundColor: particle.color }}
                        />
                      ))}
                    </div>
                  )}
                  <div className="relative z-10">
                    <div className="flex items-baseline gap-3">
                      <motion.span
                        key={countdownHours}
                        initial={{ opacity: 0.5, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.14 }}
                        className="text-5xl font-black tabular-nums text-ink sm:text-6xl"
                      >
                        {countdownHours}
                      </motion.span>
                      <span className="text-sm font-bold uppercase tracking-widest text-primary">
                        {countdownHours === 1 ? "hour" : "hours"}
                      </span>
                      <span className="ml-auto text-xs uppercase tracking-widest text-copy-50">
                        of prayer and worship
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label="Prayer Charge hours"
                      aria-valuemin={0}
                      aria-valuemax={12}
                      aria-valuenow={countdownHours}
                      className="mt-5 h-2 overflow-hidden bg-ink/10"
                    >
                      <motion.div
                        className="h-full bg-primary"
                        animate={{ width: `${(countdownHours / 12) * 100}%` }}
                        transition={{ duration: 0.16, ease: "linear" }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-semibold tabular-nums text-copy-40">
                      <span>0</span>
                      <span>12</span>
                    </div>
                    {countdownHours === 12 && (
                      <span role="status" className="sr-only">
                        The 12-hour prayer celebration is complete.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="order-1 mx-auto w-full max-w-[430px] lg:order-2"
            >
              <div className="relative">
                <div className="absolute -inset-3 -z-10 bg-primary/10 blur-2xl" />
                <img
                  src={thankYouArtwork}
                  alt="Thank you message from the Shalom Conference team to Prayer Charge guests"
                  className="h-auto w-full border border-ink/15 shadow-2xl shadow-black/40"
                  data-testid="img-prayer-charge-thank-you"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="prayer-charge-video"
          aria-labelledby="prayer-charge-video-heading"
          className="border-b border-ink/10 px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <h2
              id="prayer-charge-video-heading"
              className="text-3xl font-black uppercase leading-tight text-ink sm:text-4xl"
            >
              Watch the Prayer Charge
            </h2>
            <div className="relative mt-8 aspect-video overflow-hidden border border-ink/10 bg-black shadow-2xl shadow-black/30">
              <iframe
                src="https://www.youtube-nocookie.com/embed/ElvIbJXp9Ls"
                title="Shalom Prayer Charge recording"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full"
                data-testid="video-prayer-charge"
              />
            </div>
            <a
              href="https://www.youtube.com/watch?v=ElvIbJXp9Ls"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
              data-testid="link-watch-prayer-charge-youtube"
            >
              Open video on YouTube
            </a>
          </div>
        </section>

        <section
          id="share-feedback"
          className="scroll-mt-8 px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div className="lg:pt-5">
              <h2 className="text-4xl font-black uppercase leading-tight text-ink sm:text-5xl">
                Help us carry it forward.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
                Your anonymous response helps the Shalom team listen well and
                make space for more prayer, worship, and welcome at the next
                gathering.
              </p>
              <div className="mt-8 border-l-2 border-primary pl-5">
                <p className="text-sm font-bold uppercase tracking-widest text-ink">
                  This takes about two minutes
                </p>
                <p className="mt-2 text-sm leading-relaxed text-copy-45">
                  No name or contact information is requested.
                </p>
              </div>
            </div>

            <div className="border border-ink/10 bg-ink/[0.035] p-5 sm:p-9">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex min-h-[520px] flex-col items-center justify-center text-center"
                  data-testid="status-survey-thank-you"
                >
                  <h3 className="text-3xl font-bold text-ink">
                    Thank you for sharing.
                  </h3>
                  <p className="mt-3 max-w-md leading-relaxed text-copy-55">
                    We are grateful for your honesty and for the part you
                    played in making the Prayer Charge a day of seeking God
                    together.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="mt-8 rounded-full border-ink/20 bg-transparent px-7 text-ink hover:bg-ink/10 hover:text-ink"
                    data-testid="button-submit-another-survey"
                  >
                    Share another response
                  </Button>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-9"
                    noValidate
                  >
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold uppercase tracking-widest text-ink">
                            How would you rate the Prayer Charge?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value === null ? "" : String(field.value)}
                              onValueChange={(value) => {
                                field.onChange(Number(value));
                                setFormError("");
                              }}
                              className="mt-4 grid grid-cols-5 gap-2 sm:max-w-md"
                              aria-label="Prayer Charge rating"
                            >
                              {[1, 2, 3, 4, 5].map((value) => (
                                <div key={value}>
                                  <RadioGroupItem
                                    id={`prayer-charge-rating-${value}`}
                                    value={String(value)}
                                    className="peer sr-only"
                                    data-testid={`button-rating-${value}`}
                                  />
                                  <label
                                    htmlFor={`prayer-charge-rating-${value}`}
                                    className="flex h-14 cursor-pointer items-center justify-center border border-ink/10 bg-ink/[0.025] text-lg font-bold text-copy-55 transition-colors hover:border-primary/60 hover:text-ink peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary"
                                  >
                                    {value}
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <div className="flex max-w-md justify-between text-[11px] uppercase tracking-wider text-copy-35">
                            <span>Needs work</span>
                            <span>Life-giving</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meaningfulMoment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold uppercase tracking-widest text-ink">
                            What moment stayed with you?
                            <span className="text-xs font-normal normal-case tracking-normal text-copy-35">
                              Optional
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              maxLength={1200}
                              rows={4}
                              placeholder="A song, a prayer, a conversation, or a quiet moment..."
                              className="mt-2 w-full resize-y border-ink/10 bg-ink/5 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-copy-25 focus:border-primary focus:ring-primary"
                              data-testid="textarea-meaningful-moment"
                            />
                          </FormControl>
                          <p className="text-right text-xs text-copy-35">
                            {meaningfulMoment.length}/1200
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="suggestion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold uppercase tracking-widest text-ink">
                            Is there anything you would love to see next time?
                            <span className="ml-2 text-xs font-normal normal-case tracking-normal text-copy-35">
                              Optional
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              maxLength={1200}
                              rows={3}
                              placeholder="Tell us what would serve you and the community well..."
                              className="mt-2 w-full resize-y border-ink/10 bg-ink/5 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-copy-25 focus:border-primary focus:ring-primary"
                              data-testid="textarea-suggestion"
                            />
                          </FormControl>
                          <p className="text-right text-xs text-copy-35">
                            {suggestion.length}/1200
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wouldAttendAgain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold uppercase tracking-widest text-ink">
                            Would you attend another Prayer Charge?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setFormError("");
                              }}
                              className="mt-2 grid gap-2 sm:grid-cols-3"
                              aria-label="Would you attend another Prayer Charge?"
                            >
                              {ATTENDANCE_OPTIONS.map((option) => (
                                <div key={option.value}>
                                  <RadioGroupItem
                                    id={`attend-again-${option.value}`}
                                    value={option.value}
                                    className="peer sr-only"
                                    data-testid={`button-attend-again-${option.value}`}
                                  />
                                  <label
                                    htmlFor={`attend-again-${option.value}`}
                                    className="flex min-h-12 cursor-pointer items-center border border-ink/10 bg-ink/[0.025] px-3 py-3 text-left text-sm font-semibold text-copy-65 transition-colors hover:border-primary/60 hover:text-ink peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {formError && (
                      <div
                        className="border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm leading-relaxed text-red-700 dark:text-red-200"
                        role="alert"
                        data-testid="status-survey-error"
                      >
                        {formError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={createSurvey.isPending}
                      className="h-14 w-full rounded-full bg-primary text-base font-bold uppercase tracking-widest text-white hover:bg-primary/90"
                      data-testid="button-submit-survey"
                    >
                      {createSurvey.isPending ? (
                        "Sending your response"
                      ) : (
                        "Send anonymous response"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}