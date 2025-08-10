"use client";

import { GraduationCap, BookOpen, Users, FileText } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30 flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        {/* Main Logo Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500/20 to-violet-500/20 dark:bg-indigo-600/20 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
            <GraduationCap className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-bounce" />
          </div>

          {/* Floating Icons */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center animate-ping">
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:bg-violet-500/20 rounded-xl flex items-center justify-center animate-ping delay-150">
            <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:bg-amber-500/20 rounded-xl flex items-center justify-center animate-ping delay-300">
            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-2 animate-fade-in">
            Student Portal
          </h1>
          <p className="text-slate-600 dark:text-gray-300 animate-fade-in delay-200">
            Loading your dashboard...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-6">
          <div className="h-2 bg-slate-200 dark:bg-gray-700/60 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full animate-loading-bar shadow-sm"></div>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-2 text-sm text-slate-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 animate-fade-in delay-500">
            <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse"></div>
            <span>Initializing dashboard...</span>
          </div>
          <div className="flex items-center justify-center gap-2 animate-fade-in delay-700">
            <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse delay-100"></div>
            <span>Loading your classes...</span>
          </div>
          <div className="flex items-center justify-center gap-2 animate-fade-in delay-1000">
            <div className="w-2 h-2 bg-violet-500 dark:bg-violet-400 rounded-full animate-pulse delay-200"></div>
            <span>Preparing statistics...</span>
          </div>
        </div>

        {/* Skeleton Cards Preview */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 rounded-2xl p-4 animate-pulse shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-600 dark:to-gray-700 rounded-xl mb-3"></div>
              <div className="h-6 bg-slate-200 dark:bg-gray-600 rounded-lg mb-2"></div>
              <div className="h-4 bg-slate-100 dark:bg-gray-700 rounded-lg w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-violet-400/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading-bar {
          0% {
            width: 0%;
            transform: translateX(-100%);
          }
          50% {
            width: 70%;
            transform: translateX(-15%);
          }
          100% {
            width: 100%;
            transform: translateX(0%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-loading-bar {
          animation: loading-bar 2.5s ease-in-out infinite;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        /* Enhanced animations for modern feel */
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
