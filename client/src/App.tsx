import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import EventsPage from "@/pages/events-page";
import JobsPage from "@/pages/jobs-page";
import GalleryPage from "@/pages/gallery-page";
import ForumPage from "@/pages/forum-page";
import ProfilePage from "@/pages/profile-page";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminEvents from "@/pages/admin/admin-events";
import AdminJobs from "@/pages/admin/admin-jobs";
import AdminGallery from "@/pages/admin/admin-gallery";
import AdminForum from "@/pages/admin/admin-forum";
import AdminUsers from "@/pages/admin/admin-users";
import TestAuth from "@/pages/test-auth";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/test" component={TestAuth} />
      <Route path="/" component={Dashboard} />
      <Route path="/events" component={EventsPage} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/jobs" component={AdminJobs} />
      <Route path="/admin/gallery" component={AdminGallery} />
      <Route path="/admin/forum" component={AdminForum} />
      <Route path="/admin/users" component={AdminUsers} />
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
