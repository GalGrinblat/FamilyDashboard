import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GlobalFAB } from "@/components/layout/GlobalFAB";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
});


export const metadata: Metadata = {
  title: "Family Dashboard",
  description: "Family Operations Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${assistant.className} antialiased bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 flex min-h-screen`}
      >
        <Sidebar />
        <main className="flex-1 w-full min-h-screen flex flex-col pb-16 md:pb-0">
          {children}
        </main>
        <MobileNav />
        <GlobalFAB />
      </body>
    </html>
  );
}
