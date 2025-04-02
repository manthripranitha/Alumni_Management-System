import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
}

export function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <div className="h-screen flex">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <div className="pt-16 md:pt-0 min-h-screen bg-gray-50">
          <Header />
          
          <main className="p-4 md:p-6">
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              </div>
            )}
            
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
