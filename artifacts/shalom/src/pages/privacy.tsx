import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Bell, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const sections = [
  {
    title: "Information we collect",
    content: (
      <>
        <p>We may collect information you provide when you:</p>
        <ul>
          <li>register for a Shalom conference or volunteer opportunity;</li>
          <li>join the Prayer Chain and select prayer times;</li>
          <li>submit a testimony, contact request, or partnership inquiry;</li>
          <li>place a merchandise preorder or provide a payment reference; or</li>
          <li>choose to receive email or text-message alerts.</li>
        </ul>
        <p>
          This information may include your name, email address, phone number,
          event selections, volunteer interests, prayer availability, order
          details, payment-reference information, and messages you send us. We
          do not collect payment-card numbers through this website.
        </p>
      </>
    ),
  },
  {
    title: "How we use information",
    content: (
      <>
        <p>We use personal information to:</p>
        <ul>
          <li>process registrations, Prayer Chain commitments, and merchandise preorders;</li>
          <li>send confirmations, reminders, schedule details, and event updates;</li>
          <li>coordinate volunteers and respond to questions;</li>
          <li>verify payments and maintain administrative records;</li>
          <li>protect the website, prevent misuse, and comply with legal obligations; and</li>
          <li>improve Shalom Conference programs and communications.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Email and text alert opt-in",
    content: (
      <>
        <p>
          We send promotional or recurring alerts only when you affirmatively
          choose to receive them. Providing a phone number or email address for
          registration, Prayer Chain coordination, or an order does not by
          itself enroll you in promotional alerts.
        </p>
        <p>
          If you opt in to text alerts, message frequency may vary. Message and
          data rates may apply. Consent is not a condition of registering,
          participating, donating, or making a purchase. You may opt out of
          texts at any time by replying <strong>STOP</strong>. Reply{" "}
          <strong>HELP</strong> for assistance. You may unsubscribe from
          marketing emails using the unsubscribe link in the message or by
          contacting us.
        </p>
        <p>
          We may still send non-promotional messages that are necessary to
          complete a request you made, such as registration confirmations,
          Prayer Chain schedules, order updates, or direct responses.
        </p>
      </>
    ),
  },
  {
    title: "When we share information",
    content: (
      <>
        <p>
          We do not sell personal information. We may share limited information
          with service providers that help us operate the website, deliver
          communications, store data, process requests, or protect our systems.
          They may use the information only to provide those services to us.
        </p>
        <p>
          We may also disclose information when required by law, to protect
          safety or rights, or as part of an organizational transition. Mobile
          opt-in data and consent will not be shared with third parties for
          their own marketing purposes.
        </p>
      </>
    ),
  },
  {
    title: "Cookies, security, and retention",
    content: (
      <>
        <p>
          The website may use essential cookies or similar technology for
          security, administrative sign-in, and basic site operation. We use
          reasonable safeguards to protect information, but no online system
          can be guaranteed completely secure.
        </p>
        <p>
          We retain information only as long as reasonably needed for the
          purposes described here, including event administration, accounting,
          dispute resolution, safety, and legal compliance. We then delete or
          anonymize it when practical.
        </p>
      </>
    ),
  },
  {
    title: "Youth privacy",
    content: (
      <p>
        Shalom serves youth and families. A parent or legal guardian should
        submit information for a child under 13. If you believe a child under
        13 provided personal information without appropriate permission,
        contact us so we can review and remove it.
      </p>
    ),
  },
  {
    title: "Your choices and requests",
    content: (
      <p>
        You may ask to access, correct, or delete personal information we
        maintain about you, subject to legal and operational requirements. To
        make a request, email{" "}
        <a href="mailto:admin@shalomconference.com">admin@shalomconference.com</a>.
        We may need to verify your identity before completing a request.
      </p>
    ),
  },
  {
    title: "Policy updates and contact",
    content: (
      <p>
        We may update this policy as our services or legal obligations change.
        The effective date below identifies the latest version. Questions about
        this policy may be sent to{" "}
        <a href="mailto:admin@shalomconference.com">admin@shalomconference.com</a>.
      </p>
    ),
  },
];

export default function Privacy() {
  useEffect(() => {
    const previousTitle = document.title;
    const description =
      "Learn how Shalom Conference collects, uses, and protects information, including email and text alert opt-in choices.";
    document.title = "Privacy Policy | Shalom Conference";

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
              <p className="text-xs font-bold uppercase tracking-[0.28em]">Your information</p>
            </div>
            <h1 className="mt-5 text-5xl font-black uppercase tracking-tight text-white sm:text-7xl">
              Privacy Policy
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              This policy explains how Shalom Conference handles information
              provided through our website, registrations, Prayer Chain,
              orders, and optional alerts.
            </p>
            <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-white/35">
              Effective September 20, 2026
            </p>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-4xl gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-primary/25 bg-primary/5 p-5">
                <Bell className="h-5 w-5 text-primary" />
                <p className="mt-3 font-bold text-white">Alerts require your choice</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  Promotional email or text alerts require an affirmative opt-in.
                </p>
              </div>
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <Mail className="h-5 w-5 text-primary" />
                <p className="mt-3 font-bold text-white">You can opt out</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  Reply STOP to texts or use the unsubscribe option in marketing emails.
                </p>
              </div>
            </div>

            <article className="mt-4 space-y-10 border border-white/10 bg-white/[0.025] p-6 sm:p-10">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="border-b border-white/10 pb-10 last:border-0 last:pb-0"
                >
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  <div className="privacy-copy mt-4 space-y-4 text-sm leading-7 text-white/60 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-white [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
                    {section.content}
                  </div>
                </section>
              ))}
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