import { PensionTab } from '@/components/wealth/pension/PensionTab';
import { PageHeader } from '@/components/layout/PageHeader';
import { WalletCards } from 'lucide-react';

export default function PensionPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="פנסיה, גמל והשתלמות" icon={WalletCards} />
      <PensionTab />
    </div>
  );
}
