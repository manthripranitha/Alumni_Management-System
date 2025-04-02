import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export function UniversityInfo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    data: universityInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/university-info"],
    queryFn: async () => {
      const res = await fetch("/api/university-info");
      if (!res.ok) throw new Error("Failed to fetch university information");
      return res.json();
    },
  });
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    linkedinUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    description: "",
    visionStatement: "",
    missionStatement: ""
  });
  
  // Set form data when university info is loaded
  useEffect(() => {
    if (universityInfo) {
      setFormData({
        name: universityInfo.name || "",
        address: universityInfo.address || "",
        phone: universityInfo.phone || "",
        email: universityInfo.email || "",
        website: universityInfo.website || "",
        linkedinUrl: universityInfo.linkedinUrl || "",
        facebookUrl: universityInfo.facebookUrl || "",
        twitterUrl: universityInfo.twitterUrl || "",
        instagramUrl: universityInfo.instagramUrl || "",
        youtubeUrl: universityInfo.youtubeUrl || "",
        description: universityInfo.description || "",
        visionStatement: universityInfo.visionStatement || "",
        missionStatement: universityInfo.missionStatement || ""
      });
    }
  }, [universityInfo]);
  
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/university-info", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/university-info"], data);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "University information updated successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update university information",
        variant: "destructive",
      });
    },
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };
  
  const handleCancel = () => {
    // Reset form data to original values
    if (universityInfo) {
      setFormData({
        name: universityInfo.name || "",
        address: universityInfo.address || "",
        phone: universityInfo.phone || "",
        email: universityInfo.email || "",
        website: universityInfo.website || "",
        linkedinUrl: universityInfo.linkedinUrl || "",
        facebookUrl: universityInfo.facebookUrl || "",
        twitterUrl: universityInfo.twitterUrl || "",
        instagramUrl: universityInfo.instagramUrl || "",
        youtubeUrl: universityInfo.youtubeUrl || "",
        description: universityInfo.description || "",
        visionStatement: universityInfo.visionStatement || "",
        missionStatement: universityInfo.missionStatement || ""
      });
    }
    setIsEditing(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>Failed to load university information</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!universityInfo) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>University Information</CardTitle>
          <CardDescription>No information available</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>About Vignan University</CardTitle>
        <CardDescription>Contact information and details</CardDescription>
        {user?.isAdmin && !isEditing && (
          <Button onClick={() => setIsEditing(true)} className="mt-2">
            Edit Information
          </Button>
        )}
      </CardHeader>
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vision & Mission</h3>
              
              <div className="space-y-2">
                <Label htmlFor="visionStatement">Vision Statement</Label>
                <Textarea
                  id="visionStatement"
                  name="visionStatement"
                  value={formData.visionStatement}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="missionStatement">Mission Statement</Label>
                <Textarea
                  id="missionStatement"
                  name="missionStatement"
                  value={formData.missionStatement}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Media</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.linkedin.com/school/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input
                    id="facebookUrl"
                    name="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.facebook.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter</Label>
                  <Input
                    id="twitterUrl"
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.instagram.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube</Label>
                  <Input
                    id="youtubeUrl"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.youtube.com/c/..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{universityInfo.name}</h3>
              {universityInfo.description && (
                <p className="text-sm text-muted-foreground">
                  {universityInfo.description}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {universityInfo.address && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Address</h4>
                  <p className="text-sm">{universityInfo.address}</p>
                </div>
              )}
              
              {universityInfo.email && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Email</h4>
                  <p className="text-sm">
                    <a 
                      href={`mailto:${universityInfo.email}`} 
                      className="text-primary hover:underline"
                    >
                      {universityInfo.email}
                    </a>
                  </p>
                </div>
              )}
              
              {universityInfo.phone && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Phone</h4>
                  <p className="text-sm">
                    <a 
                      href={`tel:${universityInfo.phone}`} 
                      className="text-primary hover:underline"
                    >
                      {universityInfo.phone}
                    </a>
                  </p>
                </div>
              )}
              
              {universityInfo.website && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Website</h4>
                  <p className="text-sm">
                    <a 
                      href={universityInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      {universityInfo.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {(universityInfo.visionStatement || universityInfo.missionStatement) && (
            <>
              <Separator />
              
              <div className="space-y-4">
                {universityInfo.visionStatement && (
                  <div className="space-y-1">
                    <h3 className="text-md font-semibold">Our Vision</h3>
                    <p className="text-sm">{universityInfo.visionStatement}</p>
                  </div>
                )}
                
                {universityInfo.missionStatement && (
                  <div className="space-y-1">
                    <h3 className="text-md font-semibold">Our Mission</h3>
                    <p className="text-sm">{universityInfo.missionStatement}</p>
                  </div>
                )}
              </div>
            </>
          )}
          
          {(universityInfo.linkedinUrl || 
            universityInfo.facebookUrl || 
            universityInfo.twitterUrl || 
            universityInfo.instagramUrl || 
            universityInfo.youtubeUrl) && (
            <>
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-md font-semibold">Connect With Us</h3>
                <div className="flex flex-wrap gap-3">
                  {universityInfo.linkedinUrl && (
                    <a 
                      href={universityInfo.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                      aria-label="LinkedIn"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                  
                  {universityInfo.facebookUrl && (
                    <a 
                      href={universityInfo.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-800 text-white hover:bg-blue-900"
                      aria-label="Facebook"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </a>
                  )}
                  
                  {universityInfo.twitterUrl && (
                    <a 
                      href={universityInfo.twitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600"
                      aria-label="Twitter"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </a>
                  )}
                  
                  {universityInfo.instagramUrl && (
                    <a 
                      href={universityInfo.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white"
                      aria-label="Instagram"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  
                  {universityInfo.youtubeUrl && (
                    <a 
                      href={universityInfo.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                      aria-label="YouTube"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}