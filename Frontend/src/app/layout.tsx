import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { PublicSettingsProvider } from "@/lib/PublicSettingsContext";

const zohoPuvi = localFont({
  src: [
    {
      path: "../../public/fonts/ZohoPuvi/Zoho_Puvi_Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/ZohoPuvi/Zoho_Puvi_Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ZohoPuvi/Zoho_Puvi_Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ZohoPuvi/Zoho_Puvi_Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/ZohoPuvi/Zoho_Puvi_Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/ZohoPuvi/Zoho_Puvi_Extrabold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-zoho-puvi",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "VLEARNN — Practical IT & Advanced Technical Training Institute",
  description:
    "Rigorous, cohort-based engineering programs in Artificial Intelligence, Full Stack Web Engineering, Cloud Infrastructure & DevOps, and Data Analytics. Learn from practicing industry leaders.",
  keywords: [
    "VLEARNN",
    "IT Training Bangalore",
    "Artificial Intelligence Course",
    "Full Stack Development",
    "DevOps Kubernetes Training",
    "Data Analytics",
    "Technical Education",
  ],
  authors: [{ name: "VLEARNN Institute" }],
};

import { SmoothScroll } from "@/components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${zohoPuvi.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-white text-brandText-dark font-sans antialiased selection:bg-[#EBF2F7] selection:text-[#245B8F]">
        <SmoothScroll />
        <PublicSettingsProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloatingButton />
        </PublicSettingsProvider>
      </body>
    </html>
  );
}
