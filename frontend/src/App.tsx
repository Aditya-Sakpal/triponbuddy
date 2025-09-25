import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Layout } from "@/components/shared";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import Seasonal from "./pages/Seasonal";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Trip from "./pages/Trip";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<Destinations />} />
            <Route path="/seasonal" element={<Seasonal />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route
              path="/profile"
              element={
                <>
                  <SignedIn>
                    <Profile />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/trip/:tripId"
              element={
                <>
                  <SignedIn>
                    <Trip />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
