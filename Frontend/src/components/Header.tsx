"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ChevronRight, Phone } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isScrolledRef = useRef(false);

  // RAF-throttled scroll listener with 45px hysteresis buffer (Zero-jank, zero-stutter)
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

          // 45px hysteresis window: activates at > 60px, deactivates at < 18px
          if (scrollY > 60 && !isScrolledRef.current) {
            isScrolledRef.current = true;
            setIsScrolled(true);
          } else if (scrollY < 18 && isScrolledRef.current) {
            isScrolledRef.current = false;
            setIsScrolled(false);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Attach to Lenis if initialized
    let lenisTimer: NodeJS.Timeout;
    const bindLenis = () => {
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.on("scroll", onScroll);
      } else {
        lenisTimer = setTimeout(bindLenis, 200);
      }
    };
    bindLenis();

    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(lenisTimer);
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.off("scroll", onScroll);
      }
    };
  }, []);

  // Do not render public header in admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "About", href: "/about" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* 1. Top Institutional Notification Bar (Scrolls naturally out of view without collapsing height) */}
      <div className="w-full bg-[#17324D] text-white text-[11px] font-medium tracking-wide py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#12263A] relative z-40 select-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2463A6] animate-pulse flex-shrink-0" />
            <span className="truncate">Admissions Open for Fall 2026 Cohorts • Hands-on Engineering Labs</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#C9CED5]">
            <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1">
              <span>Campus Visit: Bangalore Tech Corridor</span>
            </Link>
            <span className="text-[#60656D]">|</span>
            <a
              href="tel:+919876543210"
              className="hover:text-white transition-colors flex items-center gap-1 font-semibold text-white"
            >
              <Phone className="w-3 h-3 text-[#2463A6]" />
              <span>+91 98765 43210</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Sticky Apple Dynamic Island Navbar Shell (Zero layout shift, 120fps GPU smooth) */}
      <header className="sticky top-0 z-50 w-full pointer-events-none select-none">
        <div className="w-full flex justify-center pointer-events-none">
          <div
            className={`dynamic-island-shell pointer-events-auto relative flex items-center justify-center ${
              isScrolled
                ? "w-[92%] sm:w-[86%] max-w-3xl xl:max-w-4xl h-[52px] sm:h-14 mt-3 sm:mt-3.5 rounded-full bg-white/85 backdrop-blur-2xl border border-white/60 shadow-[0_20px_45px_rgba(17,29,53,0.13),0_2px_8px_rgba(0,0,0,0.06)] px-4 sm:px-6 ring-1 ring-black/[0.06]"
                : "w-full max-w-full h-16 mt-0 rounded-none bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-none px-4 sm:px-6 lg:px-8"
            }`}
          >
            {/* Centered Content Track */}
            <div
              className={`w-full flex items-center transition-all duration-400 ease-out ${
                isScrolled
                  ? "justify-between gap-3 sm:gap-6"
                  : "justify-between lg:justify-center lg:gap-8 xl:gap-12 max-w-5xl mx-auto"
              }`}
            >
              {/* VLEARNN Brand Logo */}
              <Link
                href="/"
                className="flex items-center gap-2.5 sm:gap-3 focus:outline-none group flex-shrink-0"
                aria-label="VLEARNN Institute Home"
              >
                <div
                  className={`rounded-full bg-[#17324D] border border-[#1E5289] flex items-center justify-center text-white transition-all duration-400 group-hover:scale-[1.04] ${
                    isScrolled ? "w-8 h-8 text-sm" : "w-9 h-9 text-base"
                  }`}
                >
                  <span className="text-white font-extrabold tracking-tight">V</span>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-bold tracking-tight text-[#1C1C1C] leading-none group-hover:text-[#2463A6] transition-colors ${
                      isScrolled ? "text-sm sm:text-base" : "text-base"
                    }`}
                  >
                    VLEARNN
                  </span>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-widest text-[#60656D] leading-none transition-all duration-300 ${
                      isScrolled ? "max-h-0 opacity-0 overflow-hidden mt-0" : "max-h-4 opacity-100 mt-1"
                    }`}
                  >
                    Institute of Technology
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav
                className="hidden lg:flex items-center"
                aria-label="Main Navigation"
              >
                <div
                  className={`pill-track-transition flex items-center ${
                    isScrolled
                      ? "gap-1 bg-[#F4F6F9]/90 backdrop-blur-md p-1 rounded-full border border-[#E5E7EB]/70 shadow-inner"
                      : "gap-6 sm:gap-7 lg:gap-8 bg-transparent p-0 border border-transparent"
                  }`}
                >
                  {navLinks.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname?.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`transition-all duration-300 relative ${
                          isScrolled
                            ? `text-xs font-semibold px-3.5 py-1.5 rounded-full ${
                                isActive
                                  ? "bg-white text-[#2463A6] shadow-xs font-bold"
                                  : "text-[#555E6D] hover:text-[#111D35] hover:bg-white/60"
                              }`
                            : `text-[13.5px] font-medium py-1 px-1 ${
                                isActive
                                  ? "text-[#2463A6] font-semibold"
                                  : "text-[#1C1C1C] hover:text-[#2463A6]"
                              }`
                        }`}
                      >
                        {item.label}
                        {!isScrolled && isActive && (
                          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#2463A6] rounded-full animate-in fade-in" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Desktop Action CTA (Enquire Now) */}
              <div className="hidden lg:flex items-center flex-shrink-0">
                <Link
                  href="/contact"
                  className={`inline-flex items-center gap-1.5 bg-[#2463A6] hover:bg-[#1E5289] text-white text-xs font-semibold transition-all duration-300 shadow-sm hover:shadow hover:scale-[1.02] ${
                    isScrolled
                      ? "px-4 py-2 rounded-full"
                      : "px-5 py-2.5 rounded-lg"
                  }`}
                >
                  <span>Enquire Now</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Mobile & Tablet Hamburger & Quick CTA */}
              <div className="flex lg:hidden items-center gap-2">
                {isScrolled && (
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1 bg-[#2463A6] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-xs"
                  >
                    <span>Enquire</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 rounded-full text-[#1C1C1C] hover:bg-[#F7F8FA] focus:outline-none"
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile/Tablet Drawer (Scrolled Island Expanded Card) */}
            {mobileMenuOpen && isScrolled && (
              <div className="lg:hidden absolute top-full left-1/2 -translate-x-1/2 w-[96%] max-w-sm mt-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 p-4 space-y-3 shadow-2xl animate-in fade-in-0 zoom-in-95 pointer-events-auto">
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname?.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-[#F0F5FA] text-[#2463A6]"
                            : "text-[#1C1C1C] hover:bg-[#F7F8FA]"
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#9AA3AF]" />
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-2 border-t border-[#E5E7EB] flex flex-col gap-2">
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-[#2463A6] hover:bg-[#1E5289] text-white text-xs font-semibold py-2.5 rounded-xl text-center shadow-sm"
                  >
                    <span>Enquire Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Drawer (Standard Un-scrolled Top Mode) */}
        {mobileMenuOpen && !isScrolled && (
          <div className="lg:hidden pointer-events-auto border-b border-[#E5E7EB] bg-white px-5 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#F0F5FA] text-[#2463A6] font-semibold"
                        : "text-[#1C1C1C] hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#9AA3AF]" />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-[#E5E7EB] flex flex-col gap-2.5">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 bg-[#2463A6] hover:bg-[#1E5289] text-white text-xs font-semibold py-2.5 rounded text-center shadow-sm"
              >
                <span>Enquire Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
