import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  User, 
  Calendar, 
  Briefcase, 
  Image, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  UserCog, 
  CalendarPlus, 
  Image as ImageIcon, 
  MessageSquareText, 
  Menu, 
  X,
  FileText,
  MessageCircle,
  FileCog
} from "lucide-react";
import vignanLogo from "../../assets/vignan_logo.png";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  if (!user) {
    return null;
  }
  
  const isAdmin = user.isAdmin;
  
  return (
    <>
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between px-4 py-3 md:hidden">
        <div className="flex items-center">
          <button
            className="text-gray-500 hover:text-gray-600 focus:outline-none mr-4"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <img
            className="h-8 w-auto"
            src={vignanLogo}
            alt="Vignan University Logo"
          />
          <h1 className="ml-3 text-gray-800 font-medium">Vignan Alumni</h1>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt={user.firstName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      
      {/* Sidebar for desktop and mobile */}
      <div 
        className={`fixed inset-y-0 left-0 flex flex-col flex-grow pt-5 bg-primary overflow-y-auto w-64 z-40 ${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center flex-shrink-0 px-4">
          <img
            className="h-12 w-auto"
            src={vignanLogo}
            alt="Vignan University Logo"
          />
          <h1 className="ml-3 text-white font-medium">Vignan Alumni</h1>
        </div>
        
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {/* Alumni Navigation */}
            <div className="space-y-1">
              <NavLink 
                href="/" 
                icon={<Home className="mr-3 h-5 w-5 text-primary-300" />} 
                label="Dashboard" 
                active={location === "/"} 
                onClick={closeMobileMenu}
              />
              <NavLink 
                href="/profile" 
                icon={<User className="mr-3 h-5 w-5 text-primary-300" />} 
                label="My Profile" 
                active={location === "/profile"} 
                onClick={closeMobileMenu}
              />
              <NavLink 
                href="/events" 
                icon={<Calendar className="mr-3 h-5 w-5 text-primary-300" />} 
                label="Events" 
                active={location === "/events"}
                onClick={closeMobileMenu}
              />
              <NavLink 
                href="/jobs" 
                icon={<Briefcase className="mr-3 h-5 w-5 text-primary-300" />} 
                label="Job Board" 
                active={location === "/jobs"}
                onClick={closeMobileMenu}
              />
              <NavLink 
                href="/gallery" 
                icon={<Image className="mr-3 h-5 w-5 text-primary-300" />} 
                label="Gallery" 
                active={location === "/gallery"}
                onClick={closeMobileMenu}
              />
              <NavLink 
                href="/forum" 
                icon={<MessageSquare className="mr-3 h-5 w-5 text-primary-300" />} 
                label="Discussion Forum" 
                active={location === "/forum"}
                onClick={closeMobileMenu}
              />
              <NavLink 
                href="/documents" 
                icon={<FileText className="mr-3 h-5 w-5 text-primary-300" />} 
                label="My Documents" 
                active={location === "/documents"}
                onClick={closeMobileMenu}
              />
              <NavLink 
                href="/messages" 
                icon={<MessageCircle className="mr-3 h-5 w-5 text-primary-300" />} 
                label="Messages" 
                active={location === "/messages"}
                onClick={closeMobileMenu}
              />
              <NavLink 
                href="/alumni" 
                icon={<Users className="mr-3 h-5 w-5 text-primary-300" />} 
                label="Alumni Directory" 
                active={location === "/alumni"}
                onClick={closeMobileMenu}
              />
            </div>
            
            {/* Admin Navigation */}
            {isAdmin && (
              <div className="space-y-1 pt-5 border-t border-primary-700">
                <h3 className="px-3 text-xs font-semibold text-primary-200 uppercase tracking-wider mt-2 mb-2">
                  Admin Controls
                </h3>
                <NavLink 
                  href="/admin/dashboard" 
                  icon={<Settings className="mr-3 h-5 w-5 text-primary-300" />} 
                  label="Admin Dashboard" 
                  active={location === "/admin/dashboard"}
                  onClick={closeMobileMenu}
                />
                <NavLink 
                  href="/admin/users" 
                  icon={<UserCog className="mr-3 h-5 w-5 text-primary-300" />} 
                  label="Manage Users" 
                  active={location === "/admin/users"}
                  onClick={closeMobileMenu}
                />
                <NavLink 
                  href="/admin/events" 
                  icon={<CalendarPlus className="mr-3 h-5 w-5 text-primary-300" />} 
                  label="Manage Events" 
                  active={location === "/admin/events"}
                  onClick={closeMobileMenu}
                />
                <NavLink 
                  href="/admin/jobs" 
                  icon={<Briefcase className="mr-3 h-5 w-5 text-primary-300" />} 
                  label="Manage Jobs" 
                  active={location === "/admin/jobs"}
                  onClick={closeMobileMenu}
                />
                <NavLink 
                  href="/admin/gallery" 
                  icon={<ImageIcon className="mr-3 h-5 w-5 text-primary-300" />} 
                  label="Manage Gallery" 
                  active={location === "/admin/gallery"}
                  onClick={closeMobileMenu}
                />
                <NavLink 
                  href="/admin/forum" 
                  icon={<MessageSquareText className="mr-3 h-5 w-5 text-primary-300" />} 
                  label="Manage Forum" 
                  active={location === "/admin/forum"}
                  onClick={closeMobileMenu}
                />
                <NavLink 
                  href="/admin/documents" 
                  icon={<FileCog className="mr-3 h-5 w-5 text-primary-300" />} 
                  label="Manage Documents" 
                  active={location === "/admin/documents"}
                  onClick={closeMobileMenu}
                />
              </div>
            )}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex flex-col border-t border-primary-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={user.firstName} />
                  <AvatarFallback className="bg-primary-700 text-white">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <Button 
                  variant="ghost" 
                  className="text-xs text-primary-200 hover:text-white px-0"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary-700">
            <p className="text-sm font-medium text-center text-primary-200 mt-4">
              Developed And Maintained By<br />Krishna Kant Kumar And Team
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function NavLink({ 
  href, 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={href}>
      <a
        className={`${
          active 
            ? "bg-primary-700 text-white" 
            : "text-primary-100 hover:bg-primary-700"
        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
        onClick={onClick}
      >
        {icon}
        {label}
      </a>
    </Link>
  );
}
