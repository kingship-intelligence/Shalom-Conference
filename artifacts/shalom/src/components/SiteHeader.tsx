import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import shalomLogo from "@assets/logo_1778697155106.png";

const NAV_LINKS = [
  { label: "2026", href: "/2026" },
  { label: "About", href: "/about" },
  { label: "Partner", href: "/partner" },
  { label: "Testimonies", href: "/testimonies" },
  { label: "Archive", href: "/archive" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-black">
      <nav className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src={shalomLogo} alt="SHALOM" className="h-9 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors ${location === l.href ? "text-primary" : "text-white/60 hover:text-primary"}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest border-none px-6 h-10"
          >
            <Link href="/register">Register</Link>
          </Button>

          {/* Hamburger — mobile only */}
          <button
            className="sm:hidden flex items-center justify-center h-10 w-10 rounded-full text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden border-t border-white/10"
          >
            <div className="flex flex-col px-4 py-3 gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-bold uppercase tracking-widest py-3 border-b border-white/5 last:border-0 transition-colors ${
                    location === l.href ? "text-primary" : "text-white/60 hover:text-primary"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
