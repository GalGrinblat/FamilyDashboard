import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "../globals.css";

const assistant = Assistant({
    subsets: ["hebrew", "latin"],
    variable: "--font-assistant",
});

export const metadata: Metadata = {
    title: "Login - Family Dashboard",
    description: "Secure login for the family operations dashboard.",
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="he" dir="rtl">
            <body
                className={`${assistant.className} antialiased bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 flex min-h-screen items-center justify-center`}
            >
                <main className="w-full max-w-md p-6">
                    {children}
                </main>
            </body>
        </html>
    );
}
