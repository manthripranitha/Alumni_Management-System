import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { EventCard, EventDetailCard } from "@/components/events/event-card";
import { EventForm } from "@/components/events/event-form";
import { Event, InsertEvent } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, CalendarPlus, Calendar, CalendarX2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdminEvents() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Fetch events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: InsertEvent) => {
      console.log("Creating event with data:", eventData);
      const res = await apiRequest("POST", "/api/events", eventData);
      const responseData = await res.json();
      console.log("Event creation response:", responseData);
      return responseData;
    },
    onSuccess: (data) => {
      console.log("Event created successfully:", data);
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created",
        description: "The event has been created successfully.",
      });
    },
    onError: (error: Error) => {
      console.error("Event creation error:", error);
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Event> }) => {
      const res = await apiRequest("PUT", `/api/events/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event updated",
        description: "The event has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter and sort events
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Separate into upcoming and past events
  const now = new Date();
  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = filteredEvents.filter(event => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Handle event creation
  const handleCreateEvent = (values: any) => {
    const { date, time, ...rest } = values;
    
    console.log("Event form values:", values);
    
    // Combine date and time
    const eventDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    eventDate.setHours(hours, minutes, 0, 0);
    
    // Create the event data
    const eventData = {
      ...rest,
      date: eventDate,
      // Don't set createdBy - it will be set on the server from the authenticated user
    };
    
    console.log("Sending event data to API:", eventData);
    
    createEventMutation.mutate(eventData);
  };
  
  // Handle event edit
  const handleEditEvent = (values: any) => {
    if (!selectedEvent) return;
    
    const { date, time, ...rest } = values;
    
    // Combine date and time
    const eventDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    eventDate.setHours(hours, minutes, 0, 0);
    
    updateEventMutation.mutate({
      id: selectedEvent.id,
      data: {
        ...rest,
        date: eventDate,
      },
    });
  };
  
  // Handle event deletion
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEventMutation.mutate(selectedEvent.id);
    }
  };
  
  // Open edit dialog
  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <PageLayout title="Manage Events">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-40" />
        </div>
        
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
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
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
    <PageLayout title="Manage Events">
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
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <CalendarPlus className="h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Add a new event for alumni to participate in
              </DialogDescription>
            </DialogHeader>
            <EventForm
              mode="create"
              onSubmit={handleCreateEvent}
              isSubmitting={createEventMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <CalendarX2 className="h-4 w-4" />
            Past Events
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <div key={event.id} className="relative group">
                  <EventCard
                    event={event}
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-md shadow p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditDialog(event)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => openDeleteDialog(event)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No upcoming events</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search" 
                  : "Create your first event to get started"}
              </p>
              {!searchQuery && (
                <Button 
                  className="mt-4 gap-2" 
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => (
                <div key={event.id} className="relative group">
                  <EventCard
                    event={event}
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-md shadow p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditDialog(event)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => openDeleteDialog(event)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarX2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No past events</h3>
              <p className="mt-1 text-sm text-gray-500">
                Past events will appear here after they've occurred
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Edit Event Dialog */}
      {selectedEvent && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the details for this event
              </DialogDescription>
            </DialogHeader>
            <EventForm
              mode="edit"
              defaultValues={{
                title: selectedEvent.title,
                description: selectedEvent.description,
                location: selectedEvent.location,
                date: new Date(selectedEvent.date),
                time: new Date(selectedEvent.date).toTimeString().slice(0, 5)
              }}
              onSubmit={handleEditEvent}
              isSubmitting={updateEventMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{selectedEvent?.title}". 
              All associated registrations will also be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
