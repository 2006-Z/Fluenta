import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fluenta — AI English Coach for Your Career",
  description:
    "Practice fluent English for job interviews, pitches, networking, and professional writing with an AI coach.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Set by proxy.ts only for the apex-domain portfolio rewrite — that page
  // has its own identity and shouldn't wear the Fluenta product chrome.
  const isPortfolioShell =
    (await headers()).get("x-portfolio-shell") === "1";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {!isPortfolioShell && <Navbar />}
        {children}
        {!isPortfolioShell && (
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              },
            }}
          />
        )}
      </body>
    </html>
  );
}
