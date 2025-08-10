import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Construction,
  GraduationCap,
  ArrowLeft,
  Clock,
  Wrench,
  Code,
} from "lucide-react";
import Link from "next/link";

interface UnderDevelopmentProps {
  title?: string;
  description?: string;
  backLink?: string;
  backText?: string;
}

export default function UnderDevelopment({
  title = "Under Development",
  description = "This feature is currently being developed and will be available soon.",
  backLink = "/admin/dashboard",
  backText = "Back to Dashboard",
}: UnderDevelopmentProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-900/50 border-slate-800 max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* Animated Icons */}
          <div className="relative mb-6">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="p-3 bg-orange-500/20 rounded-full animate-bounce">
                <Construction className="h-8 w-8 text-orange-400" />
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full animate-pulse">
                <GraduationCap className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            {/* Floating Icons */}
            <div className="absolute -top-2 -left-2 animate-bounce delay-300">
              <div className="p-2 bg-purple-500/20 rounded-full">
                <Code className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce delay-500">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Wrench className="h-4 w-4 text-green-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>

          {/* Description */}
          <p className="text-slate-400 mb-6 leading-relaxed">{description}</p>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-slate-800/50 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-sm font-medium">
              Coming Soon
            </span>
          </div>

          {/* Features Coming */}

          {/* Back Button */}
          <Link href={backLink}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backText}
            </Button>
          </Link>

          {/* Footer */}
          <p className="text-xs text-slate-500 mt-4">
            • Student Management System
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
