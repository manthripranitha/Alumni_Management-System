import { UniversityInfo } from "@/components/university/university-info";

export default function UniversityInfoPage() {
  return (
    <div className="container py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">About Our University</h1>
        <p className="text-muted-foreground">
          Learn more about Vignan University's mission, vision, and contact information
        </p>
      </div>
      
      <UniversityInfo />
    </div>
  );
}