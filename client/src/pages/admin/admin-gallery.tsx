import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { GalleryUpload } from "@/components/gallery/gallery-upload";
import { Gallery, GalleryImage, InsertGallery, InsertGalleryImage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Image, FolderPlus, Upload } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Gallery form schema
const galleryFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

export default function AdminGallery() {
  const { toast } = useToast();
  const [isCreateGalleryOpen, setIsCreateGalleryOpen] = useState(false);
  const [isUploadImageOpen, setIsUploadImageOpen] = useState(false);
  const [isDeleteGalleryOpen, setIsDeleteGalleryOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null);
  
  // Fetch galleries
  const { data: galleries = [], isLoading: isLoadingGalleries } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });
  
  // Fetch gallery images based on selected gallery
  const { data: galleryImages = [], isLoading: isLoadingImages } = useQuery<GalleryImage[]>({
    queryKey: ["/api/galleries", selectedGalleryId, "images"],
    queryFn: async () => {
      if (!selectedGalleryId) return [];
      
      const response = await fetch(`/api/galleries/${selectedGalleryId}/images`, {
        credentials: "include"
      });
      
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!selectedGalleryId,
  });
  
  // Create gallery form
  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  
  // Sort galleries by creation date (newest first)
  const sortedGalleries = [...galleries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Set initial selected gallery if not set and galleries are loaded
  if (!selectedGalleryId && sortedGalleries.length > 0 && !isLoadingGalleries) {
    setSelectedGalleryId(sortedGalleries[0].id);
  }
  
  // Get current gallery
  const currentGallery = sortedGalleries.find(gallery => gallery.id === selectedGalleryId);
  
  // Create gallery mutation
  const createGalleryMutation = useMutation({
    mutationFn: async (galleryData: InsertGallery) => {
      const res = await apiRequest("POST", "/api/galleries", galleryData);
      return await res.json();
    },
    onSuccess: (data) => {
      setIsCreateGalleryOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      setSelectedGalleryId(data.id);
      form.reset();
      toast({
        title: "Gallery created",
        description: "The gallery has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create gallery",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete gallery mutation
  const deleteGalleryMutation = useMutation({
    mutationFn: async (galleryId: number) => {
      await apiRequest("DELETE", `/api/galleries/${galleryId}`);
    },
    onSuccess: () => {
      setIsDeleteGalleryOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      
      if (selectedGalleryId === selectedGallery?.id) {
        if (sortedGalleries.length > 1) {
          const nextGallery = sortedGalleries.find(g => g.id !== selectedGallery?.id);
          if (nextGallery) {
            setSelectedGalleryId(nextGallery.id);
          } else {
            setSelectedGalleryId(null);
          }
        } else {
          setSelectedGalleryId(null);
        }
      }
      
      setSelectedGallery(null);
      toast({
        title: "Gallery deleted",
        description: "The gallery has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete gallery",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (imageData: InsertGalleryImage) => {
      const res = await apiRequest("POST", `/api/galleries/${selectedGalleryId}/images`, imageData);
      return await res.json();
    },
    onSuccess: () => {
      setIsUploadImageOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/galleries", selectedGalleryId, "images"] });
      toast({
        title: "Image uploaded",
        description: "The image has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upload image",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await apiRequest("DELETE", `/api/gallery-images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries", selectedGalleryId, "images"] });
      toast({
        title: "Image deleted",
        description: "The image has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete image",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle gallery creation
  const onSubmit = (values: GalleryFormValues) => {
    createGalleryMutation.mutate({
      ...values,
      createdBy: 1, // Admin user ID
    });
  };
  
  // Handle image upload
  const handleImageUpload = (values: { imageUrl: string; caption?: string }) => {
    if (!selectedGalleryId) return;
    
    uploadImageMutation.mutate({
      galleryId: selectedGalleryId,
      imageUrl: values.imageUrl,
      caption: values.caption || null,
      uploadedBy: 1, // Admin user ID
    });
  };
  
  // Handle delete gallery
  const handleDeleteGallery = () => {
    if (selectedGallery) {
      deleteGalleryMutation.mutate(selectedGallery.id);
    }
  };
  
  // Open delete gallery dialog
  const openDeleteGalleryDialog = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setIsDeleteGalleryOpen(true);
  };
  
  // Loading state
  if (isLoadingGalleries) {
    return (
      <PageLayout title="Manage Gallery">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <Skeleton className="h-10 w-64 mb-6" />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i}>
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-2">
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Manage Gallery">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Dialog open={isCreateGalleryOpen} onOpenChange={setIsCreateGalleryOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FolderPlus className="h-4 w-4" />
                Create Gallery
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Gallery</DialogTitle>
                <DialogDescription>
                  Create a new photo gallery for alumni events and memories
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gallery Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Annual Alumni Meet 2023" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive title for this gallery
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
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of this gallery" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createGalleryMutation.isPending}
                    >
                      {createGalleryMutation.isPending ? "Creating..." : "Create Gallery"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {selectedGalleryId && (
            <>
              <Dialog open={isUploadImageOpen} onOpenChange={setIsUploadImageOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Image</DialogTitle>
                    <DialogDescription>
                      Add a new image to the "{currentGallery?.title}" gallery
                    </DialogDescription>
                  </DialogHeader>
                  
                  <GalleryUpload
                    galleryId={selectedGalleryId}
                    onSubmit={handleImageUpload}
                    isSubmitting={uploadImageMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                className="gap-2 text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => openDeleteGalleryDialog(currentGallery!)}
              >
                Delete Gallery
              </Button>
            </>
          )}
        </div>
      </div>
      
      {sortedGalleries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Image className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No galleries yet</h3>
          <p className="mt-2 text-sm text-gray-500 mb-6">
            Create your first gallery to start adding images
          </p>
          <Button onClick={() => setIsCreateGalleryOpen(true)} className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Create Gallery
          </Button>
        </div>
      ) : (
        <>
          <Tabs 
            value={selectedGalleryId?.toString()} 
            onValueChange={(value) => setSelectedGalleryId(Number(value))}
            className="w-full mb-6"
          >
            <TabsList className="mb-6 flex-wrap h-auto">
              {sortedGalleries.map(gallery => (
                <TabsTrigger key={gallery.id} value={gallery.id.toString()}>
                  {gallery.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {sortedGalleries.map(gallery => (
              <TabsContent key={gallery.id} value={gallery.id.toString()}>
                <Card className="mb-8">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>{gallery.title}</CardTitle>
                      {gallery.description && (
                        <CardDescription>{gallery.description}</CardDescription>
                      )}
                    </div>
                    <Button 
                      onClick={() => setIsUploadImageOpen(true)}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Add Images
                    </Button>
                  </CardHeader>
                </Card>
                
                {gallery.id === selectedGalleryId && (
                  <>
                    {isLoadingImages ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <Card key={i}>
                            <Skeleton className="aspect-square w-full" />
                            <CardContent className="p-2">
                              <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <GalleryGrid 
                        images={galleryImages} 
                        galleryTitle={gallery.title}
                        onDeleteImage={(imageId) => deleteImageMutation.mutate(imageId)}
                      />
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
      
      {/* Delete Gallery Confirmation Dialog */}
      <AlertDialog open={isDeleteGalleryOpen} onOpenChange={setIsDeleteGalleryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the gallery "{selectedGallery?.title}" and all its images.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGallery}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGalleryMutation.isPending ? "Deleting..." : "Delete Gallery"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
