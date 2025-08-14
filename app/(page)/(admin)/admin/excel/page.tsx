import { Suspense } from "react";
import ExcelManagementClient from "./excel-client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Loading component for suspense
function ExcelManagementLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <Card className="bg-card/50 border-border">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-foreground font-medium mb-2">
              Loading Excel Management
            </h3>
            <p className="text-muted-foreground">
              Please wait while we prepare the interface...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Server Component - Main page
export default function ExcelManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ExcelManagementLoading />}>
        <ExcelManagementClient />
      </Suspense>
    </div>
  );
}

// Metadata for the page
export const metadata = {
  title: "Excel Management | Admin Dashboard",
  description:
    "Advanced Excel-like data management interface for administrators",
};
