import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function TestAuth() {
  const { user, loginMutation, logoutMutation } = useAuth();

  const handleLogin = () => {
    loginMutation.mutate({
      username: "admin",
      password: "admin123"
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        
        {user ? (
          <div className="space-y-4">
            <p>Logged in as: {user.firstName} {user.lastName}</p>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.isAdmin ? 'Admin' : 'Alumni'}</p>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Not logged in</p>
            <Button onClick={handleLogin} className="w-full">
              Login as Admin
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}