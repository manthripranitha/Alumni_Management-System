import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { EventCard } from "@/components/events/event-card";
import { Event, EventRegistration } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Calendar, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Fetch user's event registrations
  const { data: eventRegistrations = [], isLoading: isLoadingRegistrations } = useQuery<EventRegistration[]>({
    queryKey: ["/api/events/registrations"],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await fetch(`/api/events/registrations?userId=${user.id}`, {
          credentials: "include"
        });
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch registrations:", error);
        return [];
      }
    },
    enabled: !!user,
  });
  
  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest("POST", `/api/events/${eventId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/registrations"] });
      toast({
        title: "Registration successful",
        description: "You have successfully registered for this event.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Unregister from event mutation
  const unregisterMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest("DELETE", `/api/events/${eventId}/unregister`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/registrations"] });
      toast({
        title: "Registration cancelled",
        description: "You have cancelled your registration for this event.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Filter by search query
  const filteredEvents = sortedEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Separate into upcoming and past events
  const now = new Date();
  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= now);
  const pastEvents = filteredEvents.filter(event => new Date(event.date) < now);
  
  // Check if user is registered for an event
  const isRegistered = (eventId: number) => {
    return eventRegistrations.some(registration => registration.eventId === eventId);
  };
  
  // Loading state
  if (isLoadingEvents) {
    return (
      <PageLayout title="Events">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between pt-4">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Events">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={isRegistered(event.id)}
                  onRegister={() => registerMutation.mutate(event.id)}
                  onUnregister={() => unregisterMutation.mutate(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
              <p className="mt-2 text-sm text-gray-500">
                Check back later for new events or view past events.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={isRegistered(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No past events</h3>
              <p className="mt-2 text-sm text-gray-500">
                There are no past events to display.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
