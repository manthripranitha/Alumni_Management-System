
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, GraduationCap, Building, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AlumniDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter out admin users and apply search/filters
  const alumni = users.filter(user => {
    if (user.isAdmin) return false;

    const matchesSearch = searchQuery.toLowerCase() === "" || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear = yearFilter === "" || 
      user.graduationYear?.toString() === yearFilter;

    const matchesDepartment = departmentFilter === "" || 
      user.degree?.toLowerCase().includes(departmentFilter.toLowerCase());

    return matchesSearch && matchesYear && matchesDepartment;
  });

  return (
    <PageLayout title="Alumni Directory">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Search Alumni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Input
              placeholder="Graduation Year"
              type="number"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            />
            <Input
              placeholder="Department/Degree"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alumni.map((alumnus) => (
          <Card key={alumnus.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={alumnus.profileImage || ""} />
                  <AvatarFallback>
                    {alumnus.firstName.charAt(0)}{alumnus.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-medium">{alumnus.firstName} {alumnus.lastName}</h3>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    {alumnus.degree} ({alumnus.graduationYear})
                  </div>
                  {alumnus.company && (
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {alumnus.company}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    window.history.pushState({}, '', `/messages?user=${alumnus.id}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alumni.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No alumni found matching your search criteria.</p>
        </div>
      )}
    </PageLayout>
  );
}
