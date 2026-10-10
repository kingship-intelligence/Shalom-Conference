import AdminSection from "@/components/AdminSection";
import { ThemeToggle } from "@/components/ThemeProvider";
import {
  RegistrationCount,
  RegistrationList,
  SurveyResponses,
} from "@/components/StaffPanels";
import NewConvertsAdmin from "@/components/NewConvertsAdmin";
import { useCallback, useEffect, useState } from "react";
import {
  getListRegistrationsQueryKey,
  getListMerchOrdersQueryKey,
  getListPrayerChainSignupsQueryKey,
  getListFirstTimerResponsesQueryKey,
  getListPrayerChargeSurveyResponsesQueryKey,
  getListAdminUsersQueryKey,
  useConfirmMerchOrderPayment,
  useCreateAdminUser,
  useDeleteRegistration,
  useListMerchOrders,
  useListPrayerChainSignups,
  useListFirstTimerResponses,
  useListPrayerChargeSurveyResponses,
  useListAdminUsers,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Check,
  User,
  UserCheck,
  Users,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Download,
  Search,
  ShoppingBag,
  Trash2,
  Clock3,
  Star,
} from "lucide-react";
import { AdminCheckIn } from "@/components/admin-check-in";

const SESSION_KEY = "shalom_admin_auth";
type AdminRole =
  | "admin"
  | "checkin"
  | "registration_viewer"
  | "new_converts"
  | "registration_checkin"
  | "first_timers"
  | "merch";

const ROLE_LABELS: Record<AdminRole, string> = {
  admin: "Full admin",
  checkin: "Check-in only",
  registration_viewer: "Registration count only",
  new_converts: "New converts only",
  registration_checkin: "Registrations and check-in",
  first_timers: "First timers only",
  merch: "Merch only",
};

function isAdminRole(value: unknown): value is AdminRole {
  return [
    "admin",
    "checkin",
    "registration_viewer",
    "new_converts",
    "registration_checkin",
    "first_timers",
    "merch",
  ].includes(value as string);
}

const PRAYER_SLOT_LABELS: Record<string, string> = {
  "00:00": "12 AM – 1 AM",
  "01:00": "1 AM – 2 AM",
  "02:00": "2 AM – 3 AM",
  "03:00": "3 AM – 4 AM",
  "04:00": "4 AM – 5 AM",
  "05:00": "5 AM – 6 AM",
  "06:00": "6 AM – 7 AM",
  "07:00": "7 AM – 8 AM",
  "08:00": "8 AM – 9 AM",
  "09:00": "9 AM – 10 AM",
  "10:00": "10 AM – 11 AM",
  "11:00": "11 AM – 12 PM",
};

function exportCSV(registrations: any[]) {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Year",
    "Volunteer",
    "Role",
    "Registered At",
  ];
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
    .map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    )
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
  const headers = [
    "Order",
    "Name",
    "Email",
    "Phone",
    "Items",
    "Total",
    "Cash App Reference",
    "Status",
    "Submitted At",
    "Payment Confirmed At",
    "Payment Confirmed By",
  ];
  const rows = orders.map((order) => [
    order.id,
    order.name,
    order.email,
    order.phone ?? "",
    order.items
      .map(
        (item: any) => `${item.quantity} × ${item.productName} (${item.size})`,
      )
      .join("; "),
    `$${Number(order.total).toFixed(2)}`,
    order.paymentReference,
    order.status,
    new Date(order.createdAt).toLocaleString(),
    order.paymentConfirmedAt
      ? new Date(order.paymentConfirmedAt).toLocaleString()
      : "",
    order.paymentConfirmedBy ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shalom-merch-preorders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportPrayerChainCSV(signups: any[]) {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Available Prayer Times",
    "Submitted At",
  ];
  const rows = signups.map((signup) => [
    signup.name,
    signup.email,
    signup.phone,
    signup.timeSlots
      .map((slot: string) => PRAYER_SLOT_LABELS[slot] ?? slot)
      .join("; "),
    new Date(signup.createdAt).toLocaleString(),
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `prayer-chain-signups-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function useAdminAuth() {
  const authQueryClient = useQueryClient();
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hasStoredSession = sessionStorage.getItem(SESSION_KEY) === "1";
    if (!hasStoredSession) {
      setChecking(false);
      return;
    }

    const controller = new AbortController();

    void fetch("/api/admin/session", {
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Admin session is no longer valid.");
        }
        return res.json();
      })
      .then((session) => {
        if (!isAdminRole(session?.role)) {
          throw new Error("Admin session has no valid access role.");
        }
        setRole(session.role);
        setAuthed(true);
      })
      .catch((sessionError) => {
        if (
          sessionError instanceof DOMException &&
          sessionError.name === "AbortError"
        ) {
          return;
        }
        sessionStorage.removeItem(SESSION_KEY);
        setError("Your admin session expired. Please sign in again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setChecking(false);
        }
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const session = await res.json();
        if (!isAdminRole(session?.role)) {
          setError("The server returned an invalid account role.");
          return;
        }
        sessionStorage.setItem(SESSION_KEY, "1");
        setRole(session.role);
        setAuthed(true);
      } else {
        setError("Incorrect username or password.");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(
    (message = "") => {
      void authQueryClient.cancelQueries();
      authQueryClient.clear();
      sessionStorage.removeItem(SESSION_KEY);
      setRole(null);
      setAuthed(false);
      setError(message);
      void fetch("/api/admin/session", {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});
    },
    [authQueryClient],
  );

  return { authed, role, checking, login, logout, loading, error };
}

function LoginScreen({
  onLogin,
  loading,
  error,
}: {
  onLogin: (u: string, p: string) => void;
  loading: boolean;
  error: string;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onLogin(username, password);
  }

  return (
    <div className="admin-theme-surface relative min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
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
            className="text-3xl font-bold italic text-ink uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-copy-40">
            Shalom Conference Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-copy-40 mb-2">
              Username
            </label>
            <Input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin username"
              required
              className="bg-ink/5 border-ink/10 text-ink placeholder:text-copy-20 focus:border-primary focus:ring-primary h-12"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-copy-40 mb-2">
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
                className="bg-ink/5 border-ink/10 text-ink placeholder:text-copy-20 focus:border-primary focus:ring-primary h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-copy-30 hover:text-copy-60 transition-colors"
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-700 dark:text-red-400 text-center">
              {error}
            </p>
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
  const { authed, role, checking, login, logout, loading, error } =
    useAdminAuth();
  const fullAdmin = authed && role === "admin";
  const queryClient = useQueryClient();
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [prayerChainSearch, setPrayerChainSearch] = useState("");
  const [firstTimerSearch, setFirstTimerSearch] = useState("");
  const [deletingRegistrationId, setDeletingRegistrationId] = useState<
    number | null
  >(null);
  const [deleteRegistrationError, setDeleteRegistrationError] = useState("");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>("checkin");
  const [adminAccountFormError, setAdminAccountFormError] = useState("");

  const registrationsQuery = useListRegistrations({
    query: {
      enabled: fullAdmin,
      queryKey: getListRegistrationsQueryKey(),
      retry: 2,
      refetchOnWindowFocus: true,
    },
    request: { credentials: "include" },
  });
  const testimoniesQuery = useListTestimonies({
    query: { enabled: fullAdmin },
    request: { credentials: "include" },
  });
  const adminUsersQuery = useListAdminUsers({
    query: {
      enabled: fullAdmin,
      queryKey: getListAdminUsersQueryKey(),
      retry: 2,
      refetchOnWindowFocus: true,
    },
    request: { credentials: "include" },
  });
  const merchOrdersQuery = useListMerchOrders({
    query: {
      enabled: authed && (role === "admin" || role === "merch"),
      queryKey: getListMerchOrdersQueryKey(),
      retry: 2,
      refetchOnWindowFocus: true,
    },
    request: { credentials: "include" },
  });
  const prayerChainQuery = useListPrayerChainSignups({
    query: {
      enabled: fullAdmin,
      queryKey: getListPrayerChainSignupsQueryKey(),
      retry: 2,
      refetchOnWindowFocus: true,
    },
    request: { credentials: "include" },
  });
  const firstTimerResponsesQuery = useListFirstTimerResponses({
    query: {
      enabled: fullAdmin || role === "first_timers",
      queryKey: getListFirstTimerResponsesQueryKey(),
      retry: 2,
      refetchOnWindowFocus: true,
    },
    request: { credentials: "include" },
  });
  const prayerChargeSurveyQuery = useListPrayerChargeSurveyResponses({
    query: {
      enabled: fullAdmin,
      queryKey: getListPrayerChargeSurveyResponsesQueryKey(),
      retry: 2,
      refetchOnWindowFocus: true,
    },
    request: { credentials: "include" },
  });
  const verifyPaymentMutation = useConfirmMerchOrderPayment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListMerchOrdersQueryKey(),
        });
      },
    },
  });
  const deleteRegistrationMutation = useDeleteRegistration({
    mutation: {
      onSuccess: () => {
        setDeleteRegistrationError("");
        setDeletingRegistrationId(null);
        queryClient.invalidateQueries({
          queryKey: getListRegistrationsQueryKey(),
        });
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey.some(
              (key) =>
                typeof key === "string" &&
                key.startsWith("/api/check-in-sessions/") &&
                key.endsWith("/check-ins"),
            ),
        });
      },
      onError: () => {
        setDeleteRegistrationError(
          "Unable to remove this registration. Please try again.",
        );
      },
    },
    request: { credentials: "include" },
  });
  const createAdminUserMutation = useCreateAdminUser({
    mutation: {
      onSuccess: () => {
        setNewAdminUsername("");
        setNewAdminPassword("");
        setConfirmAdminPassword("");
        setNewAdminRole("checkin");
        setAdminAccountFormError("");
        queryClient.invalidateQueries({
          queryKey: getListAdminUsersQueryKey(),
        });
      },
    },
    request: { credentials: "include" },
  });

  function submitAdminAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminAccountFormError("");
    if (newAdminPassword !== confirmAdminPassword) {
      setAdminAccountFormError("The passwords do not match.");
      return;
    }
    createAdminUserMutation.mutate({
      data: {
        username: newAdminUsername.trim(),
        password: newAdminPassword,
        role: newAdminRole,
      },
    });
  }

  const registrations = [...(registrationsQuery.data || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const normalizedRegistrationSearch = registrationSearch.trim().toLowerCase();
  const filteredRegistrations = normalizedRegistrationSearch
    ? registrations.filter((registration) =>
        [
          registration.firstName,
          registration.lastName,
          `${registration.firstName} ${registration.lastName}`,
          registration.email,
          registration.phone,
        ].some((value) =>
          value?.toLowerCase().includes(normalizedRegistrationSearch),
        ),
      )
    : registrations;

  const testimonies = [...(testimoniesQuery.data || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const merchOrders = [...(merchOrdersQuery.data || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const prayerChainSignups = [...(prayerChainQuery.data || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const normalizedPrayerChainSearch = prayerChainSearch.trim().toLowerCase();
  const filteredPrayerChainSignups = normalizedPrayerChainSearch
    ? prayerChainSignups.filter((signup) =>
        [
          signup.name,
          signup.email,
          signup.phone,
          ...signup.timeSlots,
          ...signup.timeSlots.map((slot) => PRAYER_SLOT_LABELS[slot]),
        ].some((value) =>
          value?.toLowerCase().includes(normalizedPrayerChainSearch),
        ),
      )
    : prayerChainSignups;
  const firstTimerResponses = [...(firstTimerResponsesQuery.data || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const prayerChargeSurveyResponses = [
    ...(prayerChargeSurveyQuery.data || []),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const averagePrayerChargeRating = prayerChargeSurveyResponses.length
    ? (
        prayerChargeSurveyResponses.reduce(
          (total, response) => total + response.rating,
          0,
        ) / prayerChargeSurveyResponses.length
      ).toFixed(1)
    : "—";
  const wouldAttendAgainCount = prayerChargeSurveyResponses.filter(
    (response) => response.wouldAttendAgain === "yes",
  ).length;
  const normalizedFirstTimerSearch = firstTimerSearch.trim().toLowerCase();
  const filteredFirstTimerResponses = normalizedFirstTimerSearch
    ? firstTimerResponses.filter((response) =>
        [
          response.name,
          response.email,
          response.isFirstTime ? "yes" : "no",
        ].some((value) =>
          value.toLowerCase().includes(normalizedFirstTimerSearch),
        ),
      )
    : firstTimerResponses;
  const awaitingVerificationCount = merchOrders.filter(
    (order) => order.status === "awaiting_verification",
  ).length;
  const verifiedCount = merchOrders.filter(
    (order) => order.status === "verified",
  ).length;
  const accountApiError = (
    createAdminUserMutation.error as { data?: { error?: string } } | null
  )?.data?.error;
  const firstTimersSection = (
    <AdminSection title="First Timers" defaultOpen={role === "first_timers"}>
      <section
        data-testid="section-first-timers"
        className="space-y-6 lg:col-span-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-secondary pt-4">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-secondary" />
            <h2 className="text-2xl font-bold uppercase tracking-wider text-ink">
              First Timers
            </h2>
          </div>
          <Badge className="bg-secondary text-white">
            {firstTimerResponsesQuery.isLoading
              ? "..."
              : normalizedFirstTimerSearch
                ? `${filteredFirstTimerResponses.length}/${firstTimerResponses.length}`
                : firstTimerResponses.length}
          </Badge>
        </div>

        {firstTimerResponses.length > 0 && (
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-35"
            />
            <Input
              type="search"
              value={firstTimerSearch}
              onChange={(event) => setFirstTimerSearch(event.target.value)}
              placeholder="Search by name, email, Yes, or No"
              aria-label="Search first-timer responses"
              className="h-12 border-ink/10 bg-ink/5 pl-11 text-ink placeholder:text-copy-35 focus-visible:border-secondary focus-visible:ring-secondary/20"
            />
          </div>
        )}

        {firstTimerResponsesQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((item) => (
              <Skeleton
                key={item}
                className="h-36 w-full rounded-xl bg-ink/5"
              />
            ))}
          </div>
        ) : firstTimerResponsesQuery.isError ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-6 py-12 text-center">
            <p className="font-bold text-red-700 dark:text-red-300">
              Unable to load first-timer responses.
            </p>
            <p className="mt-2 text-sm text-copy-45">
              Submitted responses are still saved. Check your connection and try
              again.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6 border-ink/20 text-ink hover:bg-ink/10"
              onClick={() => firstTimerResponsesQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : firstTimerResponses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/10 py-16 text-center text-copy-30">
            No first-timer responses yet
          </div>
        ) : filteredFirstTimerResponses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/10 py-16 text-center text-copy-30">
            No first-timer responses match “{firstTimerSearch.trim()}”
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredFirstTimerResponses.map((response) => (
              <article
                key={response.id}
                className="rounded-xl border border-ink/10 bg-ink/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-ink">{response.name}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-copy-50">
                      <Mail className="h-3.5 w-3.5" />
                      {response.email}
                    </p>
                  </div>
                  <Badge
                    className={
                      response.isFirstTime
                        ? "border border-emerald-300/20 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "border border-ink/15 bg-ink/5 text-copy-60"
                    }
                  >
                    First time: {response.isFirstTime ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-wider text-copy-25">
                  <span>Shalom {response.conferenceYear}</span>
                  <span>
                    {format(
                      new Date(response.createdAt),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminSection>
  );

  useEffect(() => {
    const protectedQueryErrors = [
      merchOrdersQuery.error,
      prayerChainQuery.error,
      firstTimerResponsesQuery.error,
      prayerChargeSurveyQuery.error,
      adminUsersQuery.error,
    ];
    const sessionExpired = protectedQueryErrors.some(
      (queryError) =>
        typeof queryError === "object" &&
        queryError !== null &&
        "status" in queryError &&
        queryError.status === 401,
    );

    if (authed && sessionExpired) {
      logout("Your admin session expired. Please sign in again.");
    }
  }, [
    authed,
    logout,
    merchOrdersQuery.error,
    prayerChainQuery.error,
    firstTimerResponsesQuery.error,
    prayerChargeSurveyQuery.error,
    adminUsersQuery.error,
  ]);

  const merchPanel = (
          <AdminSection title="Merch preorders">
<section data-testid="section-merch-orders" className="space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between border-t-2 border-primary pt-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-ink uppercase tracking-wider">Merch preorders</h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-white">
                  {merchOrdersQuery.isLoading ? "..." : merchOrders.length}
                </Badge>
                <span className="hidden text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300/80 sm:inline">
                  {awaitingVerificationCount} to review
                </span>
                <span className="hidden text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300/80 sm:inline">
                  {verifiedCount} confirmed
                </span>
                {merchOrders.length > 0 && (
                  <button
                    onClick={() => exportMerchOrdersCSV(merchOrders)}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-copy-50 hover:text-ink transition-colors"
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
                {[1, 2].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl bg-ink/5" />)}
              </div>
            ) : merchOrders.length === 0 ? (
              <div className="text-center py-16 text-copy-30 rounded-2xl border border-dashed border-ink/10">
                No merch preorders yet
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {merchOrders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-ink/10 bg-ink/5 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-ink">#{order.id} · {order.name}</p>
                        <p className="mt-1 text-sm text-copy-50">{order.email}</p>
                        {order.phone && <p className="mt-1 text-sm text-copy-50">{order.phone}</p>}
                      </div>
                      {order.status === "awaiting_verification" ? (
                        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/20">
                          Awaiting verification
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/20">
                          Payment confirmed
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 space-y-1 border-y border-ink/10 py-4 text-sm text-copy-75">
                      {order.items.map((item) => (
                        <p key={`${item.productName}-${item.size}`}>{item.quantity} × {item.productName} · {item.size}</p>
                      ))}
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-copy-40">Cash App reference</p>
                        <p className="mt-1 font-mono text-sm text-primary">{order.paymentReference}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-primary">${Number(order.total).toFixed(2)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-copy-30">
                          {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    {order.paymentConfirmedAt && order.paymentConfirmedBy && (
                      <div className="mt-4 rounded-lg border border-emerald-300/15 bg-emerald-300/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-200/80">
                        <p className="font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300/60">Confirmation history</p>
                        <p className="mt-1">
                          Payment confirmed by <span className="font-semibold text-emerald-700 dark:text-emerald-200">{order.paymentConfirmedBy}</span>
                          {" "}on {format(new Date(order.paymentConfirmedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    )}
                    {order.status === "awaiting_verification" && (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-4 w-full rounded-full bg-emerald-600 text-ink hover:bg-emerald-500"
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
                      <p className="mt-3 text-sm text-red-700 dark:text-red-300">
                        Payment confirmation could not be completed. Please try again.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </AdminSection>
  );

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm font-bold uppercase tracking-widest text-copy-50">
        Checking admin session…
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLogin={login} loading={loading} error={error} />;
  }

  if (role && role !== "admin") {
    return (
                <div className="admin-theme-surface min-h-screen bg-background pb-16 text-foreground">
        <header className="px-4 py-6 sm:px-6">
          <div className="container mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Staff access
              </p>
              <h1 className="mt-1 text-2xl font-bold italic text-ink">
                {ROLE_LABELS[role]}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Link
                href="/"
                className="text-sm font-bold uppercase tracking-widest text-copy-50 hover:text-ink"
              >
                <ArrowLeft className="mr-2 inline h-4 w-4" />
                Home
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-copy-50 hover:text-ink"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="container mx-auto max-w-7xl px-4 pt-3 sm:px-6">
          {(role === "registration_viewer" ||
            role === "registration_checkin") && <RegistrationCount />}
          {role === "registration_checkin" && <RegistrationList />}
          {role === "new_converts" && <NewConvertsAdmin />}
          {role === "merch" && merchPanel}
          {role === "first_timers" && firstTimersSection}
          {(role === "checkin" || role === "registration_checkin") && (
            <AdminSection title="Check-in desk" defaultOpen>
              <AdminCheckIn
                authed={authed}
                canManageSessions={false}
                canSendReplacementQr={false}
              />
            </AdminSection>
          )}
        </main>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-copy-60">
        <p className="text-sm">Checking account access…</p>
      </div>
    );
  }

  return (
    <div className="admin-theme-surface min-h-screen bg-background text-foreground pb-20">
      <header className="relative z-20 px-4 py-8 sm:px-6">
        <div className="container mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <h1
            className="text-4xl font-bold italic text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ADMIN
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="text-copy-50 hover:text-ink transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <button
              onClick={() => logout()}
              className="text-copy-50 hover:text-ink transition-colors font-bold uppercase tracking-widest text-sm flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto mt-8 max-w-7xl space-y-4 px-4">
        <AdminSection title="Admin Accounts">
          <section data-testid="section-admin-accounts" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-primary pt-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold uppercase tracking-wider text-ink">
                  Admin Accounts
                </h2>
              </div>
              <Badge className="bg-primary text-white">
                {adminUsersQuery.isLoading
                  ? "..."
                  : (adminUsersQuery.data?.length ?? 0)}
              </Badge>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-copy-55">
                  Current accounts
                </h3>
                {adminUsersQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <Skeleton
                        key={item}
                        className="h-16 w-full rounded-xl bg-ink/5"
                      />
                    ))}
                  </div>
                ) : adminUsersQuery.isError ? (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4">
                    <p
                      role="alert"
                      className="text-sm text-red-700 dark:text-red-200"
                    >
                      Could not load admin accounts. Your access is unchanged;
                      please retry.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 border-ink/20 text-ink hover:bg-ink/10"
                      onClick={() => void adminUsersQuery.refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : adminUsersQuery.data?.length ? (
                  <ul className="space-y-3">
                    {adminUsersQuery.data.map((adminUser) => (
                      <li
                        key={adminUser.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-3"
                      >
                        <span className="font-semibold text-ink">
                          {adminUser.username}
                        </span>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="border-ink/15 text-copy-60"
                          >
                            {ROLE_LABELS[adminUser.role]}
                          </Badge>
                          <span className="text-xs text-copy-40">
                            Added{" "}
                            {format(
                              new Date(adminUser.createdAt),
                              "MMM d, yyyy",
                            )}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-ink/10 p-4 text-sm text-copy-45">
                    No admin accounts were returned. Refresh the list before
                    making changes.
                  </p>
                )}
              </div>

              <form onSubmit={submitAdminAccount} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-copy-55">
                    Create a staff login
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-copy-40">
                    Choose access to registration counts, new converts,
                    check-in, or registrations with check-in. Full admins can
                    manage all areas and create accounts.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="new-admin-username"
                    className="mb-2 block text-xs font-bold uppercase tracking-widest text-copy-45"
                  >
                    Username
                  </label>
                  <Input
                    id="new-admin-username"
                    type="text"
                    autoComplete="username"
                    value={newAdminUsername}
                    onChange={(event) =>
                      setNewAdminUsername(event.target.value)
                    }
                    minLength={3}
                    maxLength={254}
                    required
                    placeholder="admin@example.com"
                    className="h-11 border-ink/10 bg-ink/5 text-ink placeholder:text-copy-25"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-admin-role"
                    className="mb-2 block text-xs font-bold uppercase tracking-widest text-copy-45"
                  >
                    Access level
                  </label>
                  <select
                    id="new-admin-role"
                    value={newAdminRole}
                    onChange={(event) =>
                      setNewAdminRole(event.target.value as AdminRole)
                    }
                    className="h-11 w-full rounded-md border border-ink/10 bg-background px-3 text-sm text-ink"
                  >
                    <option value="checkin">Check-in only</option>
                    <option value="first_timers">First timers only</option>
                    <option value="merch">Merch only</option>
                    <option value="registration_viewer">
                      Registration count only
                    </option>
                    <option value="new_converts">New converts only</option>
                    <option value="registration_checkin">
                      Registrations and check-in
                    </option>
                    <option value="admin">Full admin portal</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="new-admin-password"
                    className="mb-2 block text-xs font-bold uppercase tracking-widest text-copy-45"
                  >
                    Password
                  </label>
                  <Input
                    id="new-admin-password"
                    type="password"
                    autoComplete="new-password"
                    value={newAdminPassword}
                    onChange={(event) =>
                      setNewAdminPassword(event.target.value)
                    }
                    minLength={12}
                    maxLength={200}
                    required
                    className="h-11 border-ink/10 bg-ink/5 text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-admin-password"
                    className="mb-2 block text-xs font-bold uppercase tracking-widest text-copy-45"
                  >
                    Confirm password
                  </label>
                  <Input
                    id="confirm-admin-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmAdminPassword}
                    onChange={(event) =>
                      setConfirmAdminPassword(event.target.value)
                    }
                    minLength={12}
                    maxLength={200}
                    required
                    className="h-11 border-ink/10 bg-ink/5 text-ink"
                  />
                </div>
                {(adminAccountFormError || accountApiError) && (
                  <p
                    role="alert"
                    className="text-sm text-red-700 dark:text-red-300"
                  >
                    {adminAccountFormError || accountApiError}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={createAdminUserMutation.isPending}
                  className="w-full rounded-full bg-primary font-bold uppercase tracking-widest text-white hover:bg-primary/90"
                >
                  {createAdminUserMutation.isPending
                    ? "Creating account…"
                    : "Create account"}
                </Button>
              </form>
            </div>
          </section>
        </AdminSection>

        <AdminSection title="Check-in desk">
          <AdminCheckIn
            authed={authed}
            canManageSessions
            canSendReplacementQr
          />
        </AdminSection>

        <div className="space-y-4">
          {/* Registrations Section */}
          <AdminSection title="Registrations">
            <section data-testid="section-registrations" className="space-y-6">
              <div className="flex items-center justify-between border-t-2 border-primary pt-4">
                <h2 className="text-2xl font-bold text-ink uppercase tracking-wider">
                  Registrations
                </h2>
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary text-white">
                    {registrationsQuery.isLoading
                      ? "..."
                      : registrationsQuery.isError
                        ? "Unavailable"
                        : normalizedRegistrationSearch
                          ? `${filteredRegistrations.length}/${registrations.length}`
                          : registrations.length}
                  </Badge>
                  {registrations.length > 0 && !registrationsQuery.isError && (
                    <button
                      onClick={() => exportCSV(filteredRegistrations)}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-copy-50 hover:text-ink transition-colors"
                      title="Export CSV"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  )}
                </div>
              </div>

              {registrations.length > 0 && !registrationsQuery.isError && (
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-35"
                  />
                  <Input
                    type="search"
                    value={registrationSearch}
                    onChange={(event) =>
                      setRegistrationSearch(event.target.value)
                    }
                    placeholder="Search by name, email, or phone"
                    aria-label="Search registrations"
                    data-testid="input-registration-search"
                    className="h-12 border-ink/10 bg-ink/5 pl-11 text-ink placeholder:text-copy-35 focus-visible:border-primary focus-visible:ring-primary/20"
                  />
                </div>
              )}

              {deleteRegistrationError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200"
                >
                  {deleteRegistrationError}
                </p>
              )}

              {registrationsQuery.isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-24 w-full rounded-xl bg-ink/5"
                    />
                  ))}
                </div>
              ) : registrationsQuery.isError ? (
                <div
                  className="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-10 text-center"
                  role="alert"
                  data-testid="error-registration-list"
                >
                  <p className="font-semibold text-red-700 dark:text-red-200">
                    Registrations could not be loaded.
                  </p>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-200/65">
                    {registrationsQuery.error instanceof Error
                      ? registrationsQuery.error.message
                      : "The private registrations request failed."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void registrationsQuery.refetch()}
                    className="mt-5 border-red-200/20 text-red-700 dark:text-red-100 hover:bg-red-200/10"
                    data-testid="button-retry-registration-list"
                  >
                    Try again
                  </Button>
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-20 text-copy-30 rounded-2xl border border-dashed border-ink/10">
                  No registrations yet
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="text-center py-20 text-copy-30 rounded-2xl border border-dashed border-ink/10">
                  No registrations match “{registrationSearch.trim()}”
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRegistrations.map((reg) => (
                    <motion.div
                      key={reg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-ink/5 rounded-xl p-5 border border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-bold text-foreground">
                            {reg.firstName} {reg.lastName}
                          </span>
                          {reg.volunteer && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/20 text-primary border-primary/20 text-[10px] uppercase font-bold px-2 py-0"
                            >
                              {reg.volunteerRole || "Volunteer"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-copy-50">
                          <Mail className="h-3 w-3" />
                          <span>{reg.email}</span>
                        </div>
                        {reg.phone && (
                          <div className="flex items-center gap-2 text-sm text-copy-50">
                            <Phone className="h-3 w-3" />
                            <span>{reg.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                          <div className="flex items-center gap-1 text-xs font-bold text-primary uppercase">
                            <Calendar className="h-3 w-3" />
                            <span>Shalom {reg.conferenceYear}</span>
                          </div>
                          <span className="text-[10px] text-copy-30 uppercase tracking-tighter">
                            {format(new Date(reg.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <AlertDialog
                          onOpenChange={(open) => {
                            if (open) {
                              setDeletingRegistrationId(reg.id);
                              setDeleteRegistrationError("");
                            } else if (!deleteRegistrationMutation.isPending) {
                              setDeletingRegistrationId(null);
                            }
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0 border-red-500/30 text-red-700 dark:text-red-300 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-700 dark:text-red-200"
                              aria-label={`Remove registration for ${reg.firstName} ${reg.lastName}`}
                              title="Remove registration"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-ink/10 bg-card text-ink">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove this registration?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-copy-60">
                                This will permanently remove {reg.firstName}{" "}
                                {reg.lastName}&apos;s registration and any
                                private attendee portrait attached to it. This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-ink/20 bg-transparent text-ink hover:bg-ink/10 hover:text-ink">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-500"
                                disabled={deleteRegistrationMutation.isPending}
                                onClick={() => {
                                  setDeletingRegistrationId(reg.id);
                                  deleteRegistrationMutation.mutate({
                                    registrationId: reg.id,
                                  });
                                }}
                              >
                                {deleteRegistrationMutation.isPending &&
                                deletingRegistrationId === reg.id
                                  ? "Removing…"
                                  : "Remove registration"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </AdminSection>

          {/* Testimonies Section */}
          <AdminSection title="Testimonies">
            <section data-testid="section-testimonies" className="space-y-6">
              <div className="flex items-center justify-between border-t-2 border-secondary pt-4">
                <h2 className="text-2xl font-bold text-ink uppercase tracking-wider">
                  Testimonies
                </h2>
                <Badge className="bg-secondary text-white">
                  {testimoniesQuery.isLoading ? "..." : testimonies.length}
                </Badge>
              </div>

              {testimoniesQuery.isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-40 w-full rounded-xl bg-ink/5"
                    />
                  ))}
                </div>
              ) : testimonies.length === 0 ? (
                <div className="text-center py-20 text-copy-30 rounded-2xl border border-dashed border-ink/10">
                  No testimonies yet
                </div>
              ) : (
                <div className="space-y-4">
                  {testimonies.map((test) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-ink/5 rounded-2xl p-6 border border-ink/10 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-ink">
                            {test.name}
                          </h3>
                          {test.email && (
                            <p className="text-xs text-copy-30 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {test.email}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="border-ink/20 text-copy-50 text-[10px]"
                        >
                          {test.conferenceYear}
                        </Badge>
                      </div>
                      <div className="relative">
                        <MessageSquare className="absolute -left-2 -top-2 h-8 w-8 text-primary/10 -z-10" />
                        <p className="text-copy-80 leading-relaxed italic">
                          "{test.testimony}"
                        </p>
                      </div>
                      <p className="text-[10px] text-copy-20 uppercase text-right">
                        {format(new Date(test.createdAt), "MMM d, h:mm a")}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </AdminSection>

          <AdminSection title="New believers">
            <NewConvertsAdmin />
          </AdminSection>
          <AdminSection title="Conference survey">
            <SurveyResponses />
          </AdminSection>

          {firstTimersSection}

          <AdminSection title="Prayer Charge reflections">
            <section
              data-testid="section-prayer-charge-survey"
              className="space-y-6 lg:col-span-2"
            >
              <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-secondary pt-4">
                <div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-ink">
                      Prayer Charge reflections
                    </h2>
                  </div>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-copy-45">
                    Anonymous feedback from the completed Prayer Charge
                    gathering.
                  </p>
                </div>
                <Badge className="bg-secondary text-white">
                  {prayerChargeSurveyQuery.isLoading
                    ? "..."
                    : prayerChargeSurveyResponses.length}
                </Badge>
              </div>

              {prayerChargeSurveyQuery.isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3].map((item) => (
                    <Skeleton
                      key={item}
                      className="h-44 w-full rounded-xl bg-ink/5"
                    />
                  ))}
                </div>
              ) : prayerChargeSurveyQuery.isError ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-6 py-12 text-center">
                  <p className="font-bold text-red-700 dark:text-red-300">
                    Unable to load Prayer Charge feedback.
                  </p>
                  <p className="mt-2 text-sm text-copy-45">
                    The responses are still saved. Check your connection and try
                    again.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6 border-ink/20 text-ink hover:bg-ink/10"
                    onClick={() => prayerChargeSurveyQuery.refetch()}
                    data-testid="button-retry-prayer-charge-survey"
                  >
                    Try Again
                  </Button>
                </div>
              ) : prayerChargeSurveyResponses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink/10 py-16 text-center">
                  <p className="font-semibold text-copy-55">
                    No Prayer Charge responses yet
                  </p>
                  <p className="mt-2 text-sm text-copy-30">
                    Anonymous reflections will appear here after attendees share
                    them.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="border border-ink/10 bg-ink/[0.03] px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-copy-35">
                        Responses
                      </p>
                      <p className="mt-2 text-3xl font-black text-ink">
                        {prayerChargeSurveyResponses.length}
                      </p>
                    </div>
                    <div className="border border-ink/10 bg-ink/[0.03] px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-copy-35">
                        Average rating
                      </p>
                      <p className="mt-2 text-3xl font-black text-secondary">
                        {averagePrayerChargeRating}
                        <span className="ml-1 text-base font-semibold text-copy-35">
                          / 5
                        </span>
                      </p>
                    </div>
                    <div className="border border-ink/10 bg-ink/[0.03] px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-copy-35">
                        Would return
                      </p>
                      <p className="mt-2 text-3xl font-black text-secondary">
                        {wouldAttendAgainCount}
                        <span className="ml-1 text-base font-semibold text-copy-35">
                          yes
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {prayerChargeSurveyResponses.map((response) => (
                      <article
                        key={response.id}
                        className="rounded-xl border border-ink/10 bg-ink/5 p-5"
                        data-testid={`card-prayer-charge-response-${response.id}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-copy-35">
                              Rating
                            </p>
                            <div className="mt-2 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={
                                    star <= response.rating
                                      ? "text-secondary"
                                      : "text-copy-15"
                                  }
                                  aria-hidden="true"
                                >
                                  <Star
                                    className="h-4 w-4"
                                    fill="currentColor"
                                  />
                                </span>
                              ))}
                              <span className="ml-2 text-sm font-semibold text-copy-60">
                                {response.rating}/5
                              </span>
                            </div>
                          </div>
                          <Badge
                            className={
                              response.wouldAttendAgain === "yes"
                                ? "border border-emerald-300/20 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : response.wouldAttendAgain === "maybe"
                                  ? "border border-amber-300/20 bg-amber-500/15 text-amber-700 dark:text-amber-200"
                                  : "border border-ink/15 bg-ink/5 text-copy-55"
                            }
                          >
                            Attend again: {response.wouldAttendAgain}
                          </Badge>
                        </div>
                        {response.meaningfulMoment && (
                          <div className="mt-5 border-l-2 border-secondary/60 pl-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-copy-35">
                              Meaningful moment
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-copy-75">
                              {response.meaningfulMoment}
                            </p>
                          </div>
                        )}
                        {response.suggestion && (
                          <div className="mt-5 border-t border-ink/10 pt-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-copy-35">
                              Suggestion
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-copy-65">
                              {response.suggestion}
                            </p>
                          </div>
                        )}
                        <p className="mt-5 text-right text-[10px] uppercase tracking-wider text-copy-25">
                          {format(
                            new Date(response.createdAt),
                            "MMM d, yyyy 'at' h:mm a",
                          )}
                        </p>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          </AdminSection>

          <AdminSection title="Prayer chain">
            <section
              data-testid="section-prayer-chain"
              className="space-y-6 lg:col-span-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-primary pt-4">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold uppercase tracking-wider text-ink">
                    Prayer chain
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary text-white">
                    {prayerChainQuery.isLoading
                      ? "..."
                      : normalizedPrayerChainSearch
                        ? `${filteredPrayerChainSignups.length}/${prayerChainSignups.length}`
                        : prayerChainSignups.length}
                  </Badge>
                  {prayerChainSignups.length > 0 && (
                    <button
                      onClick={() =>
                        exportPrayerChainCSV(filteredPrayerChainSignups)
                      }
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-copy-50 transition-colors hover:text-ink"
                      title="Export prayer-chain signups"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  )}
                </div>
              </div>

              {prayerChainSignups.length > 0 && (
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-35"
                  />
                  <Input
                    type="search"
                    value={prayerChainSearch}
                    onChange={(event) =>
                      setPrayerChainSearch(event.target.value)
                    }
                    placeholder="Search by name, email, phone, or prayer time"
                    aria-label="Search prayer-chain signups"
                    data-testid="input-prayer-chain-search"
                    className="h-12 border-ink/10 bg-ink/5 pl-11 text-ink placeholder:text-copy-35 focus-visible:border-primary focus-visible:ring-primary/20"
                  />
                </div>
              )}

              {prayerChainQuery.isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((item) => (
                    <Skeleton
                      key={item}
                      className="h-48 w-full rounded-xl bg-ink/5"
                    />
                  ))}
                </div>
              ) : prayerChainQuery.isError ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-6 py-12 text-center">
                  <p className="font-bold text-red-700 dark:text-red-300">
                    Unable to load prayer-chain registrations.
                  </p>
                  <p className="mt-2 text-sm text-copy-45">
                    Your registrations are still saved. Check your connection
                    and try again.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6 border-ink/20 text-ink hover:bg-ink/10"
                    onClick={() => prayerChainQuery.refetch()}
                    data-testid="button-retry-prayer-chain"
                  >
                    Try Again
                  </Button>
                </div>
              ) : prayerChainSignups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink/10 py-16 text-center text-copy-30">
                  No prayer-chain signups yet
                </div>
              ) : filteredPrayerChainSignups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink/10 py-16 text-center text-copy-30">
                  No prayer-chain signups match “{prayerChainSearch.trim()}”
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredPrayerChainSignups.map((signup) => (
                    <article
                      key={signup.id}
                      className="rounded-xl border border-ink/10 bg-ink/5 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-ink">{signup.name}</p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-copy-50">
                            <Mail className="h-3.5 w-3.5" />
                            {signup.email}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-copy-50">
                            <Phone className="h-3.5 w-3.5" />
                            {signup.phone}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary"
                        >
                          {signup.timeSlots.length}{" "}
                          {signup.timeSlots.length === 1 ? "hour" : "hours"}
                        </Badge>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {signup.timeSlots.map((slot) => (
                          <span
                            key={slot}
                            className="border border-ink/10 bg-shade/20 px-2.5 py-1.5 text-xs font-semibold text-copy-70"
                          >
                            {PRAYER_SLOT_LABELS[slot] ?? slot}
                          </span>
                        ))}
                      </div>
                      <p className="mt-4 text-right text-[10px] uppercase text-copy-20">
                        {format(new Date(signup.createdAt), "MMM d, h:mm a")}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </AdminSection>

          <AdminSection title="Merch preorders">
            <section
              data-testid="section-merch-orders"
              className="space-y-6 lg:col-span-2"
            >
              <div className="flex items-center justify-between border-t-2 border-primary pt-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold text-ink uppercase tracking-wider">
                    Merch preorders
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary text-white">
                    {merchOrdersQuery.isLoading ? "..." : merchOrders.length}
                  </Badge>
                  <span className="hidden text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300/80 sm:inline">
                    {awaitingVerificationCount} to review
                  </span>
                  <span className="hidden text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300/80 sm:inline">
                    {verifiedCount} confirmed
                  </span>
                  {merchOrders.length > 0 && (
                    <button
                      onClick={() => exportMerchOrdersCSV(merchOrders)}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-copy-50 hover:text-ink transition-colors"
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
                  {[1, 2].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-36 w-full rounded-xl bg-ink/5"
                    />
                  ))}
                </div>
              ) : merchOrders.length === 0 ? (
                <div className="text-center py-16 text-copy-30 rounded-2xl border border-dashed border-ink/10">
                  No merch preorders yet
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {merchOrders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-xl border border-ink/10 bg-ink/5 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-ink">
                            #{order.id} · {order.name}
                          </p>
                          <p className="mt-1 text-sm text-copy-50">
                            {order.email}
                          </p>
                          {order.phone && (
                            <p className="mt-1 text-sm text-copy-50">
                              {order.phone}
                            </p>
                          )}
                        </div>
                        {order.status === "awaiting_verification" ? (
                          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/20">
                            Awaiting verification
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/20">
                            Payment confirmed
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 space-y-1 border-y border-ink/10 py-4 text-sm text-copy-75">
                        {order.items.map((item) => (
                          <p key={`${item.productName}-${item.size}`}>
                            {item.quantity} × {item.productName} · {item.size}
                          </p>
                        ))}
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-copy-40">
                            Cash App reference
                          </p>
                          <p className="mt-1 font-mono text-sm text-primary">
                            {order.paymentReference}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-primary">
                            ${Number(order.total).toFixed(2)}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-copy-30">
                            {format(new Date(order.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      {order.paymentConfirmedAt && order.paymentConfirmedBy && (
                        <div className="mt-4 rounded-lg border border-emerald-300/15 bg-emerald-300/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-200/80">
                          <p className="font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300/60">
                            Confirmation history
                          </p>
                          <p className="mt-1">
                            Payment confirmed by{" "}
                            <span className="font-semibold text-emerald-700 dark:text-emerald-200">
                              {order.paymentConfirmedBy}
                            </span>{" "}
                            on{" "}
                            {format(
                              new Date(order.paymentConfirmedAt),
                              "MMM d, yyyy 'at' h:mm a",
                            )}
                          </p>
                        </div>
                      )}
                      {order.status === "awaiting_verification" && (
                        <Button
                          type="button"
                          size="sm"
                          className="mt-4 w-full rounded-full bg-emerald-600 text-ink hover:bg-emerald-500"
                          disabled={verifyPaymentMutation.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Confirm the Cash App payment for order #${order.id}?`,
                              )
                            ) {
                              verifyPaymentMutation.mutate({ id: order.id });
                            }
                          }}
                        >
                          <Check className="h-4 w-4" />
                          {verifyPaymentMutation.isPending
                            ? "Confirming…"
                            : "Confirm payment"}
                        </Button>
                      )}
                      {verifyPaymentMutation.isError &&
                        verifyPaymentMutation.variables?.id === order.id && (
                          <p className="mt-3 text-sm text-red-700 dark:text-red-300">
                            Payment confirmation could not be completed. Please
                            try again.
                          </p>
                        )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </AdminSection>
        </div>
      </main>
    </div>
  );
}
