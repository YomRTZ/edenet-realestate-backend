'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  PropertyRegistrationForm,
  SubmitRegistrationConnectGate,
} from '@/components/submit/PropertyRegistrationForm';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store/hooks';

export default function SubmitPropertyRegistrationPage() {
  const isConnected = useAppSelector((s) => s.wallet.isConnected);

  return (
    <DashboardShell>
      <DashboardHeader
        title="Submit property registration request"
        description="Register a new property for registry review. Files are stored off-chain; you sign one transaction to record the request."
        actions={
          <Link href="/dashboard/listings">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-4" />}>
              Back to marketplace listings
            </Button>
          </Link>
        }
      />

      <div className="mx-auto max-w-3xl">
        {isConnected ? <PropertyRegistrationForm /> : <SubmitRegistrationConnectGate />}
      </div>
    </DashboardShell>
  );
}
