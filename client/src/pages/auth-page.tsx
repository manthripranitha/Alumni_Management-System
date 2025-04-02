import { useEffect } from "react";
import { useLocation } from "wouter";
import { AuthForms } from "@/components/auth/auth-forms";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      // Redirect admin users to admin dashboard, regular users to alumni dashboard
      if (user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <img 
              className="mx-auto h-32 w-auto" 
              src="/src/assets/vignan_logo.png"
              alt="Vignan University Logo" 
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Alumni Management System
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Vignan University
            </p>
          </div>
          
          <AuthForms />
        </div>
      </div>
      
      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 bg-primary p-12 text-white">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-4">Connect with Vignan's Global Alumni Network</h1>
          <p className="text-lg mb-8">
            Join thousands of Vignan alumni to access exclusive events, career opportunities, and stay connected with your peers.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">Stay Connected</h3>
                <p className="mt-1">Keep in touch with classmates and expand your professional network.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">Exclusive Events</h3>
                <p className="mt-1">Access alumni-only events, reunions, and professional workshops.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">Career Opportunities</h3>
                <p className="mt-1">Discover job postings shared exclusively for Vignan alumni.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
