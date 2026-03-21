'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

import { Database } from '@/types/database.types';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];

interface AddMaintenanceDialogProps {
  cars: VehicleRow[];
}

export function MaintenanceDialog({ cars }: AddMaintenanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const [carId, setCarId] = useState(cars.length > 0 ? cars[0].id : '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('garage');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [mileage, setMileage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carId) return;
    setLoading(true);
    setErrorMsg('');

    const payload = {
      vehicle_id: carId,
      date,
      type,
      description: description || null,
      cost: cost ? parseFloat(cost) : null,
      mileage: mileage ? parseInt(mileage) : null,
    };

    const { error } = await supabase.from('vehicle_maintenance').insert(payload);

    // Also update last_service_km on the vehicle if mileage provided
    if (!error && mileage) {
      await supabase
        .from('vehicles')
        .update({ last_service_km: parseInt(mileage), last_service_date: date })
        .eq('id', carId);
    }

    setLoading(false);

    if (error) {
      console.error('Error saving maintenance log:', error);
      setErrorMsg('שגיאה בשמירת הטיפול');
      return;
    }

    setOpen(false);
    setDescription('');
    setCost('');
    setMileage('');
    router.refresh();
  };

  if (cars.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> גיליון טיפול
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>תיעוד טיפול או אירוע</DialogTitle>
          <DialogDescription>הוסף רשומת טיפול מוסך, טסט שנתי או אירוע תחזוקה.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="car_id" className="text-right pt-2">
              רכב
            </Label>
            <Select value={carId} onValueChange={setCarId} required>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר רכב" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {cars.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="date" className="text-right pt-2">
              תאריך
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3 text-left"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="type" className="text-right pt-2">
              סוג אירוע
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="garage">טיפול מוסך (תחזוקה)</SelectItem>
                <SelectItem value="test">טסט (רישוי שנתי)</SelectItem>
                <SelectItem value="insurance">חידוש ביטוח</SelectItem>
                <SelectItem value="repair">תיקון תקלה / תאונה</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="desc" className="text-right pt-2">
              תיאור קצר
            </Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="למשל: טיפול 15,000, החלפת בלמים"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="mileage" className="text-right pt-2 text-base">
              ק״מ (אופציונלי)
            </Label>
            <Input
              id="mileage"
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="col-span-3"
              placeholder="למשל: 45000"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="cost" className="text-right pt-2">
              עלות (₪)
            </Label>
            <Input
              id="cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="col-span-3"
              placeholder="עלות הטיפול"
              required
            />
          </div>
          {errorMsg && <div className="text-destructive text-base text-right mt-1">{errorMsg}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : 'שמור טיפול'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
