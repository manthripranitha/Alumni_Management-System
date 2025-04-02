import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEventSchema, Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon, ImageIcon, X, UploadCloud } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useRef } from "react";

// Extend the base schema to add client-side validation
const eventFormSchema = insertEventSchema
  .extend({
    date: z.coerce.date({
      required_error: "Event date is required",
    }),
    time: z.string().min(1, "Event time is required"),
    image: z.string().optional(),
  })
  // Remove the refine validation that was causing issues
  // This allows events to be created without time restrictions

// Custom type that extends the event schema with our form-specific fields
type EventFormValues = z.infer<typeof eventFormSchema> & {
  time: string;
  image?: string;
};

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
}

export function EventForm({ defaultValues, onSubmit, isSubmitting, mode }: EventFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValues?.image || null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>(defaultValues?.image && !defaultValues.image.startsWith('data:') ? 'url' : 'file');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      time: "12:00",
      location: "",
      image: "",
      ...defaultValues,
    },
  });

  const handleImageUrlChange = (url: string) => {
    form.setValue("image", url);
    setPreviewUrl(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        form.setValue("image", "file-upload-" + file.name); // Set a placeholder to pass validation
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPreview = () => {
    form.setValue("image", "");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  function handleSubmit(values: EventFormValues) {
    // Combine date and time for the API
    const eventDateTime = new Date(values.date);
    const [hours, minutes] = values.time.split(":").map(Number);
    eventDateTime.setHours(hours, minutes);
    
    if (uploadMethod === 'file' && fileInputRef.current?.files?.[0] && previewUrl) {
      // For file uploads, use the base64 data from preview
      const eventData = {
        ...values,
        date: eventDateTime,
        image: previewUrl, // Use the base64 data
      };
      
      onSubmit(eventData);
    } else {
      // For URL-based images or no image
      const eventData = {
        ...values,
        date: eventDateTime,
      };
      
      onSubmit(eventData);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create Event" : "Edit Event"}</CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Create a new event for alumni to attend" 
            : "Update the details of this event"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Annual Alumni Meet 2023" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive title for your event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="Campus Auditorium" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Where will the event take place?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the event, its purpose, agenda, etc." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about the event to help alumni decide if they want to attend.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium">Event Image (Optional)</h3>
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant={uploadMethod === 'url' ? 'default' : 'outline'}
                    onClick={() => setUploadMethod('url')}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    URL
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant={uploadMethod === 'file' ? 'default' : 'outline'}
                    onClick={() => setUploadMethod('file')}
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              
              {uploadMethod === 'url' ? (
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="https://example.com/event-image.jpg" 
                            {...field} 
                            onChange={e => handleImageUrlChange(e.target.value)}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full"
                              onClick={clearPreview}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Provide a URL to an image for the event banner.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4">
                  <div 
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm text-center font-medium">Click to upload an event image</p>
                    <p className="text-xs text-center text-gray-500 mt-1">SVG, PNG, JPG, or GIF (max. 5MB)</p>
                    <input 
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                  </div>
                </div>
              )}
              
              {previewUrl && (
                <div className="p-2 bg-gray-50 border rounded-md">
                  <p className="text-xs text-gray-600 mb-1">Image Preview:</p>
                  <div className="relative rounded-md overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Event Image Preview" 
                      className="w-full max-h-[200px] object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={clearPreview}
                    >
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // This will close the dialog through the parent component's onOpenChange handler
                  const closeButton = document.querySelector('[aria-label="Close"]');
                  if (closeButton instanceof HTMLElement) {
                    closeButton.click();
                  }
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Event" : "Update Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
