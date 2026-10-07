import { Link } from "wouter";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { SiInstagram, SiYoutube } from "react-icons/si";
import shalomLogo from "@assets/logo_1778697155106.png";

export default function SiteFooter() {
  return (
    <footer className="bg-card text-ink px-4 pt-16 pb-10 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-center mb-12">
          <img
            src={shalomLogo}
            alt="SHALOM"
            className="h-14 w-auto object-contain site-logo"
          />
        </div>

        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-5 mb-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Contact</p>
            <a
              href="mailto:admin@shalomconference.com"
              className="flex items-center justify-center gap-2 text-muted-foreground hover:text-ink transition-colors text-sm"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              admin@shalomconference.com
            </a>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Giving</p>
            <a
              href="mailto:finance@shalomconference.com"
              className="flex items-center justify-center gap-2 text-muted-foreground hover:text-ink transition-colors text-sm"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              finance@shalomconference.com
            </a>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Testimonies</p>
            <Link
              href="/testimonies"
              className="flex items-center justify-center gap-2 text-muted-foreground hover:text-ink transition-colors text-sm font-medium"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
              Share Your Testimony
            </Link>
            <Link href="/survey" className="mt-3 block text-sm font-medium text-muted-foreground hover:text-ink">Conference feedback survey</Link>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Media</p>
            <a
              href="mailto:media@shalomconference.com"
              className="flex items-center justify-center gap-2 text-muted-foreground hover:text-ink transition-colors text-sm"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              media@shalomconference.com
            </a>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Legal</p>
            <Link
              href="/privacy"
              className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              Privacy & Alert Policy
            </Link>
            <Link
              href="/terms"
              className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              Terms & Conditions
            </Link>
          </div>
        </div>

        <div className="h-px w-full bg-ink/10 mb-8" />

        <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">
          <p className="text-muted-foreground text-sm uppercase tracking-[0.15em] font-semibold">
            © {new Date().getFullYear()} Shalom Conference. All rights reserved.
          </p>
          <Link
            href="/privacy"
            className="text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            Terms & Conditions
          </Link>
          <a
            href="https://www.instagram.com/shalomconference/"
            target="_blank"
            rel="noreferrer"
            aria-label="Shalom Conference on Instagram"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <SiInstagram className="h-5 w-5" />
            @shalomconference
          </a>
          <a
            href="https://youtube.com/@shalomconference?si=o4djdLbW1gG5iLOa"
            target="_blank"
            rel="noreferrer"
            aria-label="Shalom Conference on YouTube"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <SiYoutube className="h-5 w-5" />
            YouTube
          </a>
        </div>
      </div>
    </footer>
  );
}