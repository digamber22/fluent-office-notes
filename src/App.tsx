
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Import the new LandingPage and the existing HomePage (acting as Dashboard)
import LandingPage from "./pages/LandingPage"; 
import HomePage from "./pages/HomePage"; 
import MeetingDetailPage from "./pages/MeetingDetailPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage"; // Import new page
import TermsOfServicePage from "./pages/TermsOfServicePage"; // Import new page
import SupportPage from "./pages/SupportPage"; // Import new page
import { ThemeProvider } from "./components/ThemeProvider"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* Wrap with ThemeProvider */}
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme"> 
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Route / to the new LandingPage */}
            <Route path="/" element={<LandingPage />} /> 
            {/* Route /dashboard to the HomePage (acting as dashboard) */}
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
            {/* Add routes for new pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
