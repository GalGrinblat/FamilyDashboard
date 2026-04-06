import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Calculator, BarChart3, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import Link from 'next/link';

const tools = [
  {
    href: '/tools/salary',
    title: 'מחשבון שכר',
    description: 'חישוב משכורת נטו — מס הכנסה, ביטוח לאומי, מס בריאות ופנסיה.',
    icon: Calculator,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    href: '/tools/capital-gains',
    title: 'מס רווחי הון (IBKR)',
    description: 'חישוב מס רווחי הון מניירות ערך בחשבון Interactive Brokers, כולל המרה לשקלים.',
    icon: BarChart3,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    href: '/tools/tax-report',
    title: 'דוח מס שנתי (1301)',
    description: 'מדריך להגשת דוח מס שנתי — רשימת מסמכים, הנחיות מילוי וקישורים.',
    icon: FileText,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
];

export default function ToolsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="כלים"
        icon={Wrench}
        description="כלים פיננסיים לניהול מיסים וחישובי שכר."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer">
              <CardHeader className="space-y-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.bg} transition-transform duration-200 group-hover:scale-110`}
                >
                  <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
