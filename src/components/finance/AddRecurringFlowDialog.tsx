"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import { CategoryType, CATEGORY_TYPES, CATEGORY_DOMAIN_LABELS } from "@/lib/constants";

type RecurringFlowRow = Database['public']['Tables']['recurring_flows']['Row'];

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";

export function AddRecurringFlowDialog({
  triggerButton,
  flowToEdit,
  accounts,
}: {
  triggerButton?: React.ReactNode;
  flowToEdit?: RecurringFlowRow;
  accounts?: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!flowToEdit;

  // Form State
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<CategoryType>(CATEGORY_TYPES.INCOME);
  const [frequency, setFrequency] = useState("monthly");
  const [accountId, setAccountId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [domain, setDomain] = useState("general");

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevFlowToEdit, setPrevFlowToEdit] = useState(flowToEdit);

  if (open !== prevOpen || flowToEdit !== prevFlowToEdit) {
    setPrevOpen(open);
    setPrevFlowToEdit(flowToEdit);

    if (open && isEditing && flowToEdit) {
      setName(flowToEdit.name || "");
      setAmount(flowToEdit.amount ? flowToEdit.amount.toString() : "");
      setType((flowToEdit.type as CategoryType) || CATEGORY_TYPES.INCOME);
      setFrequency(flowToEdit.frequency || "monthly");
      setAccountId(flowToEdit.account_id || "");
      setStartDate(flowToEdit.start_date || "");
      setEndDate(flowToEdit.end_date || "");
      setDomain(flowToEdit.domain || "general");
    } else if (!open && !isEditing) {
      setName("");
      setAmount("");
      setType(CATEGORY_TYPES.INCOME);
      setFrequency("monthly");
      setAccountId("");
      setStartDate("");
      setEndDate("");
      setDomain("general");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      amount: parseFloat(amount),
      type,
      frequency,
      account_id: accountId === "none" ? null : accountId || null,
      start_date: startDate || null,
      end_date: endDate || null,
      domain: domain || 'general',
      is_active: true,
    };

    let error;

    if (isEditing && flowToEdit) {
      const { error: updateError } = await supabase
        .from("recurring_flows")
        // @ts-expect-error: Supabase TS inference resolves to never for manually added tables
        .update(payload)
        .eq("id", flowToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("recurring_flows")
        // @ts-expect-error: Supabase TS inference resolves to never for manually added tables
        .insert(payload);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      console.error("Error saving recurring flow:", error);
      alert(isEditing ? "שגיאה בעדכון התזרים" : "שגיאה בהוספת תזרים קבוע");
    } else {
      setOpen(false);
      // Refresh the page data
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            variant={isEditing ? "ghost" : "default"}
            size={isEditing ? "icon" : "default"}
          >
            {isEditing ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <>
                <Plus className="ml-2 h-4 w-4" />
                הוסף תזרים קבוע
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת תזרים קבוע" : "הוספת תזרים קבוע (Salary/Rent)"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "עדכן את פרטי התזרים הקיים. השינוי ישפיע על התחזיות העתידיות."
              : "הגדר הכנסה או הוצאה קבועה (כגון משכורת, שכר דירה, או ארנונה) לצורך תחזית ומעקב חריגות."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              שם התזרים
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: משכורת - גל"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              סוג
            </Label>
            <Select value={type} onValueChange={(val) => setType(val as CategoryType)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value={CATEGORY_TYPES.INCOME}>הכנסה קבועה (+)</SelectItem>
                <SelectItem value={CATEGORY_TYPES.EXPENSE}>הוצאה קבועה (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              סכום צפוי
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="₪"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="freq" className="text-right">
              תדירות
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר תדירות" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="monthly">חודשי (Monthly)</SelectItem>
                <SelectItem value="yearly">שנתי (Yearly)</SelectItem>
                <SelectItem value="weekly">שבועי (Weekly)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="domain" className="text-right">
              תחום
            </Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר תחום" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {Object.entries(CATEGORY_DOMAIN_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_date" className="text-right">
              תחימת התחלה
            </Label>
            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_date" className="text-right">
              תחימת סיום
            </Label>
            <Input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account" className="text-right">
              אמצעי תשלום
            </Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר חשבון (אופציונלי)" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="none">ללא אמצעי תשלום</SelectItem>
                {accounts?.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "שומר..." : isEditing ? "שמור שינויים" : "שמור תזרים"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
