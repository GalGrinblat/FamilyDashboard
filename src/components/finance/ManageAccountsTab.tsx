"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/types/database.types";
import { Landmark, CreditCard, TrendingUp } from "lucide-react";
import { AccountDialog } from "./AccountDialog";

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];

export function ManageAccountsTab({ accounts }: { accounts: AccountRow[] }) {

    const checkingAccounts = accounts.filter(a => a.type === 'checking' || a.type === 'bank');
    const creditAccounts = accounts.filter(a => a.type === 'credit' || a.type === 'credit_card');
    const investmentAccounts = accounts.filter(a => a.type === 'investment');

    const totalChecking = checkingAccounts.reduce((sum, a) => sum + Number(a.current_balance || 0), 0);
    const totalCredit = creditAccounts.reduce((sum, a) => sum + Number(a.current_balance || 0), 0);
    const totalInvestment = investmentAccounts.reduce((sum, a) => sum + Number(a.current_balance || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold">ניהול חשבונות ונכסים נזילים</h3>
                    <p className="text-sm text-muted-foreground">
                        האזור לריכוז וקביעת יתרות הפתיחה לחשבונות, כרטיסי אשראי וחסכונות.
                    </p>
                </div>
                <AccountDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-3">

                {/* Bank Accounts */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Landmark className="h-5 w-5 text-indigo-500" />
                            עו״ש ומזומן
                        </CardTitle>
                        <CardDescription>יתרה כוללת: <span className="font-semibold text-zinc-900 dark:text-zinc-100">₪{totalChecking.toLocaleString()}</span></CardDescription>
                    </CardHeader>
                    <CardContent>
                        {checkingAccounts.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">לא הוגדרו חשבונות בנק.</p>
                        ) : (
                            <div className="space-y-4 mt-2">
                                {checkingAccounts.map(acc => (
                                    <div key={acc.id} className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 group">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{acc.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold ${Number(acc.current_balance) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                ₪{Number(acc.current_balance).toLocaleString()}
                                            </span>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <AccountDialog accountToEdit={acc} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Credit Cards */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="h-5 w-5 text-rose-500" />
                            כרטיסי אשראי
                        </CardTitle>
                        <CardDescription>התחייבויות עדכניות: <span className="font-semibold text-zinc-900 dark:text-zinc-100">₪{totalCredit.toLocaleString()}</span></CardDescription>
                    </CardHeader>
                    <CardContent>
                        {creditAccounts.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">לא הוגדרו כרטיסי אשראי.</p>
                        ) : (
                            <div className="space-y-4 mt-2">
                                {creditAccounts.map(acc => {
                                    const meta = acc.metadata as { billingDay?: string } | null;
                                    return (
                                        <div key={acc.id} className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 group">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{acc.name}</span>
                                                {meta?.billingDay && (
                                                    <span className="text-xs text-muted-foreground">חיוב ב-{meta.billingDay} לחודש</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-rose-600">
                                                    ₪{Math.abs(Number(acc.current_balance)).toLocaleString()}
                                                </span>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <AccountDialog accountToEdit={acc} />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Investments */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            השקעות שוטפות
                        </CardTitle>
                        <CardDescription>שווי כולל: <span className="font-semibold text-zinc-900 dark:text-zinc-100">₪{totalInvestment.toLocaleString()}</span></CardDescription>
                    </CardHeader>
                    <CardContent>
                        {investmentAccounts.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">לא הוגדרו עדיין קופות השקעה לטווח קצר.</p>
                        ) : (
                            <div className="space-y-4 mt-2">
                                {investmentAccounts.map(acc => (
                                    <div key={acc.id} className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 group">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{acc.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-emerald-600">
                                                ₪{Number(acc.current_balance).toLocaleString()}
                                            </span>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <AccountDialog accountToEdit={acc} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
