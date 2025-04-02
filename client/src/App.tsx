import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import EventsPage from "@/pages/events-page";
import JobsPage from "@/pages/jobs-page";
import JobDetailsPage from "@/pages/job-details-page";
import GalleryPage from "@/pages/gallery-page";
import ForumPage from "@/pages/forum-page";
import ProfilePage from "@/pages/profile-page";
import DocumentsPage from "@/pages/documents-page";
import MessagesPage from "@/pages/messages-page";
import UniversityInfoPage from "@/pages/university-info-page";
import AlumniDirectory from "@/pages/alumni-directory";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminEvents from "@/pages/admin/admin-events";
import AdminJobs from "@/pages/admin/admin-jobs";
import AdminGallery from "@/pages/admin/admin-gallery";
import AdminForum from "@/pages/admin/admin-forum";
import AdminUsers from "@/pages/admin/admin-users";
import AdminDocuments from "@/pages/admin/admin-documents";
import TestAuth from "@/pages/test-auth";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/test" component={TestAuth} />

      {/* Protected routes for all users */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/jobs" component={JobsPage} />
      <ProtectedRoute path="/jobs/:id" component={JobDetailsPage} />
      <ProtectedRoute path="/gallery" component={GalleryPage} />
      <ProtectedRoute path="/forum" component={ForumPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/documents" component={DocumentsPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/alumni" component={AlumniDirectory} />
      <ProtectedRoute path="/university" component={UniversityInfoPage} />

      {/* Admin-only routes */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/events" component={AdminEvents} adminOnly={true} />
      <ProtectedRoute path="/admin/jobs" component={AdminJobs} adminOnly={true} />
      <ProtectedRoute path="/admin/gallery" component={AdminGallery} adminOnly={true} />
      <ProtectedRoute path="/admin/forum" component={AdminForum} adminOnly={true} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} adminOnly={true} />
      <ProtectedRoute path="/admin/documents" component={AdminDocuments} adminOnly={true} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;