import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { PageLayout } from "@/components/layout/page-layout";
import { JobDetailCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, Briefcase } from "lucide-react";

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const jobId = parseInt(params.id);

  // Fetch job details
  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: [`/api/jobs/${jobId}`],
  });

  // Handle back to jobs list
  const handleBackToJobs = () => {
    setLocation("/jobs");
  };

  // Loading state
  if (isLoading) {
    return (
      <PageLayout title="Job Details">
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="p-4">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-10 w-32 mt-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <PageLayout title="Job Details">
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium text-gray-900">Job not found</h3>
          <p className="mt-1 text-gray-500">
            The job posting you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-6" onClick={handleBackToJobs}>
            Back to Job Board
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={job.title}>
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/jobs">Jobs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{job.title}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-6">
        <Button variant="outline" onClick={handleBackToJobs} className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Job Board
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <JobDetailCard job={job} />
      </div>
    </PageLayout>
  );
}