'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, CheckCircle2, Pencil, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Database } from '@/types/database.types';
import { GoalFormSchema, GoalFormData } from '@/lib/schemas';
import { GOAL_CATEGORIES, GOAL_CATEGORY_LABELS, GoalCategory } from '@/lib/constants';
import { upsertGoalAction, markGoalCompleteAction } from '@/app/(app)/planning/actions';
import { formatCurrency } from '@/lib/utils';

type GoalRow = Database['public']['Tables']['financial_goals']['Row'];

const GOAL_CATEGORY_OPTIONS = Object.entries(GOAL_CATEGORY_LABELS).map(([value, label]) => ({
  value: value as GoalCategory,
  label,
}));

function GoalDialog({ goal, triggerButton }: { goal?: GoalRow; triggerButton: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isEditing = !!goal;

  const defaultValues: GoalFormData = {
    title: goal?.title ?? '',
    category: (goal?.category as GoalCategory) ?? GOAL_CATEGORIES.OTHER,
    target_amount: goal?.target_amount ?? 0,
    current_amount: goal?.current_amount ?? 0,
    target_date: goal?.target_date ?? null,
    notes: goal?.notes ?? null,
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(GoalFormSchema) as Resolver<GoalFormData>,
    defaultValues,
  });

  const category = watch('category');

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset(defaultValues);
  };

  const onSubmit = async (data: GoalFormData) => {
    const result = await upsertGoalAction(data, goal?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'היעד עודכן בהצלחה' : 'יעד פיננסי נוסף בהצלחה');
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[460px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת יעד' : 'יעד פיננסי חדש'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="title" className="text-right pt-2">
              כותרת
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="title"
                {...register('title')}
                placeholder="למשל: קרן חירום ל-3 חודשים"
                autoComplete="off"
              />
              {errors.title && <p className="text-base text-rose-500">{errors.title.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="category" className="text-right pt-2">
              קטגוריה
            </Label>
            <Select value={category} onValueChange={(v) => setValue('category', v as GoalCategory)}>
              <SelectTrigger className="col-span-3" id="category" dir="rtl">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {GOAL_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="target_amount" className="text-right pt-2">
              סכום יעד (₪)
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="target_amount"
                type="number"
                step="100"
                {...register('target_amount')}
                placeholder="0"
              />
              {errors.target_amount && (
                <p className="text-base text-rose-500">{errors.target_amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="current_amount" className="text-right pt-2">
              חסכתי עד כה (₪)
            </Label>
            <Input
              id="current_amount"
              type="number"
              step="100"
              {...register('current_amount')}
              placeholder="0"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="target_date" className="text-right pt-2">
              תאריך יעד
            </Label>
            <Input
              id="target_date"
              type="date"
              {...register('target_date')}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              הערות
            </Label>
            <Input
              id="notes"
              {...register('notes')}
              placeholder="אופציונלי"
              className="col-span-3"
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : isEditing ? 'שמור שינויים' : 'הוסף יעד'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GoalCard({ goal }: { goal: GoalRow }) {
  const router = useRouter();
  const pct = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const clampedPct = Math.min(pct, 100);

  const handleMarkComplete = async () => {
    const result = await markGoalCompleteAction(goal.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('היעד סומן כהושלם!');
    router.refresh();
  };

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{goal.title}</p>
          <p className="text-base text-muted-foreground mt-0.5">
            {GOAL_CATEGORY_LABELS[goal.category as GoalCategory]}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <GoalDialog
            goal={goal}
            triggerButton={
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="sm" onClick={handleMarkComplete} title="סמן כהושלם">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-base text-muted-foreground">
          <span dir="ltr">{formatCurrency(goal.current_amount)}</span>
          <span dir="ltr">{formatCurrency(goal.target_amount)}</span>
        </div>
        <Progress value={clampedPct} className="h-2" />
        <p className="text-base text-muted-foreground text-left" dir="ltr">
          {clampedPct.toFixed(0)}%
        </p>
      </div>

      {goal.target_date && (
        <p className="text-base text-muted-foreground">
          יעד:{' '}
          {new Intl.DateTimeFormat('he-IL', { year: 'numeric', month: 'long' }).format(
            new Date(goal.target_date),
          )}
        </p>
      )}

      {goal.notes && <p className="text-base text-zinc-500 italic">{goal.notes}</p>}
    </Card>
  );
}

export function GoalsTab({ goals }: { goals: GoalRow[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>יעדים פיננסיים</CardTitle>
          <CardDescription>עקוב אחר היעדים הפיננסיים שלך.</CardDescription>
        </div>
        <GoalDialog
          triggerButton={
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />
              יעד חדש
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Target className="h-10 w-10 mb-3 text-zinc-300 dark:text-zinc-600" />
            <p>אין יעדים פעילים כרגע.</p>
            <GoalDialog
              triggerButton={
                <Button variant="outline" className="mt-4">
                  <Plus className="ml-2 h-4 w-4" />
                  הוסף יעד ראשון
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
