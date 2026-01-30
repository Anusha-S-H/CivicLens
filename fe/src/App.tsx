import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AlertEngine from "./pages/AlertEngine";
import Schemes from "./pages/Schemes";
import SchemeDetails from "./pages/SchemeDetails";
import WelfareGapIndex from "./pages/WelfareGapIndex";
import DistrictVulnerability from "./pages/DistrictVulnerability";
import APIDemo from "./pages/APIDemo";
import MyReports from "./pages/MyReports";
import ReportedIssues from "./pages/ReportedIssues";
import Users from "./pages/Users";
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<AlertEngine />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/schemes/:schemeId" element={<SchemeDetails />} />
            <Route path="/welfare-gap" element={<WelfareGapIndex />} />
            <Route path="/vulnerability" element={<DistrictVulnerability />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/reported-issues" element={<ReportedIssues />} />
            <Route path="/users" element={<Users />} />
            <Route path="/api-demo" element={<APIDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
