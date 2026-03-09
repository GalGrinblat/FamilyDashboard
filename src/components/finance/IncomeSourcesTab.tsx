"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/types/database.types";
import { Landmark, Trash2 } from "lucide-react";
import { AddRecurringFlowDialog } from "./AddRecurringFlowDialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type RecurringFlowRow = Database["public"]["Tables"]["recurring_flows"]["Row"];
type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];

export function IncomeSourcesTab({ 
    incomeFlows, 
    accounts 
}: { 
    incomeFlows: RecurringFlowRow[];
    accounts: AccountRow[];
}) {
    const router = useRouter();
    const supabase = createClient();

    const handleDelete = async (id: string) => {
        if (!window.confirm("האם למחוק תזרים זה?")) return;
        const { error } = await supabase.from('recurring_flows').delete().eq('id', id);
        if (error) {
            console.error(error);
            alert("שגיאה במחיקת תזרים");
        } else {
            router.refresh();
        }
    };

    const totalIncome = incomeFlows.reduce((sum, flow) => sum + Number(flow.amount || 0), 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-emerald-500" />
                        מקורות הכנסה
                    </CardTitle>
                    <CardDescription>
                        סך הכנסות חודשיות מוערכות: <span className="font-semibold text-zinc-900 dark:text-zinc-100">₪{totalIncome.toLocaleString()}</span>
                    </CardDescription>
                </div>
                <AddRecurringFlowDialog accounts={accounts} />
            </CardHeader>
            <CardContent>
                {incomeFlows.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-8 text-center border rounded-md bg-zinc-50 dark:bg-zinc-900/50 mt-4">
                        לא הוגדרו מקורות הכנסה.
                    </div>
                ) : (
                    <div className="space-y-4 mt-4">
                        {incomeFlows.map(flow => {
                            const account = accounts.find(a => a.id === flow.account_id);
                            return (
                                <div key={flow.id} className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0 group">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{flow.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {flow.frequency === 'monthly' ? 'חודשי' : flow.frequency === 'yearly' ? 'שנתי' : flow.frequency} 
                                            {account ? ` • מופקד ל${account.name}` : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-emerald-600">
                                            ₪{Number(flow.amount).toLocaleString()}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <AddRecurringFlowDialog 
                                                flowToEdit={flow} 
                                                accounts={accounts} 
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(flow.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
