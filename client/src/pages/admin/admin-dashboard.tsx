import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Event, Job, Discussion, Gallery } from "@shared/schema";
import { Users, Calendar, Briefcase, MessageSquare, Image } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

export default function AdminDashboard() {
  // Fetch data for dashboard
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });
  
  const { data: discussions = [], isLoading: isLoadingDiscussions } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
  });
  
  const { data: galleries = [], isLoading: isLoadingGalleries } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });
  
  // Count active users (alumni)
  const alumniCount = users.filter(user => !user.isAdmin).length;
  const adminsCount = users.filter(user => user.isAdmin).length;
  
  // Count upcoming events
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).length;
  
  // Count active jobs
  const activeJobs = jobs.filter(job => !job.expiresAt || new Date(job.expiresAt) > new Date()).length;
  
  // Prepare data for degree distribution chart
  const degreeDistribution = users
    .filter(user => user.degree)
    .reduce((acc, user) => {
      const degree = user.degree || "Other";
      acc[degree] = (acc[degree] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const degreeChartData = Object.entries(degreeDistribution).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Prepare data for graduation year chart
  const graduationYearDistribution = users
    .filter(user => user.graduationYear)
    .reduce((acc, user) => {
      const year = user.graduationYear?.toString() || "Unknown";
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  // Sort graduation years and get the last 5
  const graduationYearChartData = Object.entries(graduationYearDistribution)
    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      value,
    }));
  
  // Colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Loading state
  const isLoading = isLoadingUsers || isLoadingEvents || isLoadingJobs || isLoadingDiscussions || isLoadingGalleries;
  
  if (isLoading) {
    return (
      <PageLayout title="Admin Dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-9 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Admin Dashboard">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-3xl font-bold">{alumniCount}</h3>
              <p className="text-sm text-gray-500">Alumni</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-3xl font-bold">{upcomingEvents}</h3>
              <p className="text-sm text-gray-500">Upcoming Events</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Briefcase className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-3xl font-bold">{activeJobs}</h3>
              <p className="text-sm text-gray-500">Active Jobs</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-3xl font-bold">{discussions.length}</h3>
              <p className="text-sm text-gray-500">Discussions</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Image className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-3xl font-bold">{galleries.length}</h3>
              <p className="text-sm text-gray-500">Galleries</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Degree Distribution</CardTitle>
            <CardDescription>Breakdown of alumni by degree program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={degreeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {degreeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} alumni`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Graduation Years</CardTitle>
            <CardDescription>Alumni count by graduation year (last 5 years)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graduationYearChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} alumni`, ""]} />
                  <Bar dataKey="value" fill="#1E3A8A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
