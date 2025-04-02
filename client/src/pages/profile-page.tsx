import { useMutation, useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { ProfileForm } from "@/components/profile/profile-form";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch latest user data
  const { data: userData, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    initialData: user || undefined,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<User>) => {
      const res = await apiRequest("PUT", `/api/profile`, updatedProfile);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Loading state
  if (isLoading || !userData) {
    return (
      <PageLayout title="Your Profile">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }
  
  // Handle profile update
  const handleUpdateProfile = (values: Partial<User>) => {
    updateProfileMutation.mutate(values);
  };
  
  return (
    <PageLayout title="Your Profile">
      <ProfileForm
        user={userData}
        onSubmit={handleUpdateProfile}
        isSubmitting={updateProfileMutation.isPending}
      />
    </PageLayout>
  );
}
