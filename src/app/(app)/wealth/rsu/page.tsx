import { RsuTab } from '@/components/wealth/rsu/RsuTab';
import { PageHeader } from '@/components/layout/PageHeader';
import { Award } from 'lucide-react';

export default function RsuPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="RSU" icon={Award} />
      <RsuTab />
    </div>
  );
}
