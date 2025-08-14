"use client";

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Main Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto">
            <Loader2 className="w-16 h-16 text-gray-400 dark:text-gray-600 animate-spin" />
          </div>

          {/* Subtle pulse ring */}
          <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-gray-200 dark:border-gray-800 animate-pulse" />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Loading Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait a moment...
          </p>
        </div>

        {/* Minimal Progress Indicator */}
        <div className="w-48 mx-auto">
          <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gray-900 dark:bg-gray-100 rounded-full animate-progress" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 40%;
            margin-left: 30%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
