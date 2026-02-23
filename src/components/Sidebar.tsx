"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    Wallet,
    Settings,
    Sofa,
    CalendarDays,
    Menu
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
    { href: "/", label: "ראשי", icon: Home },
    { href: "/finance", label: "פיננסים", icon: Wallet },
    { href: "/household", label: "משק בית", icon: Sofa },
    { href: "/planning", label: "תכנון", icon: CalendarDays },
    { href: "/settings", label: "הגדרות", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    const NavLinks = () => (
        <nav className="space-y-2 flex-1 pt-6">
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`) && item.href !== "/"
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isActive ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : "text-zinc-500 dark:text-zinc-400"
                            }`}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )

    return (
        <>
            <div className="hidden border-l bg-zinc-50 dark:bg-zinc-950 md:flex w-64 min-h-screen p-4 flex-col">
                <div className="flex h-14 items-center border-b px-4 font-semibold text-lg">
                    ניהול משק בית
                </div>
                <NavLinks />
            </div>
        </>
    )
}
