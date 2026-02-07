import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
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
import Content from "./pages/Content";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
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
            <Route path="/content" element={<Content />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
