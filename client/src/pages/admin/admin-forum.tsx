import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { DiscussionCard, DiscussionDetailCard, ReplyCard } from "@/components/forum/discussion-card";
import { Discussion, Reply, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Search, MessageSquareText, Lock, Unlock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdminForum() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "locked" | "detailed">("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  
  // Fetch discussions
  const { data: discussions = [], isLoading: isLoadingDiscussions } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
  });
  
  // Fetch replies
  const { data: replies = [], isLoading: isLoadingReplies } = useQuery<Reply[]>({
    queryKey: ["/api/replies"],
  });
  
  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Toggle lock discussion mutation
  const toggleLockMutation = useMutation({
    mutationFn: async ({ id, isLocked }: { id: number; isLocked: boolean }) => {
      const res = await apiRequest("PUT", `/api/discussions/${id}`, { isLocked });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({
        title: "Discussion updated",
        description: "The discussion lock status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update discussion",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete discussion mutation
  const deleteDiscussionMutation = useMutation({
    mutationFn: async (discussionId: number) => {
      await apiRequest("DELETE", `/api/discussions/${discussionId}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedDiscussion(null);
      setViewMode("all");
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({
        title: "Discussion deleted",
        description: "The discussion has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete discussion",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete reply mutation
  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: number) => {
      await apiRequest("DELETE", `/api/replies/${replyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/replies"] });
      toast({
        title: "Reply deleted",
        description: "The reply has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Process discussions with creator info and reply counts
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
  
  // Process replies with creator info
  const processedReplies = replies.map(reply => {
    const creator = users.find(user => user.id === reply.createdBy);
    
    return {
      ...reply,
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
  
  // Filter discussions by search query
  const filteredDiscussions = processedDiscussions.filter(discussion => 
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${discussion.createdBy.firstName} ${discussion.createdBy.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort discussions by date (newest first)
  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get appropriate discussion list based on view mode
  const discussionsToShow = viewMode === "locked" 
    ? sortedDiscussions.filter(d => d.isLocked)
    : sortedDiscussions;
  
  // Get replies for selected discussion
  const selectedDiscussionReplies = selectedDiscussion 
    ? processedReplies
        .filter(reply => reply.discussionId === selectedDiscussion.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];
  
  // Handle toggle lock
  const handleToggleLock = (discussion: Discussion) => {
    toggleLockMutation.mutate({
      id: discussion.id,
      isLocked: !discussion.isLocked,
    });
  };
  
  // Handle delete discussion
  const handleDeleteDiscussion = () => {
    if (selectedDiscussion) {
      deleteDiscussionMutation.mutate(selectedDiscussion.id);
    }
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setIsDeleteDialogOpen(true);
  };
  
  // View discussion details
  const viewDiscussionDetails = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setViewMode("detailed");
  };
  
  // Loading state
  if (isLoadingDiscussions || isLoadingReplies) {
    return (
      <PageLayout title="Manage Forum">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <Skeleton className="h-10 w-full mb-6" />
        
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
    <PageLayout title="Manage Forum">
      {viewMode === "detailed" && selectedDiscussion ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setViewMode("all");
                setSelectedDiscussion(null);
              }}
            >
              Back to All Discussions
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => handleToggleLock(selectedDiscussion)}
                className={selectedDiscussion.isLocked ? "text-amber-600" : "text-gray-600"}
              >
                {selectedDiscussion.isLocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-1" />
                    Unlock
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-1" />
                    Lock
                  </>
                )}
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={() => openDeleteDialog(selectedDiscussion)}
              >
                Delete Discussion
              </Button>
            </div>
          </div>
          
          <DiscussionDetailCard 
            discussion={processedDiscussions.find(d => d.id === selectedDiscussion.id)!}
          />
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Replies ({selectedDiscussionReplies.length})</h3>
            
            {selectedDiscussionReplies.length > 0 ? (
              <div className="space-y-4">
                {selectedDiscussionReplies.map(reply => (
                  <ReplyCard 
                    key={reply.id} 
                    reply={reply}
                    onDelete={() => deleteReplyMutation.mutate(reply.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No replies to this discussion yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                All Discussions
              </TabsTrigger>
              <TabsTrigger value="locked" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Locked Discussions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {discussionsToShow.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {discussionsToShow.map(discussion => (
                    <DiscussionCard 
                      key={discussion.id} 
                      discussion={discussion}
                      onLockToggle={() => handleToggleLock(discussion)}
                      onDelete={() => openDeleteDialog(discussion)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquareText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No discussions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery 
                      ? "Try adjusting your search" 
                      : "There are no discussions yet"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="locked">
              {discussionsToShow.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {discussionsToShow.map(discussion => (
                    <DiscussionCard 
                      key={discussion.id} 
                      discussion={discussion}
                      onLockToggle={() => handleToggleLock(discussion)}
                      onDelete={() => openDeleteDialog(discussion)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No locked discussions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery 
                      ? "Try adjusting your search" 
                      : "There are no locked discussions yet"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the discussion "{selectedDiscussion?.title}" and all its replies.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDiscussion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDiscussionMutation.isPending ? "Deleting..." : "Delete Discussion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
