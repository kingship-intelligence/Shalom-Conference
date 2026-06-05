import { useState } from "react";
import { useListRegistrations, useListTestimonies } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, User, Mail, Phone, Calendar, MessageSquare, ArrowLeft, Lock, LogOut, Eye, EyeOff } from "lucide-react";

const SESSION_KEY = "shalom_admin_auth";

function useAdminAuth() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(username: string, password: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setAuthed(true);
      } else {
        setError("Incorrect username or password.");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }

  return { authed, login, logout, loading, error };
}

function LoginScreen({ onLogin, loading, error }: { onLogin: (u: string, p: string) => void; loading: boolean; error: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onLogin(username, password);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1
            className="text-3xl font-bold italic text-white uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-white/40">Shalom Conference Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
              Username
            </label>
            <Input
              type="email"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@shalomconference.com"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary h-12"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-400 text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-sm mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const { authed, login, logout, loading, error } = useAdminAuth();

  const registrationsQuery = useListRegistrations();
  const testimoniesQuery = useListTestimonies();

  const registrations = [...(registrationsQuery.data || [])].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const testimonies = [...(testimoniesQuery.data || [])].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!authed) {
    return <LoginScreen onLogin={login} loading={loading} error={error} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="relative z-20 px-4 py-8 sm:px-6">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <h1
            className="text-4xl font-bold italic text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ADMIN
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/50 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <button
              onClick={logout}
              className="text-white/50 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Registrations Section */}
          <section data-testid="section-registrations" className="space-y-6">
            <div className="flex items-center justify-between border-t-2 border-primary pt-4">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Registrations</h2>
              <Badge className="bg-primary text-white">
                {registrationsQuery.isLoading ? "..." : registrations.length}
              </Badge>
            </div>

            {registrationsQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
                ))}
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-20 text-white/30 rounded-2xl border border-dashed border-white/10">
                No registrations yet
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-white font-bold">{reg.firstName} {reg.lastName}</span>
                        {reg.volunteer && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 text-[10px] uppercase font-bold px-2 py-0">
                            Volunteer
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <Mail className="h-3 w-3" />
                        <span>{reg.email}</span>
                      </div>
                      {reg.phone && (
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Phone className="h-3 w-3" />
                          <span>{reg.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-primary uppercase">
                        <Calendar className="h-3 w-3" />
                        <span>Shalom {reg.conferenceYear}</span>
                      </div>
                      <span className="text-[10px] text-white/30 uppercase tracking-tighter">
                        {format(new Date(reg.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Testimonies Section */}
          <section data-testid="section-testimonies" className="space-y-6">
            <div className="flex items-center justify-between border-t-2 border-secondary pt-4">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Testimonies</h2>
              <Badge className="bg-secondary text-white">
                {testimoniesQuery.isLoading ? "..." : testimonies.length}
              </Badge>
            </div>

            {testimoniesQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl bg-white/5" />
                ))}
              </div>
            ) : testimonies.length === 0 ? (
              <div className="text-center py-20 text-white/30 rounded-2xl border border-dashed border-white/10">
                No testimonies yet
              </div>
            ) : (
              <div className="space-y-4">
                {testimonies.map((test) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{test.name}</h3>
                        <p className="text-xs text-white/30 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {test.email}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-white/20 text-white/50 text-[10px]">
                        {test.conferenceYear}
                      </Badge>
                    </div>
                    <div className="relative">
                      <MessageSquare className="absolute -left-2 -top-2 h-8 w-8 text-primary/10 -z-10" />
                      <p className="text-white/80 leading-relaxed italic">
                        "{test.testimony}"
                      </p>
                    </div>
                    <p className="text-[10px] text-white/20 uppercase text-right">
                      {format(new Date(test.createdAt), "MMM d, h:mm a")}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
