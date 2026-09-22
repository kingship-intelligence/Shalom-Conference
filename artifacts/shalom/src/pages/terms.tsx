import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function Terms() {
  useEffect(() => {
    const previousTitle = document.title;
    const description =
      "Terms & Conditions for Shalom Youth Conference, including registration, communications, and SMS Terms.";
    document.title = "Terms & Conditions | Shalom Youth Conference";

    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
              <p className="text-xs font-bold uppercase tracking-[0.28em]">Legal information</p>
            </div>
            <h1 className="mt-5 text-5xl font-black uppercase tracking-tight text-white sm:text-7xl">
              Terms &amp; Conditions
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              These terms govern your use of the Shalom Youth Conference website,
              conference registration, and optional communications.
            </p>
            <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-white/35">
              Effective September 22, 2026
            </p>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-4xl gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-primary/25 bg-primary/5 p-5">
                <MessageSquare className="h-5 w-5 text-primary" />
                <p className="mt-3 font-bold text-white">SMS consent is optional</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  You can register for the conference without opting in to text updates.
                </p>
              </div>
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="mt-3 font-bold text-white">Your choice matters</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  Reply STOP at any time to unsubscribe from SMS updates.
                </p>
              </div>
            </div>

            <article className="mt-4 space-y-10 border border-white/10 bg-white/[0.025] p-6 sm:p-10">
              <section className="border-b border-white/10 pb-10">
                <h2 className="text-2xl font-bold text-white">Using this website</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-white/60">
                  <p>
                    By using this website or submitting a registration, you agree
                    to these Terms &amp; Conditions and our{" "}
                    <Link href="/privacy" className="font-semibold text-primary underline underline-offset-4">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <p>
                    The website and its content are provided for information,
                    registration, event coordination, and related Shalom Youth
                    Conference activities. Please provide accurate information and
                    use the website lawfully and respectfully.
                  </p>
                </div>
              </section>

              <section className="border-b border-white/10 pb-10">
                <h2 className="text-2xl font-bold text-white">Conference registration</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-white/60">
                  <p>
                    Registration information is used to coordinate attendance,
                    volunteers, badges, confirmations, and event updates. A
                    registration is not complete until the website confirms it.
                  </p>
                  <p>
                    Conference details, schedules, locations, and availability may
                    change. We will use reasonable efforts to communicate material
                    updates to registered attendees.
                  </p>
                </div>
              </section>

              <section className="border-b border-white/10 pb-10">
                <h2 className="text-2xl font-bold text-white">SMS Terms</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-white/60">
                  <p>
                    By checking the SMS opt-in box during registration, you agree
                    to receive recurring automated text messages from the
                    registered Brand name <strong className="text-white">Shalom Youth Conference</strong>{" "}
                    at the mobile number you provide. These messages may include
                    conference updates, reminders, schedule information, and related
                    event communications.
                  </p>
                  <p>
                    Message frequency varies. <strong className="text-white">Message and data rates may apply.</strong>{" "}
                    Consent is not a condition of registration, attendance,
                    participation, donating, or making a purchase.
                  </p>
                  <p>
                    Reply <strong className="text-white">STOP</strong> to unsubscribe
                    from SMS updates. Reply <strong className="text-white">HELP</strong>{" "}
                    for help. After you send STOP, you may receive one final
                    message confirming your request. For questions, contact{" "}
                    <a
                      href="mailto:admin@shalomconference.com"
                      className="font-semibold text-primary underline underline-offset-4"
                    >
                      admin@shalomconference.com
                    </a>
                    .
                  </p>
                  <p>
                    You represent that you are authorized to use the mobile number
                    provided. We do not sell mobile information or share mobile
                    information with third parties or affiliates for their own
                    marketing or promotional purposes. Required registration
                    correspondence is handled separately from this optional SMS
                    program.
                  </p>
                </div>
              </section>

              <section className="border-b border-white/10 pb-10">
                <h2 className="text-2xl font-bold text-white">Communications and privacy</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-white/60">
                  <p>
                    Email and SMS updates are provided according to the choices you
                    make. You can review how information is collected, used, and
                    protected in our{" "}
                    <Link href="/privacy" className="font-semibold text-primary underline underline-offset-4">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white">Contact</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-white/60">
                  <p>
                    Questions about these Terms &amp; Conditions may be sent to{" "}
                    <a
                      href="mailto:admin@shalomconference.com"
                      className="font-semibold text-primary underline underline-offset-4"
                    >
                      admin@shalomconference.com
                    </a>
                    .
                  </p>
                </div>
              </section>
            </article>

            <Button
              asChild
              variant="outline"
              className="mt-2 w-fit rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return home
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}