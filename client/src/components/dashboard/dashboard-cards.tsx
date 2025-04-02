import { Link } from "wouter";
import { 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    date: Date;
    location: string;
  };
}

export function UpcomingEventsCard({ events }: { events: EventCardProps["event"][] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            <Calendar className="text-primary h-5 w-5" />
          </div>
          <CardTitle className="ml-4">Upcoming Events</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <ul className="divide-y divide-gray-200">
          {events.length > 0 ? (
            events.map((event) => (
              <li key={event.id} className="py-3">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white">
                      <span className="text-xs font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.location} • {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <Link href={`/events/${event.id}`}>
                      <a className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
                        Details
                      </a>
                    </Link>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-3 text-sm text-gray-500">No upcoming events</li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-3">
        <Link href="/events">
          <a className="text-sm font-medium text-primary hover:text-primary-dark flex items-center">
            View all events <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}

interface JobCardProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    postedAt: Date;
  };
}

export function RecentJobsCard({ jobs }: { jobs: JobCardProps["job"][] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            <Briefcase className="text-primary h-5 w-5" />
          </div>
          <CardTitle className="ml-4">Recent Job Postings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <ul className="divide-y divide-gray-200">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <li key={job.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-green-100 text-green-800">
                        <Briefcase className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company} • {job.location}</p>
                    </div>
                  </div>
                  <div className="ml-2">
                    {isNewJob(job.postedAt) ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        New
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        {getDaysAgo(job.postedAt)}
                      </Badge>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-3 text-sm text-gray-500">No job postings available</li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-3">
        <Link href="/jobs">
          <a className="text-sm font-medium text-primary hover:text-primary-dark flex items-center">
            View all jobs <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}

interface DiscussionCardProps {
  discussion: {
    id: number;
    title: string;
    createdBy: {
      id: number;
      firstName: string;
      lastName: string;
      profileImage?: string | null;
    };
    createdAt: Date;
    replyCount: number;
  };
}

export function RecentDiscussionsCard({ discussions }: { discussions: DiscussionCardProps["discussion"][] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            <MessageSquare className="text-primary h-5 w-5" />
          </div>
          <CardTitle className="ml-4">Recent Forum Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <ul className="divide-y divide-gray-200">
          {discussions.length > 0 ? (
            discussions.map((discussion) => (
              <li key={discussion.id} className="py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{discussion.title}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex-shrink-0">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={discussion.createdBy.profileImage || ""} />
                        <AvatarFallback className="text-xs">
                          {discussion.createdBy.firstName.charAt(0)}{discussion.createdBy.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-xs text-gray-500 ml-1">
                      {discussion.createdBy.firstName} {discussion.createdBy.lastName} • {getTimeAgo(discussion.createdAt)} • {discussion.replyCount} replies
                    </p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-3 text-sm text-gray-500">No discussions available</li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-3">
        <Link href="/forum">
          <a className="text-sm font-medium text-primary hover:text-primary-dark flex items-center">
            View all discussions <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Utility functions
function isNewJob(date: Date): boolean {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return new Date(date) >= threeDaysAgo;
}

function getDaysAgo(date: Date): string {
  const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
  return `${days}d ago`;
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  
  return Math.floor(seconds) + " seconds ago";
}
