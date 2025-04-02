import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Gallery, GalleryImage } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryPage() {
  const [selectedGallery, setSelectedGallery] = useState<number | null>(null);
  
  // Fetch galleries
  const { data: galleries = [], isLoading: isLoadingGalleries } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });
  
  // Fetch gallery images based on selected gallery
  const { data: galleryImages = [], isLoading: isLoadingImages } = useQuery<GalleryImage[]>({
    queryKey: ["/api/galleries", selectedGallery, "images"],
    queryFn: async () => {
      if (!selectedGallery) return [];
      
      const response = await fetch(`/api/galleries/${selectedGallery}/images`, {
        credentials: "include"
      });
      
      if (!response.ok) return [];
      return await response.json();
    },
    enabled: !!selectedGallery,
  });
  
  // Sort galleries by creation date (newest first)
  const sortedGalleries = [...galleries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Set initial selected gallery if not set and galleries are loaded
  if (!selectedGallery && sortedGalleries.length > 0 && !isLoadingGalleries) {
    setSelectedGallery(sortedGalleries[0].id);
  }
  
  // Get current gallery
  const currentGallery = sortedGalleries.find(gallery => gallery.id === selectedGallery);
  
  // Loading state
  if (isLoadingGalleries) {
    return (
      <PageLayout title="Gallery">
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
  
  // No galleries
  if (sortedGalleries.length === 0) {
    return (
      <PageLayout title="Gallery">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Image className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No galleries available</h3>
          <p className="mt-2 text-sm text-gray-500">
            There are no image galleries available at the moment.
          </p>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Gallery">
      <Tabs 
        value={selectedGallery?.toString()} 
        onValueChange={(value) => setSelectedGallery(Number(value))}
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
              <CardHeader>
                <CardTitle>{gallery.title}</CardTitle>
                {gallery.description && (
                  <CardDescription>{gallery.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
            
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
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </PageLayout>
  );
}
