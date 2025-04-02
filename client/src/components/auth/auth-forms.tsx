import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, AtSign, Key, User, GraduationCap, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Login Form Schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration Form Schema
const currentYear = new Date().getFullYear();
// Create an array from current year to 2040, plus past 20 years for alumni
const futureYears = Array.from({ length: 2040 - currentYear + 1 }, (_, i) => currentYear + i);
const pastYears = Array.from({ length: 20 }, (_, i) => currentYear - i - 1);
const graduationYears = [currentYear, ...futureYears, ...pastYears].sort((a, b) => a - b);

const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  graduationYear: z.number().positive("Please select a graduation year"),
  degree: z.string().min(1, "Please select a degree"),
  isAdmin: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function AuthForms() {
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const [userType, setUserType] = useState<"alumni" | "admin">("alumni");
  const { loginMutation, registerMutation } = useAuth();

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex rounded-md shadow-sm mb-6">
        <button
          onClick={() => setAuthType("login")}
          className={`w-1/2 py-2 px-4 text-sm font-medium rounded-l-md ${
            authType === "login"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700"
          } focus:outline-none transition-colors`}
        >
          Login
        </button>
        <button
          onClick={() => setAuthType("register")}
          className={`w-1/2 py-2 px-4 text-sm font-medium rounded-r-md ${
            authType === "register"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700"
          } focus:outline-none transition-colors`}
        >
          Register
        </button>
      </div>

      {authType === "login" ? (
        <>
          {/* User Type Selection for Login */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setUserType("alumni")}
                className={`userType-alumni px-4 py-2 text-sm font-medium rounded-l-md ${
                  userType === "alumni"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                } transition-colors`}
              >
                Alumni
              </button>
              <button
                onClick={() => setUserType("admin")}
                className={`userType-admin px-4 py-2 text-sm font-medium rounded-r-md ${
                  userType === "admin"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                } transition-colors`}
              >
                Admin
              </button>
            </div>
          </div>
          <LoginForm />
        </>
      ) : (
        <RegistrationForm />
      )}
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: LoginFormValues) {
    // Get user type from parent component
    const userType = document.querySelector('.userType-alumni')?.classList.contains('bg-primary') 
      ? 'alumni' 
      : 'admin';
    
    // For admin login, validate against hardcoded credentials
    if (userType === 'admin' && values.username === 'admin' && values.password === 'admin123') {
      loginMutation.mutate({
        username: 'admin',
        password: 'admin123'
      });
    } else {
      // For regular alumni login
      loginMutation.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Username" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input type="password" placeholder="Password" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary-dark">
              Forgot your password?
            </a>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </Form>
  );
}

function RegistrationForm() {
  const { registerMutation } = useAuth();
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
      graduationYear: currentYear,
      degree: "",
      isAdmin: false,
    },
  });

  function onSubmit(values: RegistrationFormValues) {
    const { confirmPassword, ...registrationData } = values;
    registerMutation.mutate(registrationData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="First name" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input type="email" placeholder="Email" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input type="password" placeholder="Password" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="graduationYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Graduation Year</FormLabel>
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger className="pl-10 relative">
                      <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {graduationYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degree</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="pl-10 relative">
                      <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                    <SelectItem value="M.Tech">M.Tech</SelectItem>
                    <SelectItem value="BBA">BBA</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="Ph.D">Ph.D</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </form>
    </Form>
  );
}
