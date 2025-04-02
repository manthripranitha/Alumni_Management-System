import { Link } from "wouter";
import { formatDistance } from "date-fns";
import { Briefcase, MapPin, Building2, ArrowUpRight, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string;
    applicationProcess: string;
    postedAt: Date;
    expiresAt?: Date | null;
  };
}

export function JobCard({ job }: JobProps) {
  const postedDate = new Date(job.postedAt);
  const timeAgo = formatDistance(postedDate, new Date(), { addSuffix: true });
  const isNew = new Date().getTime() - postedDate.getTime() < 3 * 24 * 60 * 60 * 1000; // 3 days
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link href={`/jobs/${job.id}`}>
              <CardTitle className="text-xl hover:text-primary hover:underline cursor-pointer">
                {job.title}
              </CardTitle>
            </Link>
            <div className="flex items-center mt-1">
              <Building2 className="h-4 w-4 mr-1 text-gray-500" />
              <CardDescription>{job.company}</CardDescription>
            </div>
          </div>
          {isNew && (
            <Badge className="bg-green-100 text-green-800">New</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 flex-grow">
        <div className="flex items-center mb-4 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          {job.location}
          <span className="mx-2">•</span>
          <span>{timeAgo}</span>
        </div>
        
        <p className="text-sm text-gray-700 line-clamp-3">{job.description}</p>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <Link href={`/jobs/${job.id}`} className="text-primary hover:text-primary-dark font-medium text-sm">
          View Details
        </Link>
        
        <Button size="sm" variant="outline" className="gap-1">
          <FileText className="h-4 w-4" />
          Apply
        </Button>
      </CardFooter>
    </Card>
  );
}

export function JobDetailCard({ job }: JobProps) {
  const postedDate = new Date(job.postedAt);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <div className="flex items-center mt-1">
              <Building2 className="h-4 w-4 mr-1 text-gray-500" />
              <CardDescription>{job.company}</CardDescription>
            </div>
          </div>
          
          {job.expiresAt && new Date(job.expiresAt) > new Date() ? (
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          ) : (
            <Badge variant="outline">Expired</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            {job.location}
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-1 text-primary" />
            Posted {formatDistance(postedDate, new Date(), { addSuffix: true })}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Job Description</h3>
          <div className="text-gray-700 whitespace-pre-line">{job.description}</div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Requirements</h3>
          <div className="text-gray-700 whitespace-pre-line">{job.requirements}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">How to Apply</h3>
          <div className="text-gray-700 whitespace-pre-line mb-4">{job.applicationProcess}</div>
          
          <Button className="gap-2">
            Apply Now <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
