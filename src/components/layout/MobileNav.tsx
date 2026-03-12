"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ArrowRightLeft, TrendingUp, Settings as SettingsIcon, Scale, PieChart } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const pathname = usePathname()

    const links = [
        { href: "/", icon: Home, label: "ראשי" },
        { href: "/monthly-balance", icon: PieChart, label: "מאזן" },
        { href: "/liquidity", icon: Scale, label: "עו״ש" },
        { href: "/transactions", icon: ArrowRightLeft, label: "תנועות" },
        { href: "/wealth", icon: TrendingUp, label: "הון" },
        { href: "/settings", icon: SettingsIcon, label: "הגדרות" },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-zinc-200 bg-white px-2 py-2 dark:border-zinc-800 dark:bg-zinc-950 md:hidden" dir="rtl">
            {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 min-w-[64px] min-h-[44px]",
                            isActive
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-zinc-500 dark:text-zinc-400"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{link.label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
