import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/page-layout";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreHorizontal, User as UserIcon, Users, GraduationCap, Mail, Briefcase, UserCog, Shield, ShieldAlert, Trash2, Phone, MapPin, Edit, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"all" | "admin" | "alumni">("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  
  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Make admin mutation
  const makeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("PUT", `/api/users/${userId}`, { isAdmin: true });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User updated",
        description: "User has been made an administrator.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Remove admin mutation
  const removeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("PUT", `/api/users/${userId}`, { isAdmin: false });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User updated",
        description: "Administrator privileges have been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number; userData: Partial<User> }) => {
      const res = await apiRequest("PUT", `/api/users/${data.id}`, data.userData);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      setIsEditing(false);
      setSelectedUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter users based on search and view type
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesViewType = viewType === "all" || 
      (viewType === "admin" && user.isAdmin) || 
      (viewType === "alumni" && !user.isAdmin);
    
    return matchesSearch && matchesViewType;
  });
  
  // Sort users by name
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
  });
  
  // Handle make admin
  const handleMakeAdmin = (user: User) => {
    makeAdminMutation.mutate(user.id);
  };
  
  // Handle remove admin
  const handleRemoveAdmin = (user: User) => {
    removeAdminMutation.mutate(user.id);
  };
  
  // Handle delete user
  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };
  
  // Open user details
  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false);
      setEditedUser({});
    } else {
      // Start editing - populate form with current user values
      if (selectedUser) {
        setEditedUser({
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          email: selectedUser.email,
          phone: selectedUser.phone || "",
          address: selectedUser.address || "",
          degree: selectedUser.degree || "",
          graduationYear: selectedUser.graduationYear ? selectedUser.graduationYear : null,
          company: selectedUser.company || "",
          position: selectedUser.position || "",
          bio: selectedUser.bio || "",
        });
        setIsEditing(true);
      }
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for graduation year (convert to number or null)
    if (name === 'graduationYear') {
      setEditedUser(prev => ({
        ...prev,
        [name]: value ? parseInt(value, 10) : null
      }));
    } else {
      setEditedUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Save user edits
  const saveUserEdits = () => {
    if (selectedUser && editedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        userData: editedUser
      });
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <PageLayout title="Manage Users">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-48" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map(i => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Manage Users">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users Management</CardTitle>
          <CardDescription>
            Manage alumni and administrator accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant={viewType === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewType("all")}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                All Users ({users.length})
              </Button>
              <Button 
                variant={viewType === "admin" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewType("admin")}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                Admins ({users.filter(u => u.isAdmin).length})
              </Button>
              <Button 
                variant={viewType === "alumni" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewType("alumni")}
                className="gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Alumni ({users.filter(u => !u.isAdmin).length})
              </Button>
            </div>
          </div>
          
          {sortedUsers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">User</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Avatar 
                          className="h-10 w-10 cursor-pointer" 
                          onClick={() => openUserDetails(user)}
                        >
                          <AvatarImage src={user.profileImage || ""} />
                          <AvatarFallback>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell 
                        className="font-medium cursor-pointer hover:underline"
                        onClick={() => openUserDetails(user)}
                      >
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Administrator
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Alumni
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openUserDetails(user)}>
                              <UserIcon className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isAdmin ? (
                              <DropdownMenuItem onClick={() => handleRemoveAdmin(user)}>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Remove Admin Role
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleMakeAdmin(user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Make Administrator
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search" 
                  : "No users match the selected filters"}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {sortedUsers.length} out of {users.length} total users
          </div>
        </CardFooter>
      </Card>
      
      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View detailed information about {selectedUser.firstName} {selectedUser.lastName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedUser.profileImage || ""} />
                  <AvatarFallback className="text-2xl">
                    {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                </div>
                
                <Badge className={selectedUser.isAdmin ? "bg-blue-100 text-blue-800" : "bg-gray-100"}>
                  {selectedUser.isAdmin ? "Administrator" : "Alumni"}
                </Badge>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={editedUser.firstName || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={editedUser.lastName || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={editedUser.email || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={editedUser.phone || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input
                              id="address"
                              name="address"
                              value={editedUser.address || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{selectedUser.email}</span>
                        </div>
                        
                        {selectedUser.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedUser.phone}</span>
                          </div>
                        )}
                        
                        {selectedUser.address && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedUser.address}</span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Education & Work</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="degree">Degree</Label>
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input
                              id="degree"
                              name="degree"
                              value={editedUser.degree || ""}
                              onChange={handleInputChange}
                              placeholder="e.g. Bachelor of Science in Computer Science"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear">Graduation Year</Label>
                          <Input
                            id="graduationYear"
                            name="graduationYear"
                            type="number"
                            value={editedUser.graduationYear !== null ? editedUser.graduationYear : ""}
                            onChange={handleInputChange}
                            placeholder="e.g. 2022"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input
                              id="company"
                              name="company"
                              value={editedUser.company || ""}
                              onChange={handleInputChange}
                              placeholder="e.g. Acme Corporation"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            name="position"
                            value={editedUser.position || ""}
                            onChange={handleInputChange}
                            placeholder="e.g. Software Engineer"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {selectedUser.degree && (
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedUser.degree}{selectedUser.graduationYear ? `, ${selectedUser.graduationYear}` : ''}</span>
                          </div>
                        )}
                        
                        {selectedUser.company && (
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedUser.position ? `${selectedUser.position} at ` : ''}{selectedUser.company}</span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Biography</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={editedUser.bio || ""}
                          onChange={handleInputChange}
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    ) : (
                      <p className="text-sm">{selectedUser.bio || "No biography provided."}</p>
                    )}
                  </CardContent>
                </Card>
                
                <div className="flex space-x-2 justify-end">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={toggleEditMode}
                        className="gap-2"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={saveUserEdits}
                        className="gap-2"
                        disabled={updateUserMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={toggleEditMode}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit User
                      </Button>
                      {selectedUser.isAdmin ? (
                        <Button 
                          variant="outline" 
                          onClick={() => handleRemoveAdmin(selectedUser)}
                          className="gap-2"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          Remove Admin Role
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={() => handleMakeAdmin(selectedUser)}
                          className="gap-2"
                        >
                          <Shield className="h-4 w-4" />
                          Make Administrator
                        </Button>
                      )}
                      
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setIsUserDetailsOpen(false);
                          openDeleteDialog(selectedUser);
                        }}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete User
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{selectedUser?.firstName} {selectedUser?.lastName}".
              All associated data including event registrations, forum posts, and replies will also be removed.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
