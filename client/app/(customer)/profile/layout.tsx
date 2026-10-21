import { Metadata } from "next";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export const metadata: Metadata = {
  title: "My Profile - MohallaMart",
  description: "Manage your MohallaMart profile and settings",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-700 pb-24 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4">
          <ProfileSidebar />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 bg-background md:bg-surface md:border border-border/50 rounded-[24px] md:p-8 md:shadow-sm min-h-[500px]">
          {children}
        </div>
      </div>
    </div>
  );
}
