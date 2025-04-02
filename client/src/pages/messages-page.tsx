import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, User, InsertMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Clock, Check, Trash2, CheckCheck } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

// Form schema for messages
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
const [yearFilter, setYearFilter] = useState<string>("");
const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch all users
  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
  });

  // Fetch all messages for current user
  const { data: userMessages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds to get new messages
  });

  // Fetch conversation with selected user
  const { data: conversation, isLoading: loadingConversation } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedUserId],
    enabled: !!user && !!selectedUserId,
    refetchInterval: 5000, // Refetch every 5 seconds when in a conversation
  });

  // Form for sending messages
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({queryKey: ["/api/messages"]});
      queryClient.invalidateQueries({queryKey: ["/api/conversations", selectedUserId]});
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/messages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
      queryClient.invalidateQueries({queryKey: ["/api/messages"]});
      queryClient.invalidateQueries({queryKey: ["/api/conversations", selectedUserId]});
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Handle form submission
  const onSubmit = (values: MessageFormValues) => {
    if (!selectedUserId || !user) return;
    
    sendMessageMutation.mutate({
      senderId: user.id,
      receiverId: selectedUserId,
      content: values.content,
    });
  };

  // Get conversation partner details
  const getPartnerDetails = (userId: number) => {
    if (!users) return null;
    const partner = users.find(u => u.id === userId);
    return partner;
  };

  // Get user initials for avatar
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Group users with conversations
  const conversationPartners = useMemo(() => {
    if (!userMessages || !users || !user) return [];
    
    // Get unique user IDs from conversations
    const partnerIds = new Set<number>();
    userMessages.forEach(msg => {
      if (msg.senderId !== user.id) partnerIds.add(msg.senderId);
      if (msg.receiverId !== user.id) partnerIds.add(msg.receiverId);
    });
    
    // Create conversation summary for each partner
    return Array.from(partnerIds).map(partnerId => {
      const partner = users.find(u => u.id === partnerId);
      if (!partner) return null;
      
      // Get messages with this partner
      const messagesWithPartner = userMessages.filter(
        msg => (msg.senderId === partnerId && msg.receiverId === user.id) || 
              (msg.senderId === user.id && msg.receiverId === partnerId)
      );
      
      // Sort by date
      messagesWithPartner.sort((a, b) => 
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
      
      // Get last message
      const lastMessage = messagesWithPartner[messagesWithPartner.length - 1];
      
      // Count unread messages
      const unreadCount = messagesWithPartner.filter(
        msg => msg.senderId === partnerId && !msg.isRead
      ).length;
      
      return {
        partner,
        lastMessage,
        unreadCount,
      };
    }).filter(Boolean)
      .sort((a, b) => {
        // Sort by last message date (newest first)
        return new Date(b!.lastMessage.sentAt).getTime() - 
               new Date(a!.lastMessage.sentAt).getTime();
      });
  }, [userMessages, users, user]);

  // Filter partners by search query
  const filteredPartners = conversationPartners.filter(partnerData => {
    if (!searchQuery || !partnerData) return true;
    
    const query = searchQuery.toLowerCase();
    const partner = partnerData.partner;
    
    const matchesSearch = !query || (
      partner.firstName.toLowerCase().includes(query) ||
      partner.lastName.toLowerCase().includes(query) ||
      partner.email.toLowerCase().includes(query) ||
      (partner.username && partner.username.toLowerCase().includes(query))
    );

    const matchesYear = !yearFilter || partner.graduationYear?.toString() === yearFilter;
    const matchesDepartment = !departmentFilter || partner.branch?.toLowerCase().includes(departmentFilter.toLowerCase());

    return matchesSearch && matchesYear && matchesDepartment;
  });

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loadingUsers || loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Contacts Panel */}
        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="px-4 py-3 space-y-2">
            <CardTitle className="text-xl">Conversations</CardTitle>
            <div className="space-y-2">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Graduation Year"
                  type="number"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-1/2"
                />
                <Input
                  placeholder="Department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-1/2"
                />
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0 flex-grow">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {filteredPartners.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No matching users found" : "No conversations yet"}
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredPartners.map((partnerData) => {
                    if (!partnerData) return null;
                    const { partner, lastMessage, unreadCount } = partnerData;
                    
                    return (
                      <div 
                        key={partner.id}
                        className={`flex items-center p-3 gap-3 hover:bg-accent cursor-pointer transition-colors border-b border-border ${
                          selectedUserId === partner.id ? "bg-accent" : ""
                        }`}
                        onClick={() => setSelectedUserId(partner.id)}
                      >
                        <Avatar>
                          <AvatarImage src={partner.profileImage || undefined} />
                          <AvatarFallback>
                            {getUserInitials(partner.firstName, partner.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm truncate">
                              {partner.firstName} {partner.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {formatMessageTime(lastMessage.sentAt)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground truncate mr-2">
                              {lastMessage.senderId === user?.id ? "You: " : ""}
                              {lastMessage.content}
                            </p>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="rounded-full h-5 min-w-5 flex items-center justify-center">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardFooter className="p-3">
            <p className="text-xs text-muted-foreground">
              Select a user to start messaging
            </p>
          </CardFooter>
        </Card>
        
        {/* Conversation Panel */}
        <Card className="md:col-span-2 lg:col-span-3 overflow-hidden flex flex-col">
          {!selectedUserId ? (
            <div className="flex-grow flex items-center justify-center text-muted-foreground">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <CardHeader className="px-4 py-3 flex flex-row items-center space-y-0 space-x-4">
                {loadingConversation ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getPartnerDetails(selectedUserId)?.profileImage || undefined} />
                      <AvatarFallback>
                        {getUserInitials(
                          getPartnerDetails(selectedUserId)?.firstName || "",
                          getPartnerDetails(selectedUserId)?.lastName || ""
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {getPartnerDetails(selectedUserId)?.firstName} {getPartnerDetails(selectedUserId)?.lastName}
                      </CardTitle>
                      <CardDescription>
                        {getPartnerDetails(selectedUserId)?.isAdmin ? "Admin" : "Alumni"}
                      </CardDescription>
                    </div>
                  </>
                )}
              </CardHeader>
              <Separator />
              <CardContent className="p-4 flex-grow overflow-hidden" ref={scrollAreaRef}>
                {loadingConversation ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !conversation || conversation.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-22rem)]">
                    <div className="space-y-4">
                      {conversation.map((message) => {
                        const isSentByMe = message.senderId === user?.id;
                        
                        return (
                          <div 
                            key={message.id}
                            className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                          >
                            <div className="flex group">
                              <div 
                                className={`rounded-lg px-4 py-2 max-w-[80%] relative ${
                                  isSentByMe 
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted rounded-tl-none"
                                }`}
                              >
                                <p>{message.content}</p>
                                <div className="flex items-center justify-end text-xs mt-1 gap-1">
                                  <span className={isSentByMe ? "text-primary-foreground/70" : "text-muted-foreground"}>
                                    {formatMessageTime(message.sentAt)}
                                  </span>
                                  {isSentByMe && (
                                    <span className="text-primary-foreground/70">
                                      {message.isRead ? (
                                        <CheckCheck className="h-3 w-3" />
                                      ) : (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </span>
                                  )}
                                </div>
                                {isSentByMe && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 absolute -right-7 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete message?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. The message will be deleted for both you and the recipient.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteMessageMutation.mutate(message.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          {deleteMessageMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : "Delete"}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <Separator />
              <CardFooter className="p-3">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full gap-2">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input
                              placeholder="Type a message..."
                              {...field}
                              disabled={sendMessageMutation.isPending}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </Form>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}