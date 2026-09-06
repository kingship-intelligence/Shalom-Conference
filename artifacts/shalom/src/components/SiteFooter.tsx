import { Link } from "wouter";
import { Mail, MessageSquare } from "lucide-react";
import { SiInstagram, SiYoutube } from "react-icons/si";
import shalomLogo from "@assets/logo_1778697155106.png";

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white px-4 pt-16 pb-10 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-center mb-12">
          <img
            src={shalomLogo}
            alt="SHALOM"
            className="h-14 w-auto object-contain"
          />
        </div>

        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Contact</p>
            <a
              href="mailto:admin@shalomconference.com"
              className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              admin@shalomconference.com
            </a>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Giving</p>
            <a
              href="mailto:finance@shalomconference.com"
              className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              finance@shalomconference.com
            </a>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Testimonies</p>
            <Link
              href="/testimonies"
              className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
              Share Your Testimony
            </Link>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">Media</p>
            <a
              href="mailto:media@shalomconference.com"
              className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              media@shalomconference.com
            </a>
          </div>
        </div>

        <div className="h-px w-full bg-white/10 mb-8" />

        <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">
          <p className="text-gray-500 text-sm uppercase tracking-[0.15em] font-semibold">
            © {new Date().getFullYear()} Shalom Conference. All rights reserved.
          </p>
          <a
            href="https://www.instagram.com/shalomconference/"
            target="_blank"
            rel="noreferrer"
            aria-label="Shalom Conference on Instagram"
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <SiInstagram className="h-5 w-5" />
            @shalomconference
          </a>
          <a
            href="https://youtube.com/@shalomconference?si=o4djdLbW1gG5iLOa"
            target="_blank"
            rel="noreferrer"
            aria-label="Shalom Conference on YouTube"
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <SiYoutube className="h-5 w-5" />
            YouTube
          </a>
        </div>
      </div>
    </footer>
  );
}