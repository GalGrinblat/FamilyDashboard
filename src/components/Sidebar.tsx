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
  Briefcase,
  WalletCards,
  Award,
  Wrench,
  Calculator,
  BarChart3,
  FileText,
  LucideIcon,
} from 'lucide-react';

type SubItem = { href: string; label: string };

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: SubItem[];
};

const navItems: NavItem[] = [
  { href: '/', label: 'ראשי', icon: Home },
  { href: '/liquidity', label: 'עו״ש ותזרים', icon: Scale },
  { href: '/transactions', label: 'יומן תנועות', icon: ArrowRightLeft },
  {
    href: '/wealth',
    label: 'הון ונכסים',
    icon: TrendingUp,
    subItems: [
      { href: '/wealth/investments', label: 'השקעות' },
      { href: '/wealth/real-estate', label: 'נדל״ן' },
      { href: '/wealth/pension', label: 'פנסיה וגמל' },
      { href: '/wealth/rsu', label: 'RSU' },
    ],
  },
  { href: '/housing', label: 'מגורים ומשק בית', icon: Sofa },
  { href: '/transportation', label: 'תחבורה', icon: Car },
  { href: '/insurances', label: 'ביטוחים', icon: Shield },
  { href: '/planning', label: 'תכנון', icon: CalendarDays },
  {
    href: '/tools',
    label: 'כלים',
    icon: Wrench,
    subItems: [
      { href: '/tools/salary', label: 'מחשבון שכר' },
      { href: '/tools/capital-gains', label: 'מס רווחי הון' },
      { href: '/tools/tax-report', label: 'דוח מס שנתי' },
    ],
  },
  { href: '/analytics', label: 'דוחות ואנליטיקה', icon: LineChart },
  { href: '/settings', label: 'הגדרות', icon: Settings },
];

// Icons for sub-items
const subItemIcons: Record<string, LucideIcon> = {
  '/wealth/investments': LineChart,
  '/wealth/real-estate': Briefcase,
  '/wealth/pension': WalletCards,
  '/wealth/rsu': Award,
  '/tools/salary': Calculator,
  '/tools/capital-gains': BarChart3,
  '/tools/tax-report': FileText,
};

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="space-y-1 flex-1 pt-6">
      {navItems.map((item) => {
        const isParentActive =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        const isExactActive = pathname === item.href;

        return (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-lg font-medium rounded-xl transition-all duration-200 group ${
                isExactActive
                  ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                  : isParentActive && item.subItems
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {isExactActive && !item.subItems && (
                <div className="mr-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              )}
            </Link>

            {/* Sub-navigation — shown when parent route is active */}
            {item.subItems && isParentActive && (
              <div className="mr-4 mt-0.5 mb-1 border-r-2 border-indigo-200 dark:border-indigo-800 pr-2 space-y-0.5">
                {item.subItems.map((sub) => {
                  const SubIcon = subItemIcons[sub.href];
                  const isSubActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-3 py-2 text-base font-medium rounded-lg transition-all duration-150 ${
                        isSubActive
                          ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
                      }`}
                    >
                      {SubIcon && <SubIcon className="h-3.5 w-3.5" />}
                      {sub.label}
                      {isSubActive && (
                        <div className="mr-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="hidden border-l bg-zinc-50 dark:bg-zinc-950 md:flex w-64 min-h-screen p-4 flex-col">
        <div className="flex h-14 items-center border-b px-4 font-semibold text-lg">
          ניהול משק בית
        </div>
        <NavLinks pathname={pathname} />
      </div>
    </>
  );
}
