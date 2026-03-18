'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { toggleReminderCompletionAction } from '@/app/(app)/planning/actions';
import { ReminderDialog } from './ReminderDialog';
import { Database } from '@/types/database.types';

type ReminderRow = Database['public']['Tables']['reminders']['Row'];

export function ReminderRowActions({
  reminder,
  customTypes,
}: {
  reminder: ReminderRow;
  customTypes: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    await toggleReminderCompletionAction(reminder.id, checked);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        checked={!!reminder.is_completed}
        onCheckedChange={handleToggle}
        disabled={loading}
        aria-label="Mark as completed"
      />

      <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => setEditOpen(true)}>
        <Edit className="h-4 w-4 text-zinc-500" />
        <span className="sr-only">ערוך משימה</span>
      </Button>

      <ReminderDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        reminder={reminder}
        customTypes={customTypes}
      />
    </div>
  );
}
