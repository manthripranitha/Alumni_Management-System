import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Document, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, FileImage, File, DownloadCloud, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDocumentsPage() {
  const { toast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  // Fetch all users
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Approve document mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, feedback }: { id: number; feedback?: string }) => {
      const res = await apiRequest("PUT", `/api/documents/${id}`, {
        status: "approved",
        adminFeedback: feedback || null,
        updatedAt: new Date(),
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document approved",
        description: "The document has been approved successfully.",
      });
      setFeedbackOpen(false);
      setFeedback("");
      setSelectedDocument(null);
      queryClient.invalidateQueries({queryKey: ["/api/documents"]});
    },
    onError: (error: Error) => {
      toast({
        title: "Approval failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Reject document mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, feedback }: { id: number; feedback: string }) => {
      const res = await apiRequest("PUT", `/api/documents/${id}`, {
        status: "rejected",
        adminFeedback: feedback,
        updatedAt: new Date(),
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document rejected",
        description: "The document has been rejected successfully.",
      });
      setFeedbackOpen(false);
      setFeedback("");
      setSelectedDocument(null);
      queryClient.invalidateQueries({queryKey: ["/api/documents"]});
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      });
      queryClient.invalidateQueries({queryKey: ["/api/documents"]});
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Open feedback dialog
  const openFeedbackDialog = (document: Document, action: 'approve' | 'reject') => {
    setSelectedDocument(document);
    setFeedbackOpen(true);
    setFeedback(document.adminFeedback || "");
  };
  
  // Submit feedback
  const submitFeedback = (action: 'approve' | 'reject') => {
    if (!selectedDocument) return;
    
    if (action === 'approve') {
      approveMutation.mutate({
        id: selectedDocument.id,
        feedback: feedback.trim() || undefined,
      });
    } else {
      if (!feedback.trim()) {
        toast({
          title: "Feedback required",
          description: "Please provide feedback for the rejection.",
          variant: "destructive",
        });
        return;
      }
      
      rejectMutation.mutate({
        id: selectedDocument.id,
        feedback: feedback,
      });
    }
  };
  
  // Get document icon based on file type
  const getDocumentIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (fileType.includes("image")) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get badge color based on document status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  // Get user name from ID
  const getUserName = (userId: number) => {
    const user = users?.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : `User #${userId}`;
  };
  
  // Filter documents by search query
  const filteredDocuments = documents?.filter(doc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const userName = getUserName(doc.userId).toLowerCase();
    
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.documentType.toLowerCase().includes(query) ||
      userName.includes(query) ||
      (doc.description && doc.description.toLowerCase().includes(query))
    );
  });
  
  // Group documents by status for tab display
  const pendingDocuments = filteredDocuments?.filter(doc => doc.status === "pending") || [];
  const approvedDocuments = filteredDocuments?.filter(doc => doc.status === "approved") || [];
  const rejectedDocuments = filteredDocuments?.filter(doc => doc.status === "rejected") || [];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <div className="w-1/3">
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All Documents
            {filteredDocuments && <Badge variant="outline" className="ml-2">{filteredDocuments.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Review
            {pendingDocuments && <Badge variant="outline" className="ml-2">{pendingDocuments.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            {approvedDocuments && <Badge variant="outline" className="ml-2">{approvedDocuments.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {rejectedDocuments && <Badge variant="outline" className="ml-2">{rejectedDocuments.length}</Badge>}
          </TabsTrigger>
        </TabsList>
        
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {!filteredDocuments || filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <File className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No documents found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search query." : "There are no documents to display."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableCaption>
                    {tab === 'all' 
                      ? 'All documents from alumni'
                      : tab === 'pending'
                        ? 'Documents pending review'
                        : tab === 'approved'
                          ? 'Approved documents'
                          : 'Rejected documents'}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments
                      .filter(doc => tab === 'all' || doc.status === tab)
                      .map((document) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getDocumentIcon(document.fileType)}
                              <span>{document.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{document.documentType}</span>
                          </TableCell>
                          <TableCell>{getUserName(document.userId)}</TableCell>
                          <TableCell>{new Date(document.uploadedAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(document.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(document.fileUrl)}
                              >
                                <DownloadCloud className="h-4 w-4" />
                              </Button>
                              
                              {document.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-500 border-green-500"
                                    onClick={() => openFeedbackDialog(document, 'approve')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 border-red-500"
                                    onClick={() => openFeedbackDialog(document, 'reject')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive">
                                    <Loader2 className={`h-4 w-4 ${deleteMutation.isPending ? "animate-spin" : "hidden"}`} />
                                    <span className={deleteMutation.isPending ? "hidden" : ""}>Delete</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the document.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(document.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Document Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{`Review Document: ${selectedDocument?.title}`}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.status === "pending" ? 
                "Provide optional feedback for this document." :
                "Update feedback for this document."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedDocument && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>{selectedDocument.title}</CardTitle>
                  <CardDescription>
                    {`Submitted by ${getUserName(selectedDocument.userId)} on ${new Date(selectedDocument.uploadedAt).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-3">
                    {getDocumentIcon(selectedDocument.fileType)}
                    <span className="ml-2 text-sm font-medium capitalize">{selectedDocument.documentType}</span>
                  </div>
                  {selectedDocument.description && (
                    <p className="text-sm text-muted-foreground">{selectedDocument.description}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedDocument.fileUrl)}
                    className="w-full"
                  >
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    View Document
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                Feedback
              </label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFeedbackOpen(false);
                  setSelectedDocument(null);
                  setFeedback("");
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => submitFeedback('approve')}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
              </Button>
              <Button
                variant="outline"
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                onClick={() => submitFeedback('reject')}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}