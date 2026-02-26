import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AnalyticsProvider } from "@/components/shared/AnalyticsProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Specialists from "./pages/Specialists";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import CompanyEdit from "./pages/CompanyEdit";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import JobEdit from "./pages/JobEdit";
import EmployerApplications from "./pages/EmployerApplications";
import MyApplications from "./pages/MyApplications";
import FavoriteJobs from "./pages/FavoriteJobs";
import Content from "./pages/Content";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import Pricing from "./pages/Pricing";
import AdminHHSources from "./pages/AdminHHSources";
import AdminJobModeration from "./pages/AdminJobModeration";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsProvider />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/company/edit" element={<CompanyEdit />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<JobEdit />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/jobs/:id/edit" element={<JobEdit />} />
            <Route path="/employer/applications" element={<EmployerApplications />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/favorites" element={<FavoriteJobs />} />
            <Route path="/content" element={<Content />} />
            <Route path="/content/:slug" element={<Content />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/hh-sources" element={<AdminHHSources />} />
            <Route path="/admin/job-moderation" element={<AdminJobModeration />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
