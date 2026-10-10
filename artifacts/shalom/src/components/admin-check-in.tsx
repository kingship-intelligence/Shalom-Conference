import { useEffect, useMemo, useRef, useState } from "react";
import {
  getListCheckInSessionsQueryKey,
  getListCheckInRosterQueryKey,
  getListSessionCheckInsQueryKey,
  useCheckInRegistration,
  useCreateCheckInSession,
  useDeleteCheckInSession,
  useListCheckInSessions,
  useListCheckInRoster,
  useListSessionCheckIns,
  useScanCheckInQr,
  useSendRegistrationCheckInQr,
  useUndoRegistrationCheckIn,
  type CheckInRosterRegistration,
  type CheckInSession,
} from "@workspace/api-client-react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Mail,
  Plus,
  ScanLine,
  Search,
  Trash2,
  Undo2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type AdminCheckInProps = {
  authed: boolean;
  canManageSessions: boolean;
  canSendReplacementQr: boolean;
};

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null) {
    const data = (error as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return fallback;
}

function sessionDateLabel(value: string) {
  const parsed = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, "EEE, MMM d, yyyy");
}

function sessionTimeLabel(value: string) {
  const parsed = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? "" : format(parsed, "EEEE");
}

export function AdminCheckIn({
  authed,
  canManageSessions,
  canSendReplacementQr,
}: AdminCheckInProps) {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [conferenceYear, setConferenceYear] = useState(String(new Date().getFullYear()));
  const [sessionDate, setSessionDate] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [formError, setFormError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [scanError, setScanError] = useState("");
  const [qrEmailSentRegistrationId, setQrEmailSentRegistrationId] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControlsRef = useRef<{ stop: () => void } | null>(null);

  const sessionsQuery = useListCheckInSessions({
    query: {
      enabled: authed,
      queryKey: getListCheckInSessionsQueryKey(),
      retry: 1,
    },
    request: { credentials: "include" },
  });
  const sessions = sessionsQuery.data ?? [];

  useEffect(() => {
    if (selectedSessionId !== null && sessions.some((session) => session.id === selectedSessionId)) return;
    if (sessions.length > 0) setSelectedSessionId(sessions[0].id);
    else setSelectedSessionId(null);
  }, [selectedSessionId, sessions]);

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? null;
  const rosterQuery = useListCheckInRoster(selectedSessionId ?? 0, {
    query: {
      enabled: authed && selectedSessionId !== null,
      queryKey: getListCheckInRosterQueryKey(selectedSessionId ?? 0),
      retry: 1,
    },
    request: { credentials: "include" },
  });
  const registrations: CheckInRosterRegistration[] = rosterQuery.data ?? [];
  const sessionCheckInsQuery = useListSessionCheckIns(selectedSessionId ?? 0, {
    query: {
      enabled: authed && selectedSessionId !== null,
      queryKey: getListSessionCheckInsQueryKey(selectedSessionId ?? 0),
      retry: 1,
    },
    request: { credentials: "include" },
  });
  const checkIns = sessionCheckInsQuery.data ?? [];
  const checkedInIds = useMemo(() => new Set(checkIns.map((checkIn) => checkIn.registrationId)), [checkIns]);

  const eligibleRegistrations = useMemo(
    () =>
      [...registrations].sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
      ),
    [registrations],
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filteredRegistrations = normalizedSearch
    ? eligibleRegistrations.filter((registration) =>
        [
          registration.firstName,
          registration.lastName,
          `${registration.firstName} ${registration.lastName}`,
        ].some((value) => value.toLowerCase().includes(normalizedSearch)),
      )
    : eligibleRegistrations;

  const createSessionMutation = useCreateCheckInSession({
    mutation: {
      onSuccess: (session: CheckInSession) => {
        setShowCreateForm(false);
        setSessionName("");
        setSessionDate("");
        setConferenceYear(String(new Date().getFullYear()));
        setFormError("");
        setSelectedSessionId(session.id);
        queryClient.setQueryData<CheckInSession[]>(
          getListCheckInSessionsQueryKey(),
          (current) => [session, ...(current ?? []).filter((item) => item.id !== session.id)],
        );
        void queryClient.invalidateQueries({ queryKey: getListCheckInSessionsQueryKey() });
      },
    },
    request: { credentials: "include" },
  });
  const deleteSessionMutation = useDeleteCheckInSession({
    mutation: {
      onSuccess: (_, variables) => {
        if (selectedSessionId === variables.sessionId) setSelectedSessionId(null);
        queryClient.setQueryData<CheckInSession[]>(
          getListCheckInSessionsQueryKey(),
          (current) => current?.filter((session) => session.id !== variables.sessionId) ?? [],
        );
        void queryClient.invalidateQueries({ queryKey: getListCheckInSessionsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getListSessionCheckInsQueryKey(variables.sessionId) });
      },
    },
    request: { credentials: "include" },
  });
  const checkInMutation = useCheckInRegistration({
    mutation: {
      onSettled: (_data, _error, variables) => {
        void queryClient.invalidateQueries({ queryKey: getListSessionCheckInsQueryKey(variables.sessionId) });
      },
    },
    request: { credentials: "include" },
  });
  const undoMutation = useUndoRegistrationCheckIn({
    mutation: {
      onSettled: (_data, _error, variables) => {
        void queryClient.invalidateQueries({ queryKey: getListSessionCheckInsQueryKey(variables.sessionId) });
      },
    },
    request: { credentials: "include" },
  });
  const scanMutation = useScanCheckInQr({
    mutation: {
      onSuccess: (checkIn, variables) => {
        const attendee = registrations.find((registration) => registration.id === checkIn.registrationId);
        setScanError("");
        setScanMessage(attendee ? `Checked in ${attendee.firstName} ${attendee.lastName}.` : "Attendee checked in.");
        void queryClient.invalidateQueries({
          queryKey: getListSessionCheckInsQueryKey(variables.sessionId),
        });
      },
      onError: (error) => {
        setScanMessage("");
        setScanError(errorMessage(error, "This QR code could not be checked in."));
      },
    },
    request: { credentials: "include" },
  });
  const scanMutationRef = useRef(scanMutation.mutate);
  scanMutationRef.current = scanMutation.mutate;

  const sendQrMutation = useSendRegistrationCheckInQr({
    mutation: {
      onSuccess: (_data, variables) => {
        setQrEmailSentRegistrationId(variables.registrationId);
      },
    },
    request: { credentials: "include" },
  });

  useEffect(() => {
    if (!scannerOpen || selectedSessionId === null || !videoRef.current) return;

    let active = true;
    const reader = new BrowserQRCodeReader();
    void reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (!result || !active) return;
        active = false;
        scannerControlsRef.current?.stop();
        scannerControlsRef.current = null;
        setScannerOpen(false);
        setScanMessage("");
        setScanError("");
        scanMutationRef.current({
          sessionId: selectedSessionId,
          data: { payload: result.getText() },
        });
      })
      .then((controls) => {
        if (active) scannerControlsRef.current = controls;
        else controls.stop();
      })
      .catch((error: unknown) => {
        if (active) setScanError(errorMessage(error, "Camera access is unavailable. Check browser permissions."));
      });

    return () => {
      active = false;
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
    };
  }, [scannerOpen, selectedSessionId]);

  function submitSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const year = Number(conferenceYear);
    if (!Number.isInteger(year) || year < 2000 || year > 2200) {
      setFormError("Enter a valid conference year.");
      return;
    }
    if (!sessionDate || !sessionName.trim()) {
      setFormError("Add a date and session name before saving.");
      return;
    }
    createSessionMutation.mutate({
      data: { conferenceYear: year, sessionDate, name: sessionName.trim() },
    });
  }

  function deleteSelectedSession() {
    if (!selectedSession || checkIns.length > 0) return;
    if (!window.confirm(`Delete the ${selectedSession.name} session?`)) return;
    deleteSessionMutation.mutate({ sessionId: selectedSession.id });
  }

  return (
    <section
      data-testid="section-check-in"
      className="mb-12 overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,88,38,0.06))] shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
    >
      <div className="border-b border-ink/10 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Arrival desk</p>
                <h2 className="mt-1 text-2xl font-bold uppercase tracking-wider text-ink sm:text-3xl">Check-in</h2>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-copy-55">
              Choose the configured session, then mark each registered attendee present. The roster is limited to that conference year.
            </p>
          </div>
          {canManageSessions && (
            <Button
              type="button"
              onClick={() => {
                setShowCreateForm((value) => !value);
                setFormError("");
              }}
              className="w-full rounded-full bg-primary font-bold uppercase tracking-widest text-white hover:bg-primary/90 sm:w-auto"
              data-testid="button-toggle-create-session"
            >
              <Plus className="h-4 w-4" />
              {showCreateForm ? "Close form" : "Add session"}
            </Button>
          )}
        </div>

        {canManageSessions && showCreateForm && (
          <form
            onSubmit={submitSession}
            className="mt-6 grid gap-4 rounded-xl border border-primary/20 bg-background/50 p-4 sm:grid-cols-2 lg:grid-cols-[0.7fr_1fr_1.4fr_auto]"
            data-testid="form-create-check-in-session"
          >
            <div>
              <label htmlFor="check-in-year" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-copy-45">
                Conference year
              </label>
              <Input
                id="check-in-year"
                type="number"
                min="2000"
                max="2200"
                value={conferenceYear}
                onChange={(event) => setConferenceYear(event.target.value)}
                className="h-11 border-ink/10 bg-ink/5 text-ink"
                data-testid="input-check-in-year"
              />
            </div>
            <div>
              <label htmlFor="check-in-date" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-copy-45">
                Session date
              </label>
              <Input
                id="check-in-date"
                type="date"
                value={sessionDate}
                onChange={(event) => setSessionDate(event.target.value)}
                className="h-11 border-ink/10 bg-ink/5 text-ink"
                data-testid="input-check-in-date"
              />
            </div>
            <div>
              <label htmlFor="check-in-name" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-copy-45">
                Session name
              </label>
              <Input
                id="check-in-name"
                type="text"
                maxLength={100}
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                placeholder="Friday morning arrival"
                className="h-11 border-ink/10 bg-ink/5 text-ink placeholder:text-copy-25"
                data-testid="input-check-in-name"
              />
            </div>
            <Button
              type="submit"
              disabled={createSessionMutation.isPending}
              className="h-11 self-end rounded-full bg-ink text-background hover:bg-ink/90"
              data-testid="button-create-check-in-session"
            >
              {createSessionMutation.isPending ? "Saving…" : "Save session"}
            </Button>
            {(formError || createSessionMutation.isError) && (
              <p className="text-sm text-red-700 dark:text-red-300 sm:col-span-2 lg:col-span-full" role="alert" data-testid="error-create-check-in-session">
                {formError || errorMessage(createSessionMutation.error, "The session could not be created.")}
              </p>
            )}
          </form>
        )}
      </div>

      <div className="grid lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="border-b border-ink/10 p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copy-40">Configured sessions</p>
              <p className="mt-1 text-sm text-copy-60" data-testid="text-check-in-session-count">
                {sessionsQuery.isLoading
                  ? "Loading sessions"
                  : sessionsQuery.isError
                    ? "Unavailable"
                    : `${sessions.length} ${sessions.length === 1 ? "session" : "sessions"}`}
              </p>
            </div>
            <CalendarDays className="h-5 w-5 text-primary/75" />
          </div>

          {sessionsQuery.isLoading ? (
            <div className="space-y-3" data-testid="loading-check-in-sessions">
              {[1, 2, 3].map((item) => <Skeleton key={item} className="h-24 rounded-xl bg-ink/5" />)}
            </div>
          ) : sessionsQuery.isError ? (
            <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4" data-testid="error-check-in-sessions">
              <CircleAlert className="h-5 w-5 text-red-700 dark:text-red-300" />
              <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-200">Sessions could not be loaded.</p>
              <p className="mt-1 text-xs leading-relaxed text-red-700 dark:text-red-200/65">{errorMessage(sessionsQuery.error, "The private session list request failed.")}</p>
              <Button type="button" variant="outline" onClick={() => void sessionsQuery.refetch()} className="mt-4 border-red-200/20 text-red-700 dark:text-red-100 hover:bg-red-200/10" data-testid="button-retry-check-in-sessions">
                Try again
              </Button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink/15 px-4 py-8 text-center" data-testid="empty-check-in-sessions">
              <Clock3 className="mx-auto h-6 w-6 text-copy-30" />
              <p className="mt-3 text-sm font-semibold text-copy-65">No sessions yet</p>
              <p className="mt-1 text-xs leading-relaxed text-copy-35">
                {canManageSessions
                  ? "Create the first arrival window to begin checking people in."
                  : "Ask a full admin to configure a check-in session before arrival."}
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-testid="list-check-in-sessions">
              {sessions.map((session) => {
                const active = session.id === selectedSessionId;
                return (
                  <button
                    type="button"
                    key={session.id}
                    onClick={() => {
                      setSelectedSessionId(session.id);
                      setSearch("");
                    }}
                    className={`group w-full rounded-xl border p-4 text-left transition-colors ${active ? "border-primary/60 bg-primary/10" : "border-ink/10 bg-ink/[0.025] hover:border-ink/25 hover:bg-ink/[0.05]"}`}
                    data-testid={`button-select-check-in-session-${session.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-bold ${active ? "text-primary" : "text-ink"}`}>{session.name}</p>
                        <p className="mt-1 text-xs text-copy-50">{sessionDateLabel(session.sessionDate)}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-copy-30">{session.conferenceYear}</p>
                      </div>
                      <ChevronRight className={`mt-1 h-4 w-4 shrink-0 ${active ? "text-primary" : "text-copy-25 group-hover:text-copy-55"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className="min-w-0 p-4 sm:p-6 lg:p-8">
          {!selectedSession ? (
            <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-xl border border-dashed border-ink/10 px-6 text-center" data-testid="empty-check-in-selection">
              <ClipboardCheck className="h-8 w-8 text-copy-25" />
              <p className="mt-4 text-lg font-bold text-copy-70">Select a session to open its roster</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-copy-40">Session check-ins stay separated by date and conference year.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5 border-b border-ink/10 pb-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{sessionTimeLabel(selectedSession.sessionDate)} · {selectedSession.conferenceYear}</p>
                  <h3 className="mt-2 text-2xl font-bold text-ink sm:text-3xl" data-testid={`text-active-check-in-session-${selectedSession.id}`}>{selectedSession.name}</h3>
                  <p className="mt-1 text-sm text-copy-45">{sessionDateLabel(selectedSession.sessionDate)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-xl border border-ink/10 bg-ink/[0.035] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-copy-35">Present</p>
                    <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-check-in-present-count">
                      {sessionCheckInsQuery.isLoading
                        ? "…"
                        : sessionCheckInsQuery.isError
                          ? "Unavailable"
                          : `${checkIns.length}/${eligibleRegistrations.length}`}
                    </p>
                  </div>
                  {canManageSessions && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sessionCheckInsQuery.isLoading || sessionCheckInsQuery.isError || checkIns.length > 0 || deleteSessionMutation.isPending}
                      onClick={deleteSelectedSession}
                      className="h-11 border-red-300/20 text-red-700 dark:text-red-300 hover:bg-red-300/10 hover:text-red-700 dark:text-red-200"
                      data-testid={`button-delete-check-in-session-${selectedSession.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleteSessionMutation.isPending ? "Deleting…" : "Delete"}
                    </Button>
                  )}
                </div>
              </div>

              {deleteSessionMutation.isError && (
                <p className="mt-4 rounded-lg border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm text-red-700 dark:text-red-200" role="alert" data-testid="error-delete-check-in-session">
                  {deleteSessionMutation.error && "status" in deleteSessionMutation.error && deleteSessionMutation.error.status === 409
                    ? "This session cannot be deleted while attendees are checked in. Undo those check-ins first."
                    : errorMessage(deleteSessionMutation.error, "The session could not be deleted.")}
                </p>
              )}

              {sessionCheckInsQuery.isLoading ? (
                <div className="mt-6 space-y-3" data-testid="loading-session-check-ins">
                  {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 rounded-xl bg-ink/5" />)}
                </div>
              ) : sessionCheckInsQuery.isError ? (
                <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-10 text-center" data-testid="error-session-check-ins">
                  <CircleAlert className="mx-auto h-6 w-6 text-red-700 dark:text-red-300" />
                  <p className="mt-3 font-semibold text-red-700 dark:text-red-200">This session roster could not be verified.</p>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-200/65">{errorMessage(sessionCheckInsQuery.error, "The private check-in request failed.")}</p>
                  <Button type="button" variant="outline" onClick={() => void sessionCheckInsQuery.refetch()} className="mt-5 border-red-200/20 text-red-700 dark:text-red-100 hover:bg-red-200/10" data-testid="button-retry-session-check-ins">
                    Try again
                  </Button>
                </div>
              ) : rosterQuery.isLoading ? (
                <div className="mt-6 space-y-3" data-testid="loading-check-in-registrations">
                  {[1, 2, 3].map((item) => <Skeleton key={item} className="h-20 rounded-xl bg-ink/5" />)}
                </div>
              ) : rosterQuery.isError ? (
                <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-10 text-center" data-testid="error-check-in-registrations">
                  <CircleAlert className="mx-auto h-6 w-6 text-red-700 dark:text-red-300" />
                  <p className="mt-3 font-semibold text-red-700 dark:text-red-200">The attendee roster could not be loaded.</p>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-200/65">{errorMessage(rosterQuery.error, "The private registrations request failed.")}</p>
                </div>
              ) : (
                <>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-35" />
                      <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Find by name"
                        aria-label="Search the session roster"
                        className="h-12 border-ink/10 bg-ink/5 pl-11 text-ink placeholder:text-copy-30"
                        data-testid="input-check-in-search"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!selectedSession || scanMutation.isPending}
                        onClick={() => {
                          setScanMessage("");
                          setScanError("");
                          setScannerOpen(true);
                        }}
                        className="h-11 border-primary/30 text-ink hover:bg-primary/10"
                        data-testid="button-open-qr-scanner"
                      >
                        <ScanLine className="h-4 w-4" />
                        Scan QR
                      </Button>
                      <div className="flex items-center gap-2 px-1 text-xs text-copy-45">
                        <Users className="h-4 w-4" />
                        {filteredRegistrations.length} shown
                      </div>
                    </div>
                  </div>
                  {canSendReplacementQr && (
                    <p className="mt-2 text-xs text-copy-35">
                      Emailing a new QR code replaces and invalidates any older code for that attendee.
                    </p>
                  )}

                  {scannerOpen && (
                    <div className="mt-5 rounded-xl border border-primary/25 bg-shade/30 p-4 sm:p-5" data-testid="panel-qr-scanner">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-ink">Scan attendee QR</h4>
                          <p className="mt-1 text-sm text-copy-50">Allow camera access and center the attendee’s code in the frame.</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setScannerOpen(false)}
                          className="shrink-0 border-ink/15 text-copy-75"
                          data-testid="button-close-qr-scanner"
                        >
                          Close
                        </Button>
                      </div>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        aria-label="Camera view for scanning an attendee QR code"
                        className="mx-auto mt-4 max-h-[min(60vh,420px)] w-full max-w-xl rounded-lg bg-black object-cover"
                        data-testid="video-qr-scanner"
                      />
                    </div>
                  )}
                  {scanMessage && (
                    <p className="mt-3 rounded-lg border border-emerald-300/20 bg-emerald-300/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200" role="status" data-testid="status-qr-scan">
                      {scanMessage}
                    </p>
                  )}
                  {scanError && (
                    <p className="mt-3 rounded-lg border border-red-300/20 bg-red-300/5 px-4 py-3 text-sm text-red-700 dark:text-red-200" role="alert" data-testid="error-qr-scan">
                      {scanError}
                    </p>
                  )}

                  {eligibleRegistrations.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-ink/10 px-6 py-14 text-center" data-testid="empty-session-roster">
                      <Users className="mx-auto h-7 w-7 text-copy-25" />
                      <p className="mt-3 font-semibold text-copy-65">No registrations for {selectedSession.conferenceYear}</p>
                      <p className="mt-1 text-sm text-copy-35">This session is ready, but its conference-year roster is empty.</p>
                    </div>
                  ) : filteredRegistrations.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-ink/10 px-6 py-14 text-center text-sm text-copy-40" data-testid="empty-check-in-search">
                      No attendees match “{search.trim()}”
                    </div>
                  ) : (
                    <div className="mt-6 space-y-2" data-testid="list-session-roster">
                      {filteredRegistrations.map((registration) => {
                        const isCheckedIn = checkedInIds.has(registration.id);
                        const checkInError = checkInMutation.isError && checkInMutation.variables?.registrationId === registration.id;
                        const undoError = undoMutation.isError && undoMutation.variables?.registrationId === registration.id;
                        const actionPending =
                          (checkInMutation.isPending && checkInMutation.variables?.registrationId === registration.id) ||
                          (undoMutation.isPending && undoMutation.variables?.registrationId === registration.id);
                        const qrEmailPending =
                          sendQrMutation.isPending && sendQrMutation.variables?.registrationId === registration.id;
                        const qrEmailError =
                          sendQrMutation.isError && sendQrMutation.variables?.registrationId === registration.id;
                        return (
                          <article
                            key={registration.id}
                            className={`rounded-xl border p-4 transition-colors sm:p-5 ${isCheckedIn ? "border-emerald-300/25 bg-emerald-300/[0.055]" : "border-ink/10 bg-ink/[0.025]"}`}
                            data-testid={`row-check-in-registration-${registration.id}`}
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="truncate font-bold text-foreground">{registration.firstName} {registration.lastName}</h4>
                                  {isCheckedIn && <Badge className="border border-emerald-300/20 bg-emerald-300/10 text-emerald-700 dark:text-emerald-200">Present</Badge>}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 sm:flex-row">
                                {canSendReplacementQr && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!selectedSession || qrEmailPending}
                                    onClick={() => {
                                      if (!selectedSession) return;
                                      setQrEmailSentRegistrationId(null);
                                      sendQrMutation.mutate({
                                        sessionId: selectedSession.id,
                                        registrationId: registration.id,
                                      });
                                    }}
                                    aria-label={`Email a new QR code to ${registration.firstName} ${registration.lastName}; this replaces any previous code`}
                                    className="w-full border-ink/15 text-copy-75 hover:bg-ink/5 sm:w-auto"
                                    data-testid={`button-email-qr-registration-${registration.id}`}
                                  >
                                    <Mail className="h-4 w-4" />
                                    {qrEmailPending ? "Sending…" : "Email new QR"}
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant={isCheckedIn ? "outline" : "default"}
                                  disabled={actionPending}
                                  onClick={() => {
                                    if (!selectedSession) return;
                                    if (isCheckedIn) undoMutation.mutate({ sessionId: selectedSession.id, registrationId: registration.id });
                                    else checkInMutation.mutate({ sessionId: selectedSession.id, registrationId: registration.id });
                                  }}
                                  className={isCheckedIn ? "w-full border-emerald-300/25 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-300/10 sm:w-auto" : "w-full rounded-full bg-primary text-white hover:bg-primary/90 sm:w-auto"}
                                  data-testid={`${isCheckedIn ? "button-undo" : "button-check-in"}-registration-${registration.id}`}
                                >
                                  {isCheckedIn ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                  {actionPending ? "Updating…" : isCheckedIn ? "Undo check-in" : "Check in"}
                                </Button>
                              </div>
                            </div>
                            {qrEmailSentRegistrationId === registration.id && (
                              <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-200" role="status">A new QR code was emailed to this attendee.</p>
                            )}
                            {qrEmailError && (
                              <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
                                QR email failed: {errorMessage(sendQrMutation.error, "Please try again.")}
                              </p>
                            )}
                            {checkInError && <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">Check-in failed: {errorMessage(checkInMutation.error, "Please try again.")}</p>}
                            {undoError && <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">Undo failed: {errorMessage(undoMutation.error, "Please try again.")}</p>}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
