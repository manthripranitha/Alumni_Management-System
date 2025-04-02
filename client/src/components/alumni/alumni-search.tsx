import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, UserRound, Building, GraduationCap, Loader2, Mail, Phone } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function AlumniSearch() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/users/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }
      
      const res = await fetch(`/api/users/search/${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to search alumni");
      return res.json();
    },
    enabled: isSearching && searchTerm.trim().length >= 2,
  });
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim().length < 2) {
      toast({
        title: "Search Term Too Short",
        description: "Please enter at least 2 characters to search",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    await refetch();
  };
  
  const handleViewProfile = (alumni: any) => {
    setSelectedAlumni(alumni);
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return (firstName?.[0] || "") + (lastName?.[0] || "");
  };
  
  const filteredResults = searchResults?.filter((alumni: any) => !alumni.isAdmin) || [];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alumni Search</CardTitle>
          <CardDescription>Find alumni by name</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search alumni by name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || searchTerm.trim().length < 2}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isSearching && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {filteredResults.length === 0
                ? "No alumni found"
                : `Found ${filteredResults.length} alumni`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="py-4 text-center text-destructive">
                An error occurred while searching
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No alumni found matching "{searchTerm}"
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((alumni: any) => (
                  <Card key={alumni.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="flex items-center p-4 sm:w-1/4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={alumni.profileImage || undefined} alt={`${alumni.firstName} ${alumni.lastName}`} />
                          <AvatarFallback className="text-lg">
                            {getInitials(alumni.firstName, alumni.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <h3 className="font-medium">
                            {alumni.firstName} {alumni.lastName}
                          </h3>
                          {alumni.graduationYear && (
                            <p className="text-sm text-muted-foreground">
                              Class of {alumni.graduationYear}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t sm:border-l sm:border-t-0 flex-1 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {alumni.degree && (
                            <div className="flex items-center">
                              <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {alumni.degree}
                                {alumni.branch ? ` in ${alumni.branch}` : ""}
                              </span>
                            </div>
                          )}
                          
                          {alumni.company && (
                            <div className="flex items-center">
                              <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {alumni.position ? `${alumni.position} at ` : ""}
                                {alumni.company}
                              </span>
                            </div>
                          )}
                          
                          {alumni.email && (
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm truncate">
                                {alumni.email}
                              </span>
                            </div>
                          )}
                          
                          {alumni.phone && (
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {alumni.phone}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleViewProfile(alumni)}>
                                View Profile
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Alumni Profile</DialogTitle>
                                <DialogDescription>Detailed information about this alumnus</DialogDescription>
                              </DialogHeader>
                              
                              {selectedAlumni && (
                                <div className="space-y-6 py-4">
                                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                    <Avatar className="h-24 w-24">
                                      <AvatarImage src={selectedAlumni.profileImage || undefined} alt={`${selectedAlumni.firstName} ${selectedAlumni.lastName}`} />
                                      <AvatarFallback className="text-2xl">
                                        {getInitials(selectedAlumni.firstName, selectedAlumni.lastName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="text-center sm:text-left">
                                      <h2 className="text-2xl font-bold">
                                        {selectedAlumni.firstName} {selectedAlumni.lastName}
                                      </h2>
                                      
                                      {selectedAlumni.position && selectedAlumni.company && (
                                        <p className="text-lg text-muted-foreground">
                                          {selectedAlumni.position} at {selectedAlumni.company}
                                        </p>
                                      )}
                                      
                                      {(selectedAlumni.city || selectedAlumni.country) && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {[
                                            selectedAlumni.city,
                                            selectedAlumni.state,
                                            selectedAlumni.country,
                                          ]
                                            .filter(Boolean)
                                            .join(", ")}
                                        </p>
                                      )}
                                      
                                      <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                                        {selectedAlumni.graduationYear && (
                                          <Badge variant="outline">
                                            Class of {selectedAlumni.graduationYear}
                                          </Badge>
                                        )}
                                        
                                        {selectedAlumni.degree && (
                                          <Badge variant="outline">
                                            {selectedAlumni.degree}
                                          </Badge>
                                        )}
                                        
                                        {selectedAlumni.branch && (
                                          <Badge variant="outline">
                                            {selectedAlumni.branch}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                      <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                                      <div className="space-y-2">
                                        {selectedAlumni.email && (
                                          <div className="flex items-center">
                                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <a 
                                              href={`mailto:${selectedAlumni.email}`}
                                              className="text-primary hover:underline"
                                            >
                                              {selectedAlumni.email}
                                            </a>
                                          </div>
                                        )}
                                        
                                        {selectedAlumni.phone && (
                                          <div className="flex items-center">
                                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <a 
                                              href={`tel:${selectedAlumni.phone}`}
                                              className="text-primary hover:underline"
                                            >
                                              {selectedAlumni.phone}
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h3 className="text-lg font-semibold mb-2">Social Profiles</h3>
                                      <div className="space-y-2">
                                        {selectedAlumni.linkedinProfile && (
                                          <div className="flex items-center">
                                            <svg className="mr-2 h-4 w-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                            <a 
                                              href={selectedAlumni.linkedinProfile} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              LinkedIn Profile
                                            </a>
                                          </div>
                                        )}
                                        
                                        {selectedAlumni.instagramUsername && (
                                          <div className="flex items-center">
                                            <svg className="mr-2 h-4 w-4 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                            </svg>
                                            <a 
                                              href={`https://instagram.com/${selectedAlumni.instagramUsername}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              @{selectedAlumni.instagramUsername}
                                            </a>
                                          </div>
                                        )}
                                        
                                        {/* Competitive Programming Profiles */}
                                        {selectedAlumni.codechefProfile && (
                                          <div className="flex items-center">
                                            <span className="mr-2 h-4 w-4 flex items-center justify-center text-muted-foreground font-bold">C</span>
                                            <a 
                                              href={`https://www.codechef.com/users/${selectedAlumni.codechefProfile}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              CodeChef
                                            </a>
                                          </div>
                                        )}
                                        
                                        {selectedAlumni.hackerRankProfile && (
                                          <div className="flex items-center">
                                            <span className="mr-2 h-4 w-4 flex items-center justify-center text-muted-foreground font-bold">HR</span>
                                            <a 
                                              href={`https://www.hackerrank.com/${selectedAlumni.hackerRankProfile}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              HackerRank
                                            </a>
                                          </div>
                                        )}
                                        
                                        {selectedAlumni.hackerEarthProfile && (
                                          <div className="flex items-center">
                                            <span className="mr-2 h-4 w-4 flex items-center justify-center text-muted-foreground font-bold">HE</span>
                                            <a 
                                              href={`https://www.hackerearth.com/@${selectedAlumni.hackerEarthProfile}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              HackerEarth
                                            </a>
                                          </div>
                                        )}
                                        
                                        {selectedAlumni.leetcodeProfile && (
                                          <div className="flex items-center">
                                            <span className="mr-2 h-4 w-4 flex items-center justify-center text-muted-foreground font-bold">LC</span>
                                            <a 
                                              href={`https://leetcode.com/${selectedAlumni.leetcodeProfile}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              LeetCode
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div className="space-y-4">
                                    {selectedAlumni.bio && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-2">About</h3>
                                        <p className="text-sm">{selectedAlumni.bio}</p>
                                      </div>
                                    )}
                                    
                                    {(selectedAlumni.skills || selectedAlumni.specialSkills) && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-2">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedAlumni.skills && selectedAlumni.skills.split(',').map((skill: string, i: number) => (
                                            <Badge key={i} variant="secondary">
                                              {skill.trim()}
                                            </Badge>
                                          ))}
                                        </div>
                                        
                                        {selectedAlumni.specialSkills && (
                                          <div className="mt-2">
                                            <h4 className="text-sm font-medium mb-1">Special Skills</h4>
                                            <p className="text-sm">{selectedAlumni.specialSkills}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {selectedAlumni.achievements && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-2">Achievements</h3>
                                        <p className="text-sm">{selectedAlumni.achievements}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}