import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import "@/features/booking/styles/accessibility.css";
import "leaflet/dist/leaflet.css";
import { BookOnceAIChatModal } from "@/components/BookOnceAIChatModal";


// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Stays = lazy(() => import("./pages/Stays"));
const TravelUtilities = lazy(() => import("./pages/TravelUtilities"));
const JourneyPlanner = lazy(() => import("./pages/JourneyPlanner"));

const RoutePlanning = lazy(() => import("./pages/RoutePlanning"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const BookingHistory = lazy(() => import("./pages/BookingHistory"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* Skip to main content link for keyboard navigation */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          <Toaster />
          <Sonner />
          <BookOnceAIChatModal />
          

          
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <main id="main-content">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/stays" element={<Stays />} />
                  <Route path="/utilities" element={<TravelUtilities />} />
                  <Route path="/journey" element={<JourneyPlanner />} />

                  <Route path="/journey/plan" element={<RoutePlanning />} />
                  <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile/bookings" 
                    element={
                      <ProtectedRoute>
                        <BookingHistory />
                      </ProtectedRoute>
                    } 
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
