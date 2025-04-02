import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { UpcomingEventsCard, RecentJobsCard, RecentDiscussionsCard } from "@/components/dashboard/dashboard-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Event, Job, Discussion, Reply, User } from "@shared/schema";

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
      {/* Welcome Card */}
      <Card className="mb-6">
        <CardContent className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Welcome back, {user?.firstName}!
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Stay connected with your alumni network, find new opportunities, and participate in upcoming events.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UpcomingEventsCard events={upcomingEvents} />
        <RecentJobsCard jobs={recentJobs} />
        <RecentDiscussionsCard discussions={recentDiscussions} />
      </div>

      {/* Recent Gallery Uploads Section */}
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Gallery Uploads</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Annual Alumni Meet" 
                className="object-cover hover:opacity-75 transition-opacity" 
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Annual Alumni Meet 2022</p>
          </div>
          <div className="relative group">
            <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Graduation Ceremony" 
                className="object-cover hover:opacity-75 transition-opacity" 
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Graduation Ceremony 2023</p>
          </div>
          <div className="relative group">
            <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Tech Conference" 
                className="object-cover hover:opacity-75 transition-opacity" 
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Tech Conference 2023</p>
          </div>
          <div className="relative group">
            <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Campus Tour" 
                className="object-cover hover:opacity-75 transition-opacity" 
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">New Campus Tour</p>
          </div>
        </div>
        <div className="mt-4 text-sm">
          <a href="/gallery" className="font-medium text-primary hover:text-primary-dark flex items-center">
            View complete gallery <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
