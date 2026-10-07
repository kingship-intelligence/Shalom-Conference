import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

async function read<T>(path: string): Promise<T> {
  const response = await fetch(`/api/${path}`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load data.");
  return response.json();
}
function QueryStatus({ loading, error, retry }: { loading: boolean; error: boolean; retry: () => void }) {
  return <>{loading && <p role="status">Loading…</p>}{error && <div role="alert">Unable to load data. <Button variant="outline" onClick={retry}>Retry</Button></div>}</>;
}
export function RegistrationCount() {
  const query = useQuery({ queryKey: ["registration-count"], queryFn: () => read<{count: number}>("registration-count"), refetchInterval: 30000 });
  return <section className="mb-6 rounded-xl border border-border bg-card p-6"><h2 className="text-xl font-bold">Registered people</h2><QueryStatus loading={query.isLoading} error={query.isError} retry={() => void query.refetch()} />{query.data && <p className="mt-3 text-4xl font-bold">{query.data.count}</p>}<Button variant="outline" className="mt-4" onClick={() => void query.refetch()}>Refresh count</Button></section>;
}
export function RegistrationList() {
  const query = useQuery({ queryKey: ["staff-registrations"], queryFn: () => read<{id:number; firstName:string; lastName:string; email:string; conferenceYear:number}[]>("registrations") });
  return <section className="mb-6 space-y-4"><h2 className="text-xl font-bold">Registrations</h2><QueryStatus loading={query.isLoading} error={query.isError} retry={() => void query.refetch()} />{query.data?.length === 0 && <p>No registrations yet.</p>}<div className="grid gap-3 sm:grid-cols-2">{query.data?.map(person => <article key={person.id} className="min-w-0 rounded-xl border border-border p-4"><h3 className="font-bold">{person.firstName} {person.lastName}</h3><p className="break-all">{person.email}</p><p className="text-sm text-muted-foreground">Conference {person.conferenceYear}</p></article>)}</div></section>;
}
type SurveyResponse = {id:number; conferenceYear:number; rating:number; highlight:string; improvements:string; wouldAttendAgain:string; createdAt:string};
export function SurveyResponses() {
  const query = useQuery({ queryKey: ["conference-survey"], queryFn: () => read<SurveyResponse[]>("conference-survey") });
  return <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Conference feedback</h2><Button variant="outline" onClick={() => void query.refetch()}>Refresh</Button></div><Link href="/survey" className="text-primary underline">Open conference survey</Link><QueryStatus loading={query.isLoading} error={query.isError} retry={() => void query.refetch()} />{query.data && <p>{query.data.length} responses{query.data.length > 0 && ` · Average rating: ${(query.data.reduce((sum, row) => sum + row.rating, 0) / query.data.length).toFixed(1)} / 5`}</p>}{query.data?.map(row => <article key={row.id} className="rounded-xl border border-border bg-card p-5"><h3 className="font-bold">Conference {row.conferenceYear} · {row.rating} / 5</h3><p className="mt-2">Would attend again: {row.wouldAttendAgain}</p>{row.highlight && <p className="mt-3 whitespace-pre-wrap break-words"><strong>Highlights: </strong>{row.highlight}</p>}{row.improvements && <p className="mt-3 whitespace-pre-wrap break-words"><strong>Improvements: </strong>{row.improvements}</p>}<p className="mt-3 text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</p></article>)}</section>;
}
