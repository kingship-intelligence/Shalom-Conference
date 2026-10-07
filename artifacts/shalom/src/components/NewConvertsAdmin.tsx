import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type Convert = { id: number; name: string; email: string; phone: string; city: string; hasLocalChurch?: boolean | null; createdAt: string };
export default function NewConvertsAdmin() {
  const query = useQuery<Convert[]>({
    queryKey: ["new-converts"],
    queryFn: async () => {
      const response = await fetch("/api/new-converts", { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load new believers.");
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error("Unable to load new believers.");
      return rows;
    },
  });
  return <section className="space-y-5 lg:col-span-2">
    <div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-bold">New believers</h2><p className="mt-1 text-sm text-muted-foreground">People who have asked the Shalom team to follow up with them.</p></div><Button variant="outline" onClick={() => void query.refetch()}>Refresh</Button></div>
    {query.isLoading && <p role="status">Loading follow-up details…</p>}
    {query.isError && <p role="alert" className="text-red-600 dark:text-red-400">Unable to load follow-up details. Please try refreshing.</p>}
    {query.data?.length === 0 && <p className="text-muted-foreground">No follow-up requests yet.</p>}
    <div className="grid gap-4 sm:grid-cols-2">{query.data?.map(person => <article key={person.id} className="min-w-0 rounded-xl border border-border bg-card p-5">
      <h3 className="font-bold">{person.name}</h3>
      <a href={`mailto:${person.email}`} className="mt-2 block break-all text-primary underline">{person.email}</a>
      {person.phone && <p className="mt-2 break-words">{person.phone}</p>}
      {person.city && <p className="mt-2 break-words text-muted-foreground">{person.city}</p>}
      <p className="mt-2 text-sm text-muted-foreground">Already has a local church: {person.hasLocalChurch === true ? "Yes" : person.hasLocalChurch === false ? "No" : "Not provided"}</p>
      <p className="mt-3 text-xs text-muted-foreground">Requested follow-up · {new Date(person.createdAt).toLocaleDateString()}</p>
    </article>)}</div>
  </section>;
}
