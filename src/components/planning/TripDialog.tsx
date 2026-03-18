'use client';

import { useState } from 'react';
import { addTripAction } from '@/app/(app)/planning/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function TripDialog({ triggerButton }: { triggerButton?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', name);
    if (startDate) formData.append('start_date', startDate);
    if (endDate) formData.append('end_date', endDate);
    if (budget) formData.append('budget', budget);

    const result = await addTripAction(formData);

    setLoading(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      setOpen(false);
      // Reset form
      setName('');
      setStartDate('');
      setEndDate('');
      setBudget('');
      setErrorMsg('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            חופשה חדשה
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>תכנון חופשה חדשה</DialogTitle>
          <DialogDescription>פתח תיקיית מסע חדש למעקב אחר תקציב והוצאות.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trip_name" className="text-right">
              שם החופשה
            </Label>
            <Input
              id="trip_name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: סקי 2026"
              autoComplete="off"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_date" className="text-right">
              תאריך התחלה
            </Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_date" className="text-right">
              תאריך חזרה
            </Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trip_budget" className="text-right">
              תקציב משוער
            </Label>
            <Input
              id="trip_budget"
              name="budget"
              type="number"
              inputMode="decimal"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="col-span-3"
              placeholder="₪"
              autoComplete="off"
            />
          </div>
          {errorMsg && (
            <div className="text-lg font-medium text-destructive mt-2 text-right">{errorMsg}</div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'פותח תיק מסע...' : 'צור חופשה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
