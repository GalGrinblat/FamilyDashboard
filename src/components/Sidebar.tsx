import Link from "next/link";
import { Home, PieChart, Calendar } from "lucide-react";

export function Sidebar() {
    const navItems = [
        { name: "ראשי", href: "/", icon: Home },
        { name: "פיננסים", href: "/finance", icon: PieChart },
        { name: "תכנון", href: "/planning", icon: Calendar },
    ];

    return (
        <aside className="w-64 h-screen bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col flex-shrink-0 sticky top-0">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">לוח משפחה</h1>
            </div>
            <nav className="flex-1 py-4">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className="flex items-center gap-3 px-6 py-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900 transition-colors"
                                aria-label={item.name}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">© 2026 משפחה</p>
            </div>
        </aside>
    );
}
