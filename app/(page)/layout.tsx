import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getUser } from "@/lib/actions/getUser";
import { AppSidebar } from "@/components/App-Sidebar";
import { MobileHeader } from "@/components/Mobile-Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Management System",
  description: "Complete student management system for schools",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  try {
    user = await getUser();
  } catch (error) {
    console.error("Error getting user in layout:", error);
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950`}>
        {user ? (
          <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset className="">
              <MobileHeader user={user} />
              <main className="flex-1 overflow-auto bg-slate-950 text-white">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        ) : (
          <main className="min-h-screen bg-slate-950">{children}</main>
        )}
      </body>
    </html>
  );
}
