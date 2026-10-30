"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { adminLogin, getAdminProfile, clearAdminSession } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated and token is valid, redirect to /admin
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("vlearnn_admin_token");
      if (token) {
        getAdminProfile(3000)
          .then(() => {
            router.push("/admin");
          })
          .catch(() => {
            clearAdminSession();
          });
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await adminLogin({
        email: email.trim(),
        password: password.trim(),
      });
      router.push("/admin");
    } catch (err: any) {
      console.error("Login failure:", err);
      setErrorMessage(
        err?.message || "Invalid administrator credentials. Access forbidden."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-[#E5E7EB] p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-[#17324D] text-white font-bold flex items-center justify-center mx-auto text-lg">
            <span>V</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            VLEARNN Staff Portal
          </h1>
          <p className="text-xs text-[#60656D]">
            Secure administrative access for faculty coordinators and admissions staff.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label
              htmlFor="admin-email"
              className="text-[11px] font-bold uppercase tracking-wider text-[#17324D] block"
            >
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#60656D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@vlearnn.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#2463A6] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="admin-password"
              className="text-[11px] font-bold uppercase tracking-wider text-[#17324D] block"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#60656D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#2463A6] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#17324D] hover:bg-[#2463A6] disabled:opacity-60 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Verifying credentials...</span>
            ) : (
              <>
                <span>Sign In to Administration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#60656D]">
          <Link href="/" className="hover:text-[#2463A6] transition-colors">
            ← Return to public portal
          </Link>
          <span className="flex items-center gap-1 text-[11px] text-[#60656D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2463A6]" />
            Encrypted Session
          </span>
        </div>
      </div>
    </div>
  );
}
