import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { Layout, LoadingState } from "@/components/shared";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import Seasonal from "./pages/Seasonal";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Trip from "./pages/Trip";
import Forum from "./pages/Forum";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Pricing from "./pages/Pricing";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected route wrapper that preserves the URL for redirect after sign-in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={location.pathname + location.search} />
      </SignedOut>
    </>
  );
};

const App = () => (
  <>
    <ClerkLoading>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState />
      </div>
    </ClerkLoading>
    <ClerkLoaded>
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
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/forum" element={<Forum />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trip/:tripId"
                  element={
                    <ProtectedRoute>
                      <Trip />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkLoaded>
  </>
);

export default App;
