import { useState } from "react";
import {
  getListMerchOrdersQueryKey,
  useConfirmMerchOrderPayment,
  useListMerchOrders,
  useListRegistrations,
  useListTestimonies,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, User, Mail, Phone, Calendar, MessageSquare, ArrowLeft, Lock, LogOut, Eye, EyeOff, Download, ShoppingBag } from "lucide-react";

const SESSION_KEY = "shalom_admin_auth";

function exportCSV(registrations: any[]) {
  const headers = ["First Name", "Last Name", "Email", "Phone", "Year", "Volunteer", "Role", "Registered At"];
  const rows = registrations.map((r) => [
    r.firstName,
    r.lastName,
    r.email,
    r.phone ?? "",
    r.conferenceYear,
    r.volunteer ? "Yes" : "No",
    r.volunteerRole ?? "",
    new Date(r.createdAt).toLocaleString(),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shalom-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportMerchOrdersCSV(orders: any[]) {
  const headers = ["Order", "Name", "Email", "Phone", "Items", "Total", "Cash App Reference", "Status", "Submitted At", "Payment Confirmed At", "Payment Confirmed By"];
  const rows = orders.map((order) => [
    order.id,
    order.name,
    order.email,
    order.phone ?? "",
    order.items.map((item: any) => `${item.quantity} × ${item.productName} (${item.size})`).join("; "),
    `$${Number(order.total).toFixed(2)}`,
    order.paymentReference,
    order.status,
    new Date(order.createdAt).toLocaleString(),
    order.paymentConfirmedAt ? new Date(order.paymentConfirmedAt).toLocaleString() : "",
    order.paymentConfirmedBy ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shalom-merch-preorders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

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
  const queryClient = useQueryClient();

  const registrationsQuery = useListRegistrations();
  const testimoniesQuery = useListTestimonies();
  const merchOrdersQuery = useListMerchOrders({
    query: { enabled: authed, queryKey: ["/api/merch-orders"] },
  });
  const verifyPaymentMutation = useConfirmMerchOrderPayment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMerchOrdersQueryKey() });
      },
    },
  });

  const registrations = [...(registrationsQuery.data || [])].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const testimonies = [...(testimoniesQuery.data || [])].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const merchOrders = [...(merchOrdersQuery.data || [])].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const awaitingVerificationCount = merchOrders.filter((order) => order.status === "awaiting_verification").length;
  const verifiedCount = merchOrders.filter((order) => order.status === "verified").length;

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
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-white">
                  {registrationsQuery.isLoading ? "..." : registrations.length}
                </Badge>
                {registrations.length > 0 && (
                  <button
                    onClick={() => exportCSV(registrations)}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                    title="Export CSV"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                )}
              </div>
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-white font-bold">{reg.firstName} {reg.lastName}</span>
                        {reg.volunteer && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 text-[10px] uppercase font-bold px-2 py-0">
                            {reg.volunteerRole || "Volunteer"}
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

          <section data-testid="section-merch-orders" className="space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between border-t-2 border-primary pt-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Merch preorders</h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-white">
                  {merchOrdersQuery.isLoading ? "..." : merchOrders.length}
                </Badge>
                <span className="hidden text-xs uppercase tracking-wider text-amber-300/80 sm:inline">
                  {awaitingVerificationCount} to review
                </span>
                <span className="hidden text-xs uppercase tracking-wider text-emerald-300/80 sm:inline">
                  {verifiedCount} confirmed
                </span>
                {merchOrders.length > 0 && (
                  <button
                    onClick={() => exportMerchOrdersCSV(merchOrders)}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                    title="Export merch orders"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                )}
              </div>
            </div>

            {merchOrdersQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl bg-white/5" />)}
              </div>
            ) : merchOrders.length === 0 ? (
              <div className="text-center py-16 text-white/30 rounded-2xl border border-dashed border-white/10">
                No merch preorders yet
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {merchOrders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-white">#{order.id} · {order.name}</p>
                        <p className="mt-1 text-sm text-white/50">{order.email}</p>
                        {order.phone && <p className="mt-1 text-sm text-white/50">{order.phone}</p>}
                      </div>
                      {order.status === "awaiting_verification" ? (
                        <Badge className="bg-amber-500/20 text-amber-300 border border-amber-300/20">
                          Awaiting verification
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-300/20">
                          Payment confirmed
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 space-y-1 border-y border-white/10 py-4 text-sm text-white/75">
                      {order.items.map((item) => (
                        <p key={`${item.productName}-${item.size}`}>{item.quantity} × {item.productName} · {item.size}</p>
                      ))}
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40">Cash App reference</p>
                        <p className="mt-1 font-mono text-sm text-primary">{order.paymentReference}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-primary">${Number(order.total).toFixed(2)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">
                          {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    {order.paymentConfirmedAt && order.paymentConfirmedBy && (
                      <div className="mt-4 rounded-lg border border-emerald-300/15 bg-emerald-300/5 px-3 py-2 text-xs text-emerald-200/80">
                        <p className="font-semibold uppercase tracking-wider text-emerald-300/60">Confirmation history</p>
                        <p className="mt-1">
                          Payment confirmed by <span className="font-semibold text-emerald-200">{order.paymentConfirmedBy}</span>
                          {" "}on {format(new Date(order.paymentConfirmedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    )}
                    {order.status === "awaiting_verification" && (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-4 w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                        disabled={verifyPaymentMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`Confirm the Cash App payment for order #${order.id}?`)) {
                            verifyPaymentMutation.mutate({ id: order.id });
                          }
                        }}
                      >
                        <Check className="h-4 w-4" />
                        {verifyPaymentMutation.isPending ? "Confirming…" : "Confirm payment"}
                      </Button>
                    )}
                    {verifyPaymentMutation.isError && verifyPaymentMutation.variables?.id === order.id && (
                      <p className="mt-3 text-sm text-red-300">
                        Payment confirmation could not be completed. Please try again.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
