'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Settings,
  Sofa,
  CalendarDays,
  ArrowRightLeft,
  Car,
  Shield,
  Scale,
  LineChart,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'ראשי', icon: Home },
  { href: '/liquidity', label: 'עו״ש ותזרים', icon: Scale },
  { href: '/transactions', label: 'יומן תנועות', icon: ArrowRightLeft },
  { href: '/wealth', label: 'הון ונכסים', icon: TrendingUp },
  { href: '/housing', label: 'מגורים ומשק בית', icon: Sofa },
  { href: '/transportation', label: 'תחבורה', icon: Car },
  { href: '/insurances', label: 'ביטוחים', icon: Shield },
  { href: '/planning', label: 'תכנון', icon: CalendarDays },
  { href: '/analytics', label: 'דוחות ואנליטיקה', icon: LineChart },
  { href: '/settings', label: 'הגדרות', icon: Settings },
];

const NavLinks = ({
  pathname,
  navItems,
}: {
  pathname: string;
  navItems: { href: string; label: string; icon: LucideIcon }[];
}) => (
  <nav className="space-y-2 flex-1 pt-6">
    {navItems.map((item) => {
      const isActive =
        pathname === item.href || (pathname?.startsWith(`${item.href}/`) && item.href !== '/');
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 text-lg font-medium rounded-xl transition-all duration-200 group ${
            isActive
              ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
              : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
          {isActive && (
            <div className="mr-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
          )}
        </Link>
      );
    })}
  </nav>
);

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="hidden border-l bg-zinc-50 dark:bg-zinc-950 md:flex w-64 min-h-screen p-4 flex-col">
        <div className="flex h-14 items-center border-b px-4 font-semibold text-lg">
          ניהול משק בית
        </div>
        <NavLinks pathname={pathname} navItems={navItems} />
      </div>
    </>
  );
}
