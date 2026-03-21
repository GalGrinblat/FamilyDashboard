import { RealEstateTab } from '@/components/wealth/real-estate/RealEstateTab';
import { PageHeader } from '@/components/layout/PageHeader';
import { Briefcase } from 'lucide-react';

export default function RealEstatePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="נדל״ן" icon={Briefcase} />
      <RealEstateTab />
    </div>
  );
}
