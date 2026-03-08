import type { Metadata, Viewport } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GlobalFAB } from "@/components/layout/GlobalFAB";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { createClient } from "@/lib/supabase/server";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
});


export const metadata: Metadata = {
  title: "Family Dashboard",
  description: "Family Operations Dashboard – ניהול משפחתי חכם",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FamilyDash",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categories = user
    ? ((await supabase.from('categories').select('id, name_he, domain').order('name_he', { ascending: true })).data ?? [])
    : [];

  const accounts = user
    ? ((await supabase.from('accounts').select('id, name').order('name', { ascending: true })).data ?? [])
    : [];

  return (
    <html lang="he" dir="rtl">
      <body
        className={`${assistant.className} antialiased bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 flex min-h-screen`}
      >
        <ServiceWorkerRegistration />
        {user && <Sidebar />}
        <main className="flex-1 w-full min-h-screen flex flex-col pb-16 md:pb-0">
          {children}
        </main>
        {user && <MobileNav />}
        {user && <GlobalFAB categories={categories} accounts={accounts} />}
      </body>
    </html>
  );
}
