"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderTree,
  FileText,
  HelpCircle,
  MessageSquareQuote,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Radio,
  Shield,
  ShieldAlert,
  RotateCw,
  ChevronRight,
} from "lucide-react";
import {
  adminLogout,
  getAdminProfile,
  clearAdminSession,
  getStoredAdminUser,
} from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [liveSyncConnected, setLiveSyncConnected] = useState(false);

  // If on /admin/login, do not wrap with admin sidebar layout
  const isLoginPage = pathname === "/admin/login";

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const verifySession = useCallback(async () => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("vlearnn_admin_token") : null;
    if (!token) {
      clearAdminSession();
      setIsAuthorized(false);
      setIsLoading(false);
      router.replace("/admin/login");
      return;
    }

    try {
      setIsLoading(true);
      setAuthError(null);

      // Verify token with backend
      const userProfile = await getAdminProfile(6000);

      if (typeof window !== "undefined") {
        localStorage.setItem("vlearnn_admin_user", JSON.stringify(userProfile));
      }
      setCurrentUser(userProfile);
      setIsAuthorized(true);
    } catch (err: any) {
      console.error("Admin session verification failed:", err);
      if (err?.status === 401 || err?.status === 403) {
        clearAdminSession();
        setIsAuthorized(false);
        router.replace("/admin/login");
        return;
      }

      const cached = getStoredAdminUser();
      if (cached) {
        setCurrentUser(cached);
      }

      const message =
        err?.name === "AbortError"
          ? "Connection timed out while contacting VLEARNN backend server (port 5000)."
          : err?.message || "Unable to connect to the administration server. Please verify the backend is running.";

      setAuthError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoginPage, router]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Authenticated Server-Sent Events (SSE) for Real-Time Admin Sync
  useEffect(() => {
    if (!isAuthorized || isLoginPage) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("vlearnn_admin_token") : null;
    if (!token) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const connectSSE = () => {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const es = new EventSource(`${API_BASE}/admin/events/stream?token=${encodeURIComponent(token)}`);
        eventSourceRef.current = es;

        es.onopen = () => {
          setLiveSyncConnected(true);
        };

        es.onerror = () => {
          setLiveSyncConnected(false);
          es.close();
          eventSourceRef.current = null;
          reconnectTimeoutRef.current = setTimeout(connectSSE, 6000);
        };
      } catch {
        setLiveSyncConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isAuthorized, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="text-center space-y-3 font-sans">
          <div className="w-8 h-8 border-2 border-[#17324D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#60656D] font-medium">Validating administrator session...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (authError && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] p-8 text-center space-y-5">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#17324D]">Session Verification Failed</h2>
            <p className="text-xs text-[#60656D] leading-relaxed">{authError}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => verifySession()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#17324D] hover:bg-[#2463A6] text-white text-xs font-semibold transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
            <button
              type="button"
              onClick={adminLogout}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#F7F8FA] hover:bg-[#E5E7EB] text-[#17324D] text-xs font-semibold border border-[#E5E7EB] transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] font-sans">
        <p className="text-xs text-[#60656D]">Redirecting to administrator authentication...</p>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Admissions CRM", href: "/admin/enquiries", icon: Users },
    { label: "Course Management", href: "/admin/courses", icon: BookOpen },
    { label: "Track Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Institutional Content", href: "/admin/content", icon: FileText },
    { label: "FAQs Management", href: "/admin/faq", icon: HelpCircle },
    { label: "Student Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-[#1C1C1C] font-sans">
      {/* Desktop Enterprise Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#17324D] text-white border-r border-[#17324D] flex-shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3">
          <div className="w-8 h-8 bg-[#2463A6] flex items-center justify-center font-bold text-white text-sm">
            <span>V</span>
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block text-sm">VLEARNN</span>
            <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider block">
              Staff Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#2463A6] text-white font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#112437]">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 bg-[#2463A6]/40 border border-[#2463A6] flex items-center justify-center text-xs font-bold text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {currentUser?.name || "Academic Staff"}
              </span>
              <span className="text-[10px] text-white/60 block truncate">
                {currentUser?.email || "staff@vlearnn.com"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={adminLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors border border-red-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-[#17324D] hover:bg-[#F7F8FA]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Workspace Title */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#60656D]">
              <span className="font-semibold text-[#17324D]">Administration</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="capitalize">{pathname?.split("/")[2] || "Overview"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live SSE Sync Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F7F8FA] border border-[#E5E7EB] text-[11px] font-semibold text-[#17324D]">
              <Radio
                className={`w-3 h-3 ${
                  liveSyncConnected ? "text-emerald-600 animate-pulse" : "text-amber-600"
                }`}
              />
              <span>{liveSyncConnected ? "Real-Time Sync Active" : "Connecting..."}</span>
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2463A6] hover:text-[#17324D] transition-colors"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#17324D]/80"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-64 max-w-xs bg-[#17324D] text-white p-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-bold text-white text-sm">VLEARNN Staff</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-medium ${
                      isActive ? "bg-[#2463A6] text-white font-bold" : "text-white/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={adminLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-300 hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
