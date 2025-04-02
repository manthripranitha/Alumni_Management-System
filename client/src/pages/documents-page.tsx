import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Document, InsertDocument } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileText, FileImage, File, DownloadCloud, Trash2, Edit, MessageCircle } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Form schema for document upload
const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  documentType: z.string().min(1, "Document type is required"),
  fileUrl: z.string().min(1, "File is required"),
  fileType: z.string().min(1, "File type is required"),
  description: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  // Fetch user's documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  // Form for document upload
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      documentType: "",
      fileUrl: "",
      fileType: "",
      description: "",
    },
  });

  // Reset form when dialog is closed
  const resetForm = () => {
    form.reset();
    setFileBase64(null);
    setFileName("");
    setFileType("");
    setEditingDocument(null);
  };

  // Open form for editing a document
  const openEditForm = (document: Document) => {
    setEditingDocument(document);
    form.reset({
      title: document.title,
      documentType: document.documentType,
      fileUrl: document.fileUrl,
      fileType: document.fileType,
      description: document.description || "",
    });
    setFileBase64(null); // Don't show file preview when editing
    setFileName(document.fileUrl.split("/").pop() || "");
    setFileType(document.fileType);
    setUploadOpen(true);
  };

  // File upload handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Set file information
    setFileName(file.name);
    setFileType(file.type);

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFileBase64(base64);
      form.setValue("fileUrl", base64); // Set file data in form
      form.setValue("fileType", file.type); // Set file type in form
    };
    reader.readAsDataURL(file);
  };

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const res = await apiRequest("POST", "/api/documents", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
      setUploadOpen(false);
      resetForm();
      queryClient.invalidateQueries({queryKey: ["/api/documents"]});
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Document> }) => {
      const res = await apiRequest("PUT", `/api/documents/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document updated",
        description: "Your document has been updated successfully.",
      });
      setUploadOpen(false);
      resetForm();
      queryClient.invalidateQueries({queryKey: ["/api/documents"]});
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
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

  // Form submission handler
  const onSubmit = (values: DocumentFormValues) => {
    if (editingDocument) {
      // Update existing document
      const updateData: Partial<Document> = {
        title: values.title,
        documentType: values.documentType,
        description: values.description || null,
      };

      // Only include file data if it was changed
      if (fileBase64) {
        updateData.fileUrl = values.fileUrl;
        updateData.fileType = values.fileType;
      }

      updateMutation.mutate({ 
        id: editingDocument.id, 
        data: updateData 
      });
    } else {
      // Create new document
      uploadMutation.mutate({
        userId: user!.id,
        title: values.title,
        documentType: values.documentType,
        fileUrl: values.fileUrl,
        fileType: values.fileType,
        description: values.description || null,
      });
    }
  };

  // Get document icon based on file type
  const getDocumentIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (fileType.includes("image")) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
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
        <h1 className="text-3xl font-bold">My Documents</h1>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingDocument ? "Edit Document" : "Upload Document"}</DialogTitle>
              <DialogDescription>
                Upload your important documents like resume, certificates, and marksheets.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Document title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="resume">Resume</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                          <SelectItem value="marksheet">Marksheet</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a brief description of the document"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document File</FormLabel>
                      <FormControl>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Input 
                            type="file" 
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a PDF, JPG, or PNG file (max 5MB)
                      </FormDescription>
                      <FormMessage />
                      {fileName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getDocumentIcon(fileType)}
                          <span>{fileName}</span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setUploadOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={uploadMutation.isPending || updateMutation.isPending}
                  >
                    {(uploadMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingDocument ? "Update Document" : "Upload Document"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="resume">Resumes</TabsTrigger>
          <TabsTrigger value="certificate">Certificates</TabsTrigger>
          <TabsTrigger value="marksheet">Marksheets</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        {["all", "resume", "certificate", "marksheet", "other"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-6">
            {!documents || documents.length === 0 ? (
              <div className="text-center py-8">
                <File className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No documents found</h3>
                <p className="text-sm text-muted-foreground">
                  {tabValue === "all" 
                    ? "You haven't uploaded any documents yet."
                    : `You haven't uploaded any ${tabValue}s yet.`}
                </p>
                <Button className="mt-4" onClick={() => setUploadOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {documents
                  .filter(doc => tabValue === "all" || doc.documentType === tabValue)
                  .map((document) => (
                    <Card key={document.id} className="overflow-hidden flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl truncate">{document.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {new Date(document.uploadedAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          {getStatusBadge(document.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex items-center mb-3">
                          {getDocumentIcon(document.fileType)}
                          <span className="ml-2 text-sm font-medium capitalize">{document.documentType}</span>
                        </div>
                        {document.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{document.description}</p>
                        )}
                        {document.adminFeedback && document.status !== "approved" && (
                          <div className="mt-3 p-2 bg-muted rounded-md text-sm">
                            <p className="font-medium">Admin Feedback:</p>
                            <p className="text-muted-foreground">{document.adminFeedback}</p>
                          </div>
                        )}
                      </CardContent>
                      <Separator />
                      <CardFooter className="p-3 flex justify-between">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={document.fileUrl} download target="_blank" rel="noopener noreferrer">
                              <DownloadCloud className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditForm(document)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
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
                                {deleteMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}