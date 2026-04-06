'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle2, Circle, ArrowLeft, ExternalLink, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';

// ─── Document Checklist Items ─────────────────────────────────────────────

interface DocumentItem {
  id: string;
  title: string;
  source: string;
  purpose: string;
  clause: string;
  tip?: string;
}

const DOCUMENT_CHECKLIST: DocumentItem[] = [
  {
    id: 'form-106',
    title: 'טופס 106',
    source: 'מעסיק (כל מעסיק בנפרד)',
    purpose: 'סיכום שנתי של שכר, ניכויים, ומס שנוכה במקור',
    clause: 'סעיף 134(א) לפקודת מס הכנסה',
    tip: 'המעסיק מחויב להנפיק עד 31 במרץ. אם לא קיבלת — פנה לחשבות.',
  },
  {
    id: 'form-867',
    title: 'טופס 867',
    source: 'בנקים, ברוקרים ישראליים',
    purpose: 'דיווח על ריבית, דיבידנדים, ורווחי הון מניירות ערך מקומיים',
    clause: 'סעיף 91 לפקודת מס הכנסה',
    tip: 'הבנק שולח עד סוף מרץ. חלק מהבנקים מאפשרים הורדה באזור האישי.',
  },
  {
    id: 'form-280',
    title: 'טופס 280',
    source: 'חברות ביטוח / קרנות פנסיה',
    purpose: 'אישור הפקדות לפנסיה, ביטוח חיים, וקרן השתלמות — לצורך ניכוי/זיכוי במס',
    clause: 'סעיפים 45א, 47 לפקודת מס הכנסה',
    tip: 'ניתן לבקש במרכז השירות של חברת הביטוח או הפנסיה.',
  },
  {
    id: 'ibkr-statement',
    title: 'דוח Activity Statement — IBKR',
    source: 'Interactive Brokers',
    purpose: 'פירוט עסקאות בניירות ערך בחו"ל — לצורך מילוי נספח ג\' (טופס 1325)',
    clause: "סעיף 91, נספח ג' (טופס 1325)",
    tip: 'הורד דוח שנתי מ-Client Portal → Statements → Activity.',
  },
  {
    id: 'section-46',
    title: 'קבלות תרומה — סעיף 46',
    source: 'עמותות מוכרות (סעיף 46)',
    purpose: 'זיכוי מס בגין תרומות (35% מסכום התרומה, עד 30% מההכנסה החייבת)',
    clause: 'סעיף 46 לפקודת מס הכנסה',
    tip: 'רק תרומות לעמותות בעלות אישור סעיף 46. ודא שבקבלה מופיע מספר האישור.',
  },
  {
    id: 'mortgage-interest',
    title: 'אישור ריבית משכנתא',
    source: 'הבנק למשכנתאות',
    purpose: 'ניכוי ריבית על דירת מגורים (בתנאים מסוימים)',
    clause: 'סעיף 9(2) לפקודת מס הכנסה',
    tip: 'רלוונטי בעיקר לדירה ראשונה שנרכשה לפני 2017.',
  },
];

// ─── Filing Steps ─────────────────────────────────────────────────────────

interface FilingStep {
  number: number;
  title: string;
  description: string;
  details: string;
}

const FILING_STEPS: FilingStep[] = [
  {
    number: 1,
    title: 'הרשמה / כניסה לפורטל רשות המסים',
    description: 'התחבר עם כרטיס חכם, ביומטרי, או חשבון אישי באתר שע"מ.',
    details: 'כניסה דרך shaam.gov.il → מערכת שע"מ → דוח שנתי מקוון. לרישום ראשוני נדרש אימות נוסף.',
  },
  {
    number: 2,
    title: 'מילוי פרטים אישיים',
    description: 'שם, ת.ז., מצב משפחתי, מספר ילדים, ופרטי בן/בת זוג.',
    details:
      'פרטים אלה משפיעים על נקודות הזיכוי. ודא שהמצב המשפחתי ומספר הילדים מעודכנים לשנת המס.',
  },
  {
    number: 3,
    title: 'דיווח הכנסות מעבודה',
    description: 'העתק את הנתונים מטופס 106 של כל מעסיק.',
    details:
      'יש למלא: הכנסה ברוטו, מס שנוכה במקור, ביטוח לאומי, והפרישות פנסיוניות. אם היו מספר מעסיקים — הזן כל אחד בנפרד.',
  },
  {
    number: 4,
    title: 'דיווח רווחי הון מקומיים',
    description: 'מלא לפי טופס 867 מהבנק/ברוקר הישראלי.',
    details: 'רווחי הון מניירות ערך סחירים חייבים ב-25%. ריבית ודיבידנדים — לפי הטפסים שהתקבלו.',
  },
  {
    number: 5,
    title: 'מילוי נספח ג\' (טופס 1325) — רווחי הון מחו"ל',
    description: 'מלא לפי הנתונים ממחשבון רווחי ההון (IBKR) שבכלי הזה.',
    details:
      'יש לרשום כל עסקה בנפרד: תאריך רכישה, תאריך מכירה, עלות מתואמת בשקלים, תמורה בשקלים, ורווח/הפסד. השתמש בכלי "מס רווחי הון" כדי לייצר את הנתונים.',
  },
  {
    number: 6,
    title: 'ניכויים וזיכויים',
    description: 'הזן תרומות (סעיף 46), פנסיה (סעיף 47), וזיכויים נוספים.',
    details:
      'תרומות: זיכוי של 35% מסכום התרומה. פנסיה: ניכוי/זיכוי לפי סכומי ההפקדה מטופס 280. קרן השתלמות: עצמאיים בלבד.',
  },
  {
    number: 7,
    title: 'שליחה ותשלום / החזר',
    description: 'בדוק את הסיכום, שלח את הדוח, ושלם או קבל החזר.',
    details:
      'לאחר השליחה מתקבל מספר אישור. אם מגיע החזר — יש למלא פרטי חשבון בנק. תשלום חוב מס ניתן בהוראת קבע או תשלום מקוון.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────

export function TaxReportGuide() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('tax-report-checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  function toggleItem(id: string) {
    setCheckedItems((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('tax-report-checklist', JSON.stringify(updated));
      } catch {
        // Silently fail
      }
      return updated;
    });
  }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ─── Section 1: Document Checklist ──────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            רשימת מסמכים נדרשים ({checkedCount}/{DOCUMENT_CHECKLIST.length})
          </CardTitle>
          <CardDescription>
            אסוף את כל המסמכים הבאים לפני מילוי הדוח. לחץ כדי לסמן השלמה.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Progress bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 mb-4">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(checkedCount / DOCUMENT_CHECKLIST.length) * 100}%` }}
            />
          </div>

          {DOCUMENT_CHECKLIST.map((doc) => {
            const isChecked = checkedItems[doc.id] || false;
            return (
              <div
                key={doc.id}
                className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 ${
                  isChecked
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                }`}
                onClick={() => toggleItem(doc.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <h4
                        className={`text-base font-semibold ${isChecked ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {doc.title}
                      </h4>
                      <span className="text-base text-muted-foreground shrink-0 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {doc.clause}
                      </span>
                    </div>
                    <p className="text-base text-muted-foreground">
                      <strong>מקור:</strong> {doc.source}
                    </p>
                    <p className="text-base text-muted-foreground">
                      <strong>מטרה:</strong> {doc.purpose}
                    </p>
                    {doc.tip && (
                      <p className="text-base text-blue-600 dark:text-blue-400 flex items-start gap-1.5">
                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                        {doc.tip}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ─── Section 2: IBKR Integration Link ──────────────────── */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-950">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-base font-medium">יש לך חשבון ב-Interactive Brokers?</p>
            <p className="text-base text-muted-foreground">
              השתמש בכלי &quot;מס רווחי הון&quot; כדי לחשב אוטומטית את נספח ג&apos; (טופס 1325) מתוך
              הדוח השנתי של IBKR.
            </p>
          </div>
          <Link href="/tools/capital-gains">
            <span className="inline-flex items-center gap-1 text-base font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
              לכלי רווחי הון
              <ArrowLeft className="h-4 w-4" />
            </span>
          </Link>
        </CardContent>
      </Card>

      {/* ─── Section 3: Filing Walkthrough ──────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>מדריך הגשה — דוח 1301</CardTitle>
          <CardDescription>שלבים למילוי דוח מס שנתי באתר רשות המסים (shaam.gov.il)</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible dir="rtl" className="w-full">
            {FILING_STEPS.map((s) => (
              <AccordionItem key={s.number} value={`step-${s.number}`}>
                <AccordionTrigger className="text-base hover:no-underline">
                  <div className="flex items-center gap-3 text-start">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-base font-bold shrink-0">
                      {s.number}
                    </span>
                    <div>
                      <span className="font-semibold">{s.title}</span>
                      <span className="block text-muted-foreground font-normal">
                        {s.description}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base pr-11 pb-4 text-muted-foreground leading-relaxed">
                  {s.details}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* External Links */}
      <Card>
        <CardHeader>
          <CardTitle>קישורים שימושיים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="https://www.gov.il/he/service/annual-tax-report"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-base text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            הגשת דוח שנתי — gov.il
          </a>
          <a
            href="https://secapp.taxes.gov.il"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-base text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            אזור אישי — שע&quot;מ (מערכת שע&quot;מ)
          </a>
          <a
            href="https://www.gov.il/he/departments/general/itc-filing_a_tax_return"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-base text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            מדריך הגשת דוח שנתי — רשות המסים
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
