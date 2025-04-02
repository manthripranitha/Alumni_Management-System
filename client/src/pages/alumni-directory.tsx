import { AlumniSearch } from "@/components/alumni/alumni-search";

export default function AlumniDirectoryPage() {
  return (
    <div className="container py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Alumni Directory</h1>
        <p className="text-muted-foreground">
          Connect with Vignan University alumni from around the world
        </p>
      </div>
      
      <AlumniSearch />
    </div>
  );
}