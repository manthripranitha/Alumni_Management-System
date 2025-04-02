import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { DiscussionCard } from "@/components/forum/discussion-card";
import { DiscussionForm } from "@/components/forum/discussion-form";
import { Discussion, Reply, User, InsertDiscussion } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Search, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForumPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch discussions
  const { data: discussions = [], isLoading: isLoadingDiscussions } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
  });
  
  // Fetch replies to count them
  const { data: replies = [] } = useQuery<Reply[]>({
    queryKey: ["/api/replies"],
  });
  
  // Fetch users to display names
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Create discussion mutation
  const createDiscussionMutation = useMutation({
    mutationFn: async (discussion: InsertDiscussion) => {
      const res = await apiRequest("POST", "/api/discussions", discussion);
      return await res.json();
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({
        title: "Discussion created",
        description: "Your discussion has been posted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create discussion",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Process discussions with additional data
  const processedDiscussions = discussions.map(discussion => {
    const replyCount = replies.filter(reply => reply.discussionId === discussion.id).length;
    const creator = users.find(user => user.id === discussion.createdBy);
    
    return {
      ...discussion,
      replyCount,
      createdBy: creator ? {
        id: creator.id,
        firstName: creator.firstName,
        lastName: creator.lastName,
        profileImage: creator.profileImage
      } : {
        id: 0,
        firstName: "",
        lastName: "",
        profileImage: null
      }
    };
  });
  
  // Sort discussions by date (newest first)
  const sortedDiscussions = [...processedDiscussions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Filter by search query
  const filteredDiscussions = sortedDiscussions.filter(discussion => 
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${discussion.createdBy.firstName} ${discussion.createdBy.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get recent and popular discussions
  const recentDiscussions = filteredDiscussions.slice(0, 10);
  const popularDiscussions = [...filteredDiscussions]
    .sort((a, b) => b.replyCount - a.replyCount)
    .slice(0, 10);
  
  // Handle discussion creation
  const handleCreateDiscussion = (values: InsertDiscussion) => {
    createDiscussionMutation.mutate(values);
  };
  
  // Loading state
  if (isLoadingDiscussions) {
    return (
      <PageLayout title="Discussion Forum">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Discussion Forum">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Discussion
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
              <DialogDescription>
                Create a new topic to discuss with other alumni
              </DialogDescription>
            </DialogHeader>
            <DiscussionForm 
              onSubmit={handleCreateDiscussion} 
              isSubmitting={createDiscussionMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Recent Discussions</TabsTrigger>
          <TabsTrigger value="popular">Popular Discussions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          {recentDiscussions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentDiscussions.map(discussion => (
                <DiscussionCard key={discussion.id} discussion={discussion} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No discussions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search" 
                  : "Be the first to start a discussion!"}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="popular">
          {popularDiscussions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularDiscussions.map(discussion => (
                <DiscussionCard key={discussion.id} discussion={discussion} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No discussions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search" 
                  : "Be the first to start a discussion!"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
