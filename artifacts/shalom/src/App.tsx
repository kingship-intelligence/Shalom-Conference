import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";

const Home = lazy(() => import("@/pages/home"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Register = lazy(() => import("@/pages/register"));
const Archive = lazy(() => import("@/pages/archive"));
const ConferenceYear = lazy(() => import("@/pages/conference-year"));
const About = lazy(() => import("@/pages/about"));
const Partner = lazy(() => import("@/pages/partner"));
const Testimonies = lazy(() => import("@/pages/testimonies"));
const Admin = lazy(() => import("@/pages/admin"));
const Shop = lazy(() => import("@/pages/shop"));
const PrayerCharge = lazy(() => import("@/pages/prayer-charge"));
const Privacy = lazy(() => import("@/pages/privacy"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/prayer-charge" component={PrayerCharge} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/2026">
        <ConferenceYear year="2026" />
      </Route>
      <Route path="/about" component={About} />
      <Route path="/partner" component={Partner} />
      <Route path="/shop" component={Shop} />
      <Route path="/testimonies" component={Testimonies} />
      <Route path="/admin" component={Admin} />
      <Route path="/archive" component={Archive} />
      <Route path="/archive/:year">
        {(params) => <ConferenceYear year={params.year} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Force dark mode for the entire app since it's an electric/night vibe
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Suspense fallback={<div className="min-h-screen bg-background" aria-label="Loading page" />}>
            <Router />
          </Suspense>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
