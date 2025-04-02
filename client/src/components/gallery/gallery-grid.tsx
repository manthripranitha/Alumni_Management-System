import { useState } from "react";
import { GalleryImage } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface GalleryGridProps {
  images: GalleryImage[];
  galleryTitle: string;
  onDeleteImage?: (imageId: number) => void;
}

export function GalleryGrid({ images, galleryTitle, onDeleteImage }: GalleryGridProps) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Image className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No images yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          No images have been uploaded to this gallery yet.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="relative group cursor-pointer overflow-hidden"
            onClick={() => setSelectedImage(image)}
          >
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img 
                src={image.imageUrl} 
                alt={image.caption || 'Gallery image'} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <CardContent className="p-2">
              {image.caption && (
                <p className="mt-1 text-sm text-gray-500 truncate">{image.caption}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedImage && (
            <>
              <div className="relative">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.caption || 'Gallery image'} 
                  className="w-full max-h-[70vh] object-contain"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-4">
                {selectedImage.caption && (
                  <DialogTitle className="text-lg">{selectedImage.caption}</DialogTitle>
                )}
                <DialogDescription className="text-sm mt-1">
                  From {galleryTitle}
                </DialogDescription>
                
                {user?.isAdmin && onDeleteImage && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        onDeleteImage(selectedImage.id);
                        setSelectedImage(null);
                      }}
                    >
                      Delete Image
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
