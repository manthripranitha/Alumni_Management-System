import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGalleryImageSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, ImageIcon, X } from "lucide-react";

// Extend the base schema to add client-side validation
const galleryUploadSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  caption: z.string().optional(),
});

type GalleryUploadValues = z.infer<typeof galleryUploadSchema>;

interface GalleryUploadProps {
  galleryId: number;
  onSubmit: (values: GalleryUploadValues) => void;
  isSubmitting: boolean;
}

export function GalleryUpload({ galleryId, onSubmit, isSubmitting }: GalleryUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<GalleryUploadValues>({
    resolver: zodResolver(galleryUploadSchema),
    defaultValues: {
      imageUrl: "",
      caption: "",
    },
  });

  function handleSubmit(values: GalleryUploadValues) {
    onSubmit({
      ...values,
      imageUrl: values.imageUrl.trim(),
      caption: values.caption?.trim(),
    });
  }

  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    setPreviewUrl(url);
  };

  const clearPreview = () => {
    form.setValue("imageUrl", "");
    setPreviewUrl(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
        <CardDescription>
          Add a new image to this gallery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="https://example.com/image.jpg" 
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
                    Enter a URL to an image. Supported formats are JPEG, PNG, and GIF.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {previewUrl ? (
              <div className="relative mt-4 border rounded-md overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[300px] w-full object-contain"
                  onError={() => setPreviewUrl(null)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-md">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter an image URL to see a preview
                  </p>
                </div>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a caption to describe this image" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !form.watch("imageUrl")}
                className="gap-2"
              >
                {isSubmitting ? (
                  "Uploading..."
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
