import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import Referral from "./pages/Referral";
import FindTeacher from "./pages/FindTeacher";
import BecomeTeacher from "./pages/BecomeTeacher";
import ManualBooking from "./pages/ManualBooking";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import AdminUserManagement from "./pages/dashboards/admin/UserManagement";
import AdminTeacherVerification from "./pages/dashboards/admin/TeacherVerification";
import AdminPayments from "./pages/dashboards/admin/Payments";
import AdminSettings from "./pages/dashboards/admin/Settings";
import TeacherDashboard from "./pages/dashboards/TeacherDashboard";
import TeacherSchedule from "./pages/dashboards/teacher/TeacherSchedule";
import TeacherBookings from "./pages/dashboards/teacher/Bookings";
import TeacherEarnings from "./pages/dashboards/teacher/Earnings";
import TeacherProfile from "./pages/dashboards/teacher/TeacherProfile";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import StudentLessonSchedule from "./pages/dashboards/student/LessonSchedule";
import StudentProgress from "./pages/dashboards/student/Progress";
import StudentProfile from "./pages/dashboards/student/StudentProfile";
import ParentDashboard from "./pages/dashboards/ParentDashboard";
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
            <Route path="/biaya-les" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/cari-pengajar" element={<FindTeacher />} />
            <Route path="/jadi-pengajar" element={<BecomeTeacher />} />
            <Route path="/pesan-manual" element={<ManualBooking />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/users" element={<AdminUserManagement />} />
            <Route path="/dashboard/admin/teachers" element={<AdminTeacherVerification />} />
            <Route path="/dashboard/admin/payments" element={<AdminPayments />} />
            <Route path="/dashboard/admin/settings" element={<AdminSettings />} />
            
            <Route path="/dashboard/guru" element={<TeacherDashboard />} />
            <Route path="/dashboard/guru/jadwal" element={<TeacherSchedule />} />
            <Route path="/dashboard/guru/booking" element={<TeacherBookings />} />
            <Route path="/dashboard/guru/earnings" element={<TeacherEarnings />} />
            <Route path="/dashboard/guru/profile" element={<TeacherProfile />} />
            
            <Route path="/dashboard/siswa" element={<StudentDashboard />} />
            <Route path="/dashboard/siswa/jadwal" element={<StudentLessonSchedule />} />
            <Route path="/dashboard/siswa/progress" element={<StudentProgress />} />
            <Route path="/dashboard/siswa/profile" element={<StudentProfile />} />
            
            <Route path="/dashboard/orang-tua" element={<ParentDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
