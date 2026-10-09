import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import shalomLogo from "@assets/logo_1778697155106.png";
import { ThemeToggle } from "@/components/ThemeProvider";

const NAV_LINKS = [
  { label: "Prayer Charge", href: "/prayer-charge" },
  { label: "2026", href: "/2026" },
  { label: "About", href: "/about" },
  { label: "Partner", href: "/partner" },
  { label: "Shop", href: "/shop" },
  { label: "Testimonies", href: "/testimonies" },
  { label: "Archive", href: "/archive" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-header">
      <nav className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src={shalomLogo} alt="SHALOM" className="h-9 w-auto object-contain site-logo" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-bold uppercase tracking-widest">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors ${location === l.href ? "text-primary" : "text-copy-60 hover:text-primary"}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            asChild
            size="sm"
            className="hidden h-10 rounded-full border-none bg-primary px-6 font-bold uppercase tracking-widest text-white hover:bg-primary/90 sm:inline-flex"
          >
            <Link href="/register">Register</Link>
          </Button>

          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden flex items-center justify-center h-11 w-11 rounded-full text-ink hover:bg-ink/10 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
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
            id="site-mobile-menu"
            className="lg:hidden overflow-hidden border-t border-ink/10"
          >
            <div className="flex flex-col px-4 py-3 gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-bold uppercase tracking-widest py-3 border-b border-ink/5 last:border-0 transition-colors ${
                    location === l.href ? "text-primary" : "text-copy-60 hover:text-primary"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold uppercase tracking-widest text-white"
              >
                Register
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
