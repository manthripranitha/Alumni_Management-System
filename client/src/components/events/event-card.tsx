import { Link } from "wouter";
import { formatDistance, format } from "date-fns";
import { CalendarDays, MapPin, User, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface EventProps {
  event: {
    id: number;
    title: string;
    description: string;
    date: Date;
    location: string;
    image?: string | null;
  };
  isRegistered?: boolean;
  onRegister?: () => void;
  onUnregister?: () => void;
}

export function EventCard({ event, isRegistered, onRegister, onUnregister }: EventProps) {
  const { user } = useAuth();
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-gray-100">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge className={isUpcoming ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {isUpcoming ? "Upcoming" : "Past"}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <CardDescription className="flex items-center mt-1 text-sm text-gray-500">
              <CalendarDays className="h-4 w-4 mr-1" />
              {format(eventDate, "MMMM d, yyyy")}
            </CardDescription>
          </div>
          <div className="bg-primary text-white text-center rounded p-2 leading-none">
            <div className="text-xs font-semibold">{format(eventDate, "MMM")}</div>
            <div className="text-lg font-bold">{format(eventDate, "dd")}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex items-center mb-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {format(eventDate, "h:mm a")}
        </div>
        <div className="flex items-center mb-4 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          {event.location}
        </div>
        
        <p className="text-sm text-gray-700 line-clamp-3">{event.description}</p>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <Link href={`/events/${event.id}`}>
          <a className="text-primary hover:text-primary-dark font-medium text-sm">View Details</a>
        </Link>
        
        {user && isUpcoming && (
          isRegistered ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUnregister}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Cancel Registration
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={onRegister}
            >
              Register
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}

export function EventDetailCard({ event, isRegistered, onRegister, onUnregister }: EventProps) {
  const { user } = useAuth();
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  
  return (
    <Card className="overflow-hidden">
      <div className="relative h-64 bg-gray-100">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="h-16 w-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge className={isUpcoming ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {isUpcoming ? "Upcoming" : "Past"}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription className="text-gray-500">
              {formatDistance(eventDate, new Date(), { addSuffix: true })}
            </CardDescription>
          </div>
          <div className="bg-primary text-white text-center rounded p-3 leading-none">
            <div className="text-sm font-semibold">{format(eventDate, "MMM")}</div>
            <div className="text-2xl font-bold">{format(eventDate, "dd")}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-700">
            <CalendarDays className="h-5 w-5 mr-2 text-primary" />
            <div>
              <div className="text-sm font-medium">Date & Time</div>
              <div>{format(eventDate, "EEEE, MMMM d, yyyy")} at {format(eventDate, "h:mm a")}</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            <div>
              <div className="text-sm font-medium">Location</div>
              <div>{event.location}</div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">About this event</h3>
          <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
        </div>
        
        {user && isUpcoming && (
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Registration</h4>
                <p className="text-sm text-gray-600">
                  {isRegistered 
                    ? "You are registered for this event" 
                    : "Register to attend this event"}
                </p>
              </div>
              
              {isRegistered ? (
                <Button 
                  variant="outline" 
                  onClick={onUnregister}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel Registration
                </Button>
              ) : (
                <Button onClick={onRegister}>
                  Register Now
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
