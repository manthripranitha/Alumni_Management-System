import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { JobCard, JobDetailCard } from "@/components/jobs/job-card";
import { JobForm } from "@/components/jobs/job-form";
import { Job, InsertJob } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Briefcase, CheckCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdminJobs() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Fetch jobs
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });
  
  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobData: InsertJob) => {
      const res = await apiRequest("POST", "/api/jobs", jobData);
      return await res.json();
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job posted",
        description: "The job has been posted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Job> }) => {
      const res = await apiRequest("PUT", `/api/jobs/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job updated",
        description: "The job posting has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job deleted",
        description: "The job posting has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter and sort jobs
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Separate active and expired jobs
  const now = new Date();
  const activeJobs = filteredJobs
    .filter(job => !job.expiresAt || new Date(job.expiresAt) > now)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  
  const expiredJobs = filteredJobs
    .filter(job => job.expiresAt && new Date(job.expiresAt) <= now)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  
  // Handle job creation
  const handleCreateJob = (values: any) => {
    createJobMutation.mutate({
      ...values,
      postedBy: 1, // Admin user ID
    });
  };
  
  // Handle job edit
  const handleEditJob = (values: any) => {
    if (!selectedJob) return;
    
    updateJobMutation.mutate({
      id: selectedJob.id,
      data: values,
    });
  };
  
  // Handle job deletion
  const handleDeleteJob = () => {
    if (selectedJob) {
      deleteJobMutation.mutate(selectedJob.id);
    }
  };
  
  // Open edit dialog
  const openEditDialog = (job: Job) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <PageLayout title="Manage Jobs">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Manage Jobs">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Post New Job</DialogTitle>
              <DialogDescription>
                Create a new job posting for alumni
              </DialogDescription>
            </DialogHeader>
            <JobForm
              mode="create"
              onSubmit={handleCreateJob}
              isSubmitting={createJobMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Active Jobs
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Expired Jobs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activeJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeJobs.map(job => (
                <div key={job.id} className="relative group">
                  <JobCard job={job} />
                  <div className="absolute top-4 right-4 bg-white rounded-md shadow p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditDialog(job)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => openDeleteDialog(job)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No active jobs</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search" 
                  : "Post your first job to get started"}
              </p>
              {!searchQuery && (
                <Button 
                  className="mt-4 gap-2" 
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Post New Job
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="expired">
          {expiredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expiredJobs.map(job => (
                <div key={job.id} className="relative group">
                  <JobCard job={job} />
                  <div className="absolute top-4 right-4 bg-white rounded-md shadow p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditDialog(job)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => openDeleteDialog(job)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No expired jobs</h3>
              <p className="mt-1 text-sm text-gray-500">
                Expired job postings will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Edit Job Dialog */}
      {selectedJob && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>
                Update the details for this job posting
              </DialogDescription>
            </DialogHeader>
            <JobForm
              mode="edit"
              defaultValues={{
                title: selectedJob.title,
                company: selectedJob.company,
                location: selectedJob.location,
                description: selectedJob.description,
                requirements: selectedJob.requirements,
                applicationProcess: selectedJob.applicationProcess,
                expiresAt: selectedJob.expiresAt ? new Date(selectedJob.expiresAt) : undefined
              }}
              onSubmit={handleEditJob}
              isSubmitting={updateJobMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job posting "{selectedJob?.title}" at {selectedJob?.company}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteJobMutation.isPending ? "Deleting..." : "Delete Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
