import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Calendar, Tag, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs & Technical Insights — VLEARNN Institute",
  description:
    "Expert technical articles, industry career advice, and engineering tutorials on AI, Cloud, DevOps, and Full-Stack Engineering from practicing software leaders at VLEARNN.",
};

const blogPosts = [
  {
    id: "building-production-rag-systems",
    title: "Architecting Production-Ready RAG Systems with Hybrid Vector Search",
    excerpt:
      "A deep dive into chunking strategies, dense vs. sparse vector retrieval, cross-encoder re-ranking, and real-time hallucination guardrails in modern enterprise AI pipelines.",
    category: "Artificial Intelligence",
    date: "October 2026",
    readTime: "7 min read",
    author: {
      name: "Dr. Arvind Raman",
      role: "Lead AI Researcher & Instructor",
      avatar: "/images/avatar-1.jpg",
    },
    image: "/images/program-ai-rag.jpg",
    featured: true,
  },
  {
    id: "nextjs-15-enterprise-patterns",
    title: "Next.js App Router at Scale: Server Actions, Caching, and Streaming Architecture",
    excerpt:
      "Proven mental models and architectural decisions for building fast, maintainable Next.js web applications in multi-tenant enterprise environments.",
    category: "Full Stack",
    date: "October 2026",
    readTime: "5 min read",
    author: {
      name: "Priya Sundaram",
      role: "Principal Frontend Architect",
      avatar: "/images/avatar-2.jpg",
    },
    image: "/images/program-fullstack.jpg",
  },
  {
    id: "kubernetes-gitops-argo-workflows",
    title: "Zero-Downtime Multi-Cluster Deployments using ArgoCD and Kubernetes",
    excerpt:
      "Practical blueprint for declarative infrastructure, automated progressive rollouts with canary deployments, and resilient observability in high-traffic clouds.",
    category: "Cloud & DevOps",
    date: "September 2026",
    readTime: "6 min read",
    author: {
      name: "Vikram Malhotra",
      role: "Cloud Systems Lead",
      avatar: "/images/avatar-3.jpg",
    },
    image: "/images/program-devops.jpg",
  },
  {
    id: "data-engineering-modern-lakehouse",
    title: "Modern Data Lakehouses: From Apache Iceberg to Fast Analytical Dashboards",
    excerpt:
      "How high-performance data engineering pipelines are shifting toward open table formats, ACID compliance, and sub-second SQL analytics on cloud object storage.",
    category: "Data & Analytics",
    date: "September 2026",
    readTime: "8 min read",
    author: {
      name: "Sneha Nair",
      role: "Staff Data Engineer",
      avatar: "/images/avatar-1.jpg",
    },
    image: "/images/program-analytics.jpg",
  },
];

export default function BlogsPage() {
  const [featuredPost, ...regularPosts] = blogPosts;

  return (
    <div className="font-sans bg-white min-h-screen text-[#1C1C1C]">
      {/* Header Banner */}
      <section className="bg-[#FAF9F6] border-b border-[#E5E7EB] py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FA] text-[#2463A6] text-xs font-semibold mb-4 border border-[#D5E5F5]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>VLEARNN Engineering Blog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111D35] leading-tight">
            Insights, Architecture & Guides
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#667085] max-w-2xl mx-auto font-normal">
            Written by practicing senior engineers, tech leads, and faculty at VLEARNN. Stay ahead in modern technology.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Featured Post Card */}
        {featuredPost && (
          <div className="mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C59A56] block mb-3">
              Featured Insight
            </span>
            <div className="bg-[#FAF9F6] rounded-2xl border border-[#E5E7EB] overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm hover:shadow-md transition-shadow group">
              <div className="md:col-span-6 relative min-h-[260px] md:min-h-full overflow-hidden bg-slate-100">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-[#667085] mb-2 font-medium">
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[#2463A6] font-semibold">
                      {featuredPost.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#111D35] group-hover:text-[#2463A6] transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 text-sm text-[#667085] leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white shadow-xs">
                      <Image
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#111D35] block leading-none">
                        {featuredPost.author.name}
                      </span>
                      <span className="text-[10px] text-[#667085] block mt-0.5">
                        {featuredPost.author.role}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2463A6] group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {regularPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-all group"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10.5px] font-semibold text-[#111D35] shadow-xs">
                  {post.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-[#667085] mb-2 font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#111D35] group-hover:text-[#2463A6] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#667085] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#E5E7EB]">
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#111D35]">
                      {post.author.name}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2463A6] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
