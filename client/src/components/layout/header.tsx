import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900">
        {/* Dynamic header based on current page */}
        Dashboard
      </h1>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs text-gray-500">
            {user.isAdmin ? "Administrator" : `${user.degree}, ${user.graduationYear}`}
          </span>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt={user.firstName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
