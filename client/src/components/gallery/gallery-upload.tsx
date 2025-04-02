import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGalleryImageSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, ImageIcon, X, FileUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extend the base schema to add client-side validation
const galleryUploadSchema = z.object({
  imageUrl: z.string().min(1, "Image URL or upload is required"),
  caption: z.string().optional(),
  file: z.any().optional(),
});

type GalleryUploadValues = z.infer<typeof galleryUploadSchema>;

interface GalleryUploadProps {
  galleryId: number;
  onSubmit: (values: GalleryUploadValues) => void;
  isSubmitting: boolean;
}

export function GalleryUpload({ galleryId, onSubmit, isSubmitting }: GalleryUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<GalleryUploadValues>({
    resolver: zodResolver(galleryUploadSchema),
    defaultValues: {
      imageUrl: "",
      caption: "",
      file: undefined,
    },
  });

  function handleSubmit(values: GalleryUploadValues) {
    if (uploadMethod === 'file' && fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        
        onSubmit({
          ...values,
          imageUrl: base64String,
          caption: values.caption?.trim(),
          file: file,
        });
      };
      
      reader.readAsDataURL(file);
    } else {
      onSubmit({
        ...values,
        imageUrl: values.imageUrl.trim(),
        caption: values.caption?.trim(),
      });
    }
  }

  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    setPreviewUrl(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        form.setValue("imageUrl", "file-upload-" + file.name); // Set a placeholder to pass validation
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPreview = () => {
    form.setValue("imageUrl", "");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'url' | 'file')} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="url" className="flex-1">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image URL
                </TabsTrigger>
                <TabsTrigger value="file" className="flex-1">
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload from Device
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="url">
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
              </TabsContent>
              
              <TabsContent value="file" className="mt-4">
                <div className="space-y-4">
                  <div 
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm text-center font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-center text-gray-500 mt-1">SVG, PNG, JPG, or GIF (max. 5MB)</p>
                    <input 
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                  </div>
                  
                  {previewUrl && uploadMethod === 'file' && (
                    <div className="p-2 bg-gray-50 border rounded-md">
                      <p className="text-xs text-gray-600 mb-1">Preview:</p>
                      <div className="relative rounded-md overflow-hidden">
                        <img 
                          src={previewUrl} 
                          alt="Upload Preview" 
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
              </TabsContent>
            </Tabs>
            
            {previewUrl && uploadMethod === 'url' && (
              <div className="relative mt-4 border rounded-md overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[300px] w-full object-contain"
                  onError={() => setPreviewUrl(null)}
                />
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
