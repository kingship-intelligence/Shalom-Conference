import { useEffect, useMemo, useState } from "react";
import {
  getListCheckInSessionsQueryKey,
  getListSessionCheckInsQueryKey,
  useCheckInRegistration,
  useCreateCheckInSession,
  useDeleteCheckInSession,
  useListCheckInSessions,
  useListSessionCheckIns,
  useUndoRegistrationCheckIn,
  type CheckInSession,
  type Registration,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Plus,
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
  registrations: Registration[];
  registrationsLoading: boolean;
  registrationsError: unknown;
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
  registrations,
  registrationsLoading,
  registrationsError,
}: AdminCheckInProps) {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [conferenceYear, setConferenceYear] = useState(String(new Date().getFullYear()));
  const [sessionDate, setSessionDate] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [formError, setFormError] = useState("");

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
      selectedSession
        ? registrations
            .filter((registration) => registration.conferenceYear === selectedSession.conferenceYear)
            .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`))
        : [],
    [registrations, selectedSession],
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filteredRegistrations = normalizedSearch
    ? eligibleRegistrations.filter((registration) =>
        [
          registration.firstName,
          registration.lastName,
          `${registration.firstName} ${registration.lastName}`,
          registration.email,
          registration.phone ?? "",
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
      <div className="border-b border-white/10 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Arrival desk</p>
                <h2 className="mt-1 text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">Check-in</h2>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
              Choose the configured session, then mark each registered attendee present. The roster is limited to that conference year.
            </p>
          </div>
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
        </div>

        {showCreateForm && (
          <form
            onSubmit={submitSession}
            className="mt-6 grid gap-4 rounded-xl border border-primary/20 bg-background/50 p-4 sm:grid-cols-2 lg:grid-cols-[0.7fr_1fr_1.4fr_auto]"
            data-testid="form-create-check-in-session"
          >
            <div>
              <label htmlFor="check-in-year" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/45">
                Conference year
              </label>
              <Input
                id="check-in-year"
                type="number"
                min="2000"
                max="2200"
                value={conferenceYear}
                onChange={(event) => setConferenceYear(event.target.value)}
                className="h-11 border-white/10 bg-white/5 text-white"
                data-testid="input-check-in-year"
              />
            </div>
            <div>
              <label htmlFor="check-in-date" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/45">
                Session date
              </label>
              <Input
                id="check-in-date"
                type="date"
                value={sessionDate}
                onChange={(event) => setSessionDate(event.target.value)}
                className="h-11 border-white/10 bg-white/5 text-white"
                data-testid="input-check-in-date"
              />
            </div>
            <div>
              <label htmlFor="check-in-name" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/45">
                Session name
              </label>
              <Input
                id="check-in-name"
                type="text"
                maxLength={100}
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                placeholder="Friday morning arrival"
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/25"
                data-testid="input-check-in-name"
              />
            </div>
            <Button
              type="submit"
              disabled={createSessionMutation.isPending}
              className="h-11 self-end rounded-full bg-white text-background hover:bg-white/90"
              data-testid="button-create-check-in-session"
            >
              {createSessionMutation.isPending ? "Saving…" : "Save session"}
            </Button>
            {(formError || createSessionMutation.isError) && (
              <p className="text-sm text-red-300 sm:col-span-2 lg:col-span-full" role="alert" data-testid="error-create-check-in-session">
                {formError || errorMessage(createSessionMutation.error, "The session could not be created.")}
              </p>
            )}
          </form>
        )}
      </div>

      <div className="grid lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="border-b border-white/10 p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Configured sessions</p>
              <p className="mt-1 text-sm text-white/60" data-testid="text-check-in-session-count">
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
              {[1, 2, 3].map((item) => <Skeleton key={item} className="h-24 rounded-xl bg-white/5" />)}
            </div>
          ) : sessionsQuery.isError ? (
            <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4" data-testid="error-check-in-sessions">
              <CircleAlert className="h-5 w-5 text-red-300" />
              <p className="mt-3 text-sm font-semibold text-red-200">Sessions could not be loaded.</p>
              <p className="mt-1 text-xs leading-relaxed text-red-200/65">{errorMessage(sessionsQuery.error, "The private session list request failed.")}</p>
              <Button type="button" variant="outline" onClick={() => void sessionsQuery.refetch()} className="mt-4 border-red-200/20 text-red-100 hover:bg-red-200/10" data-testid="button-retry-check-in-sessions">
                Try again
              </Button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center" data-testid="empty-check-in-sessions">
              <Clock3 className="mx-auto h-6 w-6 text-white/30" />
              <p className="mt-3 text-sm font-semibold text-white/65">No sessions yet</p>
              <p className="mt-1 text-xs leading-relaxed text-white/35">Create the first arrival window to begin checking people in.</p>
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
                    className={`group w-full rounded-xl border p-4 text-left transition-colors ${active ? "border-primary/60 bg-primary/10" : "border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.05]"}`}
                    data-testid={`button-select-check-in-session-${session.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-bold ${active ? "text-primary" : "text-white"}`}>{session.name}</p>
                        <p className="mt-1 text-xs text-white/50">{sessionDateLabel(session.sessionDate)}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/30">{session.conferenceYear}</p>
                      </div>
                      <ChevronRight className={`mt-1 h-4 w-4 shrink-0 ${active ? "text-primary" : "text-white/25 group-hover:text-white/55"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className="min-w-0 p-4 sm:p-6 lg:p-8">
          {!selectedSession ? (
            <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-6 text-center" data-testid="empty-check-in-selection">
              <ClipboardCheck className="h-8 w-8 text-white/25" />
              <p className="mt-4 text-lg font-bold text-white/70">Select a session to open its roster</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/40">Session check-ins stay separated by date and conference year.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5 border-b border-white/10 pb-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{sessionTimeLabel(selectedSession.sessionDate)} · {selectedSession.conferenceYear}</p>
                  <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl" data-testid={`text-active-check-in-session-${selectedSession.id}`}>{selectedSession.name}</h3>
                  <p className="mt-1 text-sm text-white/45">{sessionDateLabel(selectedSession.sessionDate)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Present</p>
                    <p className="mt-1 text-xl font-bold text-emerald-300" data-testid="text-check-in-present-count">
                      {sessionCheckInsQuery.isLoading
                        ? "…"
                        : sessionCheckInsQuery.isError
                          ? "Unavailable"
                          : `${checkIns.length}/${eligibleRegistrations.length}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={sessionCheckInsQuery.isLoading || sessionCheckInsQuery.isError || checkIns.length > 0 || deleteSessionMutation.isPending}
                    onClick={deleteSelectedSession}
                    className="h-11 border-red-300/20 text-red-300 hover:bg-red-300/10 hover:text-red-200"
                    data-testid={`button-delete-check-in-session-${selectedSession.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteSessionMutation.isPending ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>

              {deleteSessionMutation.isError && (
                <p className="mt-4 rounded-lg border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm text-red-200" role="alert" data-testid="error-delete-check-in-session">
                  {deleteSessionMutation.error && "status" in deleteSessionMutation.error && deleteSessionMutation.error.status === 409
                    ? "This session cannot be deleted while attendees are checked in. Undo those check-ins first."
                    : errorMessage(deleteSessionMutation.error, "The session could not be deleted.")}
                </p>
              )}

              {sessionCheckInsQuery.isLoading ? (
                <div className="mt-6 space-y-3" data-testid="loading-session-check-ins">
                  {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 rounded-xl bg-white/5" />)}
                </div>
              ) : sessionCheckInsQuery.isError ? (
                <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-10 text-center" data-testid="error-session-check-ins">
                  <CircleAlert className="mx-auto h-6 w-6 text-red-300" />
                  <p className="mt-3 font-semibold text-red-200">This session roster could not be verified.</p>
                  <p className="mt-2 text-sm text-red-200/65">{errorMessage(sessionCheckInsQuery.error, "The private check-in request failed.")}</p>
                  <Button type="button" variant="outline" onClick={() => void sessionCheckInsQuery.refetch()} className="mt-5 border-red-200/20 text-red-100 hover:bg-red-200/10" data-testid="button-retry-session-check-ins">
                    Try again
                  </Button>
                </div>
              ) : registrationsLoading ? (
                <div className="mt-6 space-y-3" data-testid="loading-check-in-registrations">
                  {[1, 2, 3].map((item) => <Skeleton key={item} className="h-20 rounded-xl bg-white/5" />)}
                </div>
              ) : registrationsError ? (
                <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-10 text-center" data-testid="error-check-in-registrations">
                  <CircleAlert className="mx-auto h-6 w-6 text-red-300" />
                  <p className="mt-3 font-semibold text-red-200">The attendee roster could not be loaded.</p>
                  <p className="mt-2 text-sm text-red-200/65">{errorMessage(registrationsError, "The private registrations request failed.")}</p>
                </div>
              ) : (
                <>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Find by name, email, or phone"
                        aria-label="Search the session roster"
                        className="h-12 border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/30"
                        data-testid="input-check-in-search"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/45">
                      <Users className="h-4 w-4" />
                      {filteredRegistrations.length} shown
                    </div>
                  </div>

                  {eligibleRegistrations.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-white/10 px-6 py-14 text-center" data-testid="empty-session-roster">
                      <Users className="mx-auto h-7 w-7 text-white/25" />
                      <p className="mt-3 font-semibold text-white/65">No registrations for {selectedSession.conferenceYear}</p>
                      <p className="mt-1 text-sm text-white/35">This session is ready, but its conference-year roster is empty.</p>
                    </div>
                  ) : filteredRegistrations.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-white/10 px-6 py-14 text-center text-sm text-white/40" data-testid="empty-check-in-search">
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
                        return (
                          <article
                            key={registration.id}
                            className={`rounded-xl border p-4 transition-colors sm:p-5 ${isCheckedIn ? "border-emerald-300/25 bg-emerald-300/[0.055]" : "border-white/10 bg-white/[0.025]"}`}
                            data-testid={`row-check-in-registration-${registration.id}`}
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="truncate font-bold text-white">{registration.firstName} {registration.lastName}</h4>
                                  {isCheckedIn && <Badge className="border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">Present</Badge>}
                                  {registration.volunteer && <Badge className="border border-primary/20 bg-primary/10 text-primary">{registration.volunteerRole || "Volunteer"}</Badge>}
                                </div>
                                <p className="mt-1 truncate text-sm text-white/45">{registration.email}</p>
                                {registration.phone && <p className="mt-1 text-xs text-white/30">{registration.phone}</p>}
                              </div>
                              <Button
                                type="button"
                                variant={isCheckedIn ? "outline" : "default"}
                                disabled={actionPending}
                                onClick={() => {
                                  if (!selectedSession) return;
                                  if (isCheckedIn) undoMutation.mutate({ sessionId: selectedSession.id, registrationId: registration.id });
                                  else checkInMutation.mutate({ sessionId: selectedSession.id, registrationId: registration.id });
                                }}
                                className={isCheckedIn ? "w-full border-emerald-300/25 text-emerald-200 hover:bg-emerald-300/10 sm:w-auto" : "w-full rounded-full bg-primary text-white hover:bg-primary/90 sm:w-auto"}
                                data-testid={`${isCheckedIn ? "button-undo" : "button-check-in"}-registration-${registration.id}`}
                              >
                                {isCheckedIn ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                {actionPending ? "Updating…" : isCheckedIn ? "Undo check-in" : "Check in"}
                              </Button>
                            </div>
                            {checkInError && <p className="mt-3 text-sm text-red-300" role="alert">Check-in failed: {errorMessage(checkInMutation.error, "Please try again.")}</p>}
                            {undoError && <p className="mt-3 text-sm text-red-300" role="alert">Undo failed: {errorMessage(undoMutation.error, "Please try again.")}</p>}
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
