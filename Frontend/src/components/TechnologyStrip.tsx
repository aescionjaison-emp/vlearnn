"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function TechnologyStrip() {
  const technologies = [
    {
      name: "React",
      color: "#00D8FF",
      svg: (
        <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-7 h-7" fill="none">
          <circle cx="0" cy="0" r="2.05" fill="#00D8FF" />
          <g stroke="#00D8FF" strokeWidth="1">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
          </g>
        </svg>
      ),
    },
    {
      name: "Next.js",
      color: "#000000",
      svg: (
        <svg viewBox="0 0 180 180" className="w-7 h-7" fill="none">
          <circle cx="90" cy="90" r="90" fill="#000000" />
          <path
            d="M149.508 157.438L69.147 54H54V125.97h12.113V69.384l72.609 93.633a90.044 90.044 0 0010.786-5.579z"
            fill="url(#nextjs-grad)"
          />
          <path d="M115.5 54H127.5V126H115.5z" fill="url(#nextjs-grad2)" />
          <defs>
            <linearGradient id="nextjs-grad" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="nextjs-grad2" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      name: "Node.js",
      color: "#339933",
      svg: (
        <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
          <path
            d="M16 2.5L3.5 9.7V24.3L16 31.5L28.5 24.3V9.7L16 2.5Z"
            fill="#339933"
          />
          <path
            d="M16 4.7L26.2 10.6V22.4L16 28.3L5.8 22.4V10.6L16 4.7Z"
            fill="#5FA04E"
          />
          <path
            d="M16 8L22.5 11.8V19.3L16 23.2L9.5 19.3V11.8L16 8Z"
            fill="#339933"
          />
          <path
            d="M13 14h2v5h-2zm4-1.5c1.5 0 2.5.8 2.5 2.2 0 1.6-1.2 2-2.3 2.2-.8.1-1.2.2-1.2.6 0 .3.3.5.8.5.6 0 1.2-.2 1.8-.5l.4 1c-.7.4-1.5.6-2.2.6-1.5 0-2.3-.8-2.3-2 0-1.5 1.1-2 2.2-2.2.8-.1 1.3-.2 1.3-.6 0-.3-.3-.5-.7-.5-.6 0-1.1.2-1.7.5l-.4-1c.6-.5 1.2-.7 1.9-.7z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      name: "Python",
      color: "#3776AB",
      svg: (
        <svg viewBox="0 0 128 128" className="w-7 h-7">
          <path
            fill="#3776AB"
            d="M63.5 6c-26.6 0-25 11.5-25 11.5l.03 11.9H64v3.4H28.4S12 30.9 12 57.5c0 26.6 14.3 25.7 14.3 25.7h8.5v-12s-.5-14.3 14-14.3h24.2s13.3.2 13.3-13.1V20s1.8-14-22.8-14zm-13.7 7.3c2.4 0 4.3 1.9 4.3 4.3s-1.9 4.3-4.3 4.3-4.3-1.9-4.3-4.3 1.9-4.3 4.3-4.3z"
          />
          <path
            fill="#FFD438"
            d="M64.5 122c26.6 0 25-11.5 25-11.5l-.03-11.9H64v-3.4h35.6s16.4 1.9 16.4-24.7c0-26.6-14.3-25.7-14.3-25.7h-8.5v12s.5 14.3-14 14.3H55s-13.3-.2-13.3 13.1V108s-1.8 14 22.8 14zm13.7-7.3c-2.4 0-4.3-1.9-4.3-4.3s1.9-4.3 4.3-4.3 4.3 1.9 4.3 4.3-1.9 4.3-4.3 4.3z"
          />
        </svg>
      ),
    },
    {
      name: "MongoDB",
      color: "#47A248",
      svg: (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
          <path
            d="M12 1.5C11.5 2.5 7 8 7 14.5c0 4.5 3 7.5 5 8 2-.5 5-3.5 5-8C17 8 12.5 2.5 12 1.5z"
            fill="#47A248"
          />
          <path
            d="M12 2.5v19.5c.3-.1 2.8-.7 4.2-4 1.5-3.3.8-7.5-.2-9.5-1.5-3-3.6-5.5-4-6z"
            fill="#499D4A"
          />
          <path
            d="M12 1.5c-.2 0-.4.3-.5.7-.7 1.8-4.5 10.3-4.5 12.3 0 4.2 3.1 7.2 4.8 7.8.1.1.2.1.2.1v-20.9z"
            fill="#3FA037"
          />
          <path
            d="M12 22.4c-.1 0-.1 0 0 0-.2 0-.2-.1-.2-.2 0-.5.2-1.3.4-1.8.3-.9.7-1.7 1.1-2.4l.2.3c-.4.8-.8 1.8-1 2.7-.1.4-.2.9-.3 1.3-.1.1-.1.1-.2.1z"
            fill="#E8E8E8"
          />
        </svg>
      ),
    },
    {
      name: "Firebase",
      color: "#FFCA28",
      svg: (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
          <path
            d="M4.6 17.5L8.5 2.7c.1-.4.6-.5.8-.2l3.4 6.3-8.1 8.7z"
            fill="#FFA000"
          />
          <path
            d="M14.6 7.6L12.5 3.5c-.2-.4-.8-.4-1 0L4.6 17.5l10-9.9z"
            fill="#F57C00"
          />
          <path
            d="M4.6 17.5l7.1 4c.2.1.4.1.6 0l7.1-4-4.8-9.9-10 9.9z"
            fill="#FFCA28"
          />
        </svg>
      ),
    },
    {
      name: "PostgreSQL",
      color: "#336791",
      svg: (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
          <circle cx="12" cy="12" r="10" fill="#336791" />
          <path
            d="M12 5.5c-3.5 0-5.5 2.5-5.5 5.5 0 2.2 1.2 3.8 2.8 4.6-.2.6-.7 1.8-.7 1.9 1.1 0 2.3-.7 2.9-1.2.5.1 1 .2 1.5.2 3.5 0 5.5-2.5 5.5-5.5S15.5 5.5 12 5.5zm-1.8 7.3c-.6 0-1-.5-1-1.1s.4-1.1 1-1.1 1 .5 1 1.1-.4 1.1-1 1.1zm3.6 0c-.6 0-1-.5-1-1.1s.4-1.1 1-1.1 1 .5 1 1.1-.4 1.1-1 1.1z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      name: "Git & GitHub",
      color: "#181717",
      svg: (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#181717">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-white border-y border-[#E5E7EB] py-5 sm:py-6 select-none relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
        {/* Left Label */}
        <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0">
          <span className="text-sm font-bold text-[#111D35] tracking-tight whitespace-nowrap">
            Technologies You&apos;ll Learn
          </span>
          <div className="hidden lg:block w-px h-8 bg-[#E5E7EB]" />
        </div>

        {/* Center: Bounded Slideshow Window with Generous Vertical Clearance */}
        <div className="relative w-full max-w-full lg:max-w-xl xl:max-w-2xl overflow-hidden py-4 -my-2 group/track">
          {/* Subtle Left & Right Soft Fade Masks */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-white to-transparent z-20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-white to-transparent z-20"
          />

          {/* Marquee Track: Duplicated list for 100% seamless infinite slow slideshow */}
          <div className="animate-tech-marquee items-center gap-10 sm:gap-14 pl-4">
            {[...technologies, ...technologies].map((tech, idx) => (
              <div
                key={`${tech.name}-${idx}`}
                className="flex flex-col items-center justify-center gap-1 flex-shrink-0 group/item cursor-pointer px-3 py-2 relative"
              >
                {/* Pop Halo Backdrop Pill */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-xl bg-gradient-to-b from-[#F7F9FC] to-[#EDF2F7] opacity-0 group-hover/item:opacity-100 scale-75 group-hover/item:scale-105 transition-all duration-300 ease-out shadow-xs border border-[#E5E7EB]/70 pointer-events-none z-10"
                />

                {/* Icon Container with Dramatic Spring Pop Magnification (1.85x) */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center tech-pop-spring group-hover/item:scale-[1.85] group-hover/item:-translate-y-3 group-hover/item:drop-shadow-[0_12px_16px_rgba(0,0,0,0.22)] z-30">
                  {tech.svg}
                </div>

                {/* Technology Name */}
                <span className="text-[11px] sm:text-xs font-medium text-[#667085] tech-pop-spring group-hover/item:text-[#111D35] group-hover/item:font-bold group-hover/item:scale-110 group-hover/item:-translate-y-1 whitespace-nowrap z-30">
                  {tech.name}
                </span>

                {/* Hover Accent Dot */}
                <span className="w-1.5 h-1.5 rounded-full bg-[#2463A6] opacity-0 group-hover/item:opacity-100 transition-all duration-300 transform scale-50 group-hover/item:scale-100 z-30" />
              </div>
            ))}
          </div>
        </div>

        {/* Right CTA Link */}
        <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0">
          <div className="hidden lg:block w-px h-8 bg-[#E5E7EB]" />
          <Link
            href="/courses"
            className="text-xs font-semibold text-[#2463A6] hover:text-[#1E5289] flex items-center gap-1.5 transition-colors whitespace-nowrap group"
          >
            <span>View All Technologies</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
