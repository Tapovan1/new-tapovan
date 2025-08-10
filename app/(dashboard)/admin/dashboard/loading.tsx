
"use client"
import {
  Shield,
  Users,
  BookOpen,
  FileText,
  Settings,
  BarChart3,
} from "lucide-react";

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        {/* Main Logo Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-red-600/20 rounded-full flex items-center justify-center animate-pulse">
            <Shield className="h-12 w-12 text-red-400 animate-bounce" />
          </div>

          {/* Floating Admin Icons */}
          <div className="absolute -top-6 -left-6 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center animate-ping">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="absolute -top-6 -right-6 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center animate-ping delay-150">
            <BookOpen className="h-5 w-5 text-green-400" />
          </div>
          <div className="absolute -bottom-6 -left-6 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center animate-ping delay-300">
            <FileText className="h-5 w-5 text-purple-400" />
          </div>
          <div className="absolute -bottom-6 -right-6 w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center animate-ping delay-500">
            <BarChart3 className="h-5 w-5 text-orange-400" />
          </div>
          <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center animate-ping delay-700">
            <Settings className="h-4 w-4 text-cyan-400" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">
            Teacher Portal
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-red-400" />
            <span className="text-red-300 font-medium">Admin Portal</span>
          </div>
          <p className="text-slate-400 animate-fade-in delay-200">
            Loading administrative dashboard...
          </p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-80 mx-auto mb-8">
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full animate-loading-bar"></div>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-3 text-sm text-slate-500 mb-8">
          <div className="flex items-center justify-center gap-3 animate-fade-in delay-500">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span>Initializing admin dashboard...</span>
          </div>
          <div className="flex items-center justify-center gap-3 animate-fade-in delay-700">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-100"></div>
            <span>Loading student data...</span>
          </div>
          <div className="flex items-center justify-center gap-3 animate-fade-in delay-900">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-200"></div>
            <span>Fetching teacher assignments...</span>
          </div>
          <div className="flex items-center justify-center gap-3 animate-fade-in delay-1100">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-300"></div>
            <span>Preparing analytics...</span>
          </div>
        </div>

        {/* Admin Skeleton Cards Preview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 animate-pulse"
            >
              <div className="w-6 h-6 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 bg-slate-700 rounded mb-1"></div>
              <div className="h-3 bg-slate-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* System Status */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
            <span>Database Connected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
            <span>Services Ready</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          25% {
            width: 30%;
          }
          50% {
            width: 60%;
          }
          75% {
            width: 85%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-loading-bar {
          animation: loading-bar 3s ease-in-out infinite;
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

        .delay-900 {
          animation-delay: 0.9s;
        }

        .delay-1100 {
          animation-delay: 1.1s;
        }
      `}</style>
    </div>
  );
}
