import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export default function Survey() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/conference-survey", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conferenceYear: 2026, rating: Number(data.get("rating")), highlight: data.get("highlight"), improvements: data.get("improvements"), wouldAttendAgain: data.get("wouldAttendAgain") }),
      });
      if (!response.ok || (await response.json()).success !== true) throw new Error();
      setSuccess(true);
    } catch { setError("We couldn’t save your feedback. Please try again."); }
    finally { setSaving(false); }
  }
  const fieldClass = "w-full rounded-md border border-input bg-background p-3 text-sm";
  return <div className="min-h-screen bg-background text-foreground">
    <SiteHeader />
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">Shalom Conference 2026</p>
      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">How was the conference?</h1>
      <p className="mt-5 text-muted-foreground">Tell us what you loved and what we can improve for next time. This survey is anonymous—please leave out names and contact details.</p>
      {success ? <div role="status" className="mt-10 rounded-2xl border border-border bg-card p-8"><h2 className="text-2xl font-bold">Thank you for your feedback.</h2><p className="mt-3">Your response has been saved and will help us plan the next conference.</p><Button asChild className="mt-6"><Link href="/">Back to Shalom</Link></Button></div> :
      <form onSubmit={submit} className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div><label htmlFor="survey-rating" className="mb-2 block font-medium">How was your overall experience?</label><select id="survey-rating" name="rating" required defaultValue="" className={fieldClass}><option value="" disabled>Select a rating</option>{[1,2,3,4,5].map(value => <option key={value} value={value}>{value} — {['Poor','Fair','Good','Very good','Excellent'][value-1]}</option>)}</select></div>
        <div><label htmlFor="survey-highlight" className="mb-2 block font-medium">What did you enjoy most? (optional)</label><textarea id="survey-highlight" name="highlight" rows={4} maxLength={3000} className={fieldClass} /></div>
        <div><label htmlFor="survey-improvements" className="mb-2 block font-medium">What could we improve? (optional)</label><textarea id="survey-improvements" name="improvements" rows={4} maxLength={3000} className={fieldClass} /></div>
        <div><label htmlFor="survey-return" className="mb-2 block font-medium">Would you attend again?</label><select id="survey-return" name="wouldAttendAgain" required defaultValue="" className={fieldClass}><option value="" disabled>Select an answer</option><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option></select></div>
        <p className="text-xs text-muted-foreground">Feedback is visible only to full conference administrators. Read our <Link href="/privacy" className="underline">privacy policy</Link>.</p>
        {error && <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>}
        <Button disabled={saving} type="submit" className="w-full">{saving ? "Saving…" : "Submit feedback"}</Button>
      </form>}
    </main><SiteFooter />
  </div>;
}
