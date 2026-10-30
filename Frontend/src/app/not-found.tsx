import React from "react";
import Link from "next/link";
import { Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-paper-100">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded border border-navy-100 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold font-mono">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-navy-950">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-mutedblue-600 leading-relaxed">
            The page you are looking for doesn't exist or has moved. Return to the homepage or explore our courses.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            href="/courses"
            className="w-full inline-flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-900 text-white font-semibold px-5 py-3 rounded text-xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Explore Courses</span>
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-paper-100 hover:bg-paper-200 text-navy-900 font-semibold px-5 py-3 rounded text-xs border border-navy-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-mutedblue-500" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

