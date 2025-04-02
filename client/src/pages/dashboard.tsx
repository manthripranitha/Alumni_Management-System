import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { UpcomingEventsCard, RecentJobsCard, RecentDiscussionsCard } from "@/components/dashboard/dashboard-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Event, Job, Discussion, Reply, User } from "@shared/schema";
import { GraduationCap, BookOpen, Briefcase, Users } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch upcoming events
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Fetch recent jobs
  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Fetch recent discussions
  const { data: discussions = [] } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
  });

  // Fetch replies for discussions to count them
  const { data: replies = [] } = useQuery<Reply[]>({
    queryKey: ["/api/replies"],
  });

  // Fetch all users for mapping to discussions
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter to upcoming events (future date)
  const upcomingEvents = events
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Get recent jobs, sorted by posted date
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, 3);

  // Get recent discussions with reply counts
  const recentDiscussions = [...discussions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(discussion => {
      const replyCount = replies.filter(reply => reply.discussionId === discussion.id).length;
      const createdByUser = users.find(u => u.id === discussion.createdBy);
      return {
        ...discussion,
        replyCount,
        createdBy: createdByUser ? {
          id: createdByUser.id,
          firstName: createdByUser.firstName,
          lastName: createdByUser.lastName,
          profileImage: createdByUser.profileImage,
        } : {
          id: 0,
          firstName: "",
          lastName: "",
          profileImage: null,
        }
      };
    });

  return (
    <PageLayout title="Dashboard">
      {/* Welcome Banner */}
      <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-yellow-100 to-yellow-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full -mt-10 -mr-10 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300 rounded-full -mb-8 -ml-8 opacity-20"></div>
        <CardContent className="px-6 py-8 sm:p-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="mt-2 text-gray-600 max-w-xl">
                Stay connected with your alumni network, discover new opportunities, and participate in upcoming events. We're glad to have you back in the Vignan University community.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <GraduationCap className="h-16 w-16 text-yellow-500 opacity-80" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Alumni Network</p>
              <h4 className="text-xl font-bold">{users.length}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <BookOpen className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Events</p>
              <h4 className="text-xl font-bold">{events.length}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <Briefcase className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Job Opportunities</p>
              <h4 className="text-xl font-bold">{jobs.length}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Forum Discussions</p>
              <h4 className="text-xl font-bold">{discussions.length}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UpcomingEventsCard events={upcomingEvents} />
        <RecentJobsCard jobs={recentJobs} />
        <RecentDiscussionsCard discussions={recentDiscussions} />
      </div>

      {/* Recent Gallery Uploads Section */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">Recent Gallery Uploads</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <div className="rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow bg-white">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Annual Alumni Meet" 
                className="object-cover aspect-square hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <p className="mt-2 text-sm text-gray-700 font-medium">Annual Alumni Meet 2022</p>
          </div>
          <div className="relative group">
            <div className="rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow bg-white">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Graduation Ceremony" 
                className="object-cover aspect-square hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <p className="mt-2 text-sm text-gray-700 font-medium">Graduation Ceremony 2023</p>
          </div>
          <div className="relative group">
            <div className="rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow bg-white">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Tech Conference" 
                className="object-cover aspect-square hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <p className="mt-2 text-sm text-gray-700 font-medium">Tech Conference 2023</p>
          </div>
          <div className="relative group">
            <div className="rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow bg-white">
              <img 
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Campus Tour" 
                className="object-cover aspect-square hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <p className="mt-2 text-sm text-gray-700 font-medium">New Campus Tour</p>
          </div>
        </div>
        <div className="mt-6 text-sm">
          <a href="/gallery" className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md font-medium hover:bg-yellow-200 transition-colors inline-flex items-center">
            View complete gallery <span aria-hidden="true" className="ml-1">&rarr;</span>
          </a>
        </div>
      </div>
      
      {/* Footer credit */}
      <div className="mt-16 mb-4 text-center text-gray-500 text-sm">
        <p>Developed And Maintained By Krishna Kant Kumar And Team</p>
      </div>
    </PageLayout>
  );
}
