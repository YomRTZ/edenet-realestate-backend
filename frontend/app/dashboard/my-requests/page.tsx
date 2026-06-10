'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Loader2, Plus, RefreshCw, Wallet } from 'lucide-react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardFilterTabs } from '@/components/dashboard/DashboardFilterTabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { MyRequestsList } from '@/components/requests/MyRequestsList';
import { WalletConnectControl } from '@/components/web3/WalletConnectControl';
import { Button } from '@/components/ui/Button';
import { useMyRequests } from '@/hooks/useMyRequests';
import { matchesRequestFilter } from '@/lib/registry-request-labels';
import { dashboardSectionStackClass } from '@/lib/constants/dashboard-layout';
import type { RegistryRequestFilter } from '@/types/registry-request';
const FILTER_TABS: { id: RegistryRequestFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'DECLINED', label: 'Declined' },
];

function MyRequestsConnectGate() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
      <div className="mx-auto max-w-md text-center">
        <Wallet className="mx-auto mb-4 size-10 text-muted" aria-hidden />
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Connect your wallet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Registration requests are tied to the wallet that signed{' '}
          <span className="font-medium text-foreground">submitRequest</span> on the registry. Connect
          to see your pending, approved, and declined submissions.
        </p>
        <div className="mt-6 flex justify-center">
          <WalletConnectControl fullWidth />
        </div>
      </div>
    </div>
  );
}

export default function MyRequestsPage() {
  const { requests, loading, error, refresh, isConnected, mockMode } = useMyRequests();
  const [filter, setFilter] = useState<RegistryRequestFilter>('ALL');

  const counts = useMemo(() => {
    const pending = requests.filter((r) => r.status === 0).length;
    const approved = requests.filter((r) => r.status === 1).length;
    const declined = requests.filter((r) => r.status === 2).length;
    return {
      ALL: requests.length,
      PENDING: pending,
      APPROVED: approved,
      DECLINED: declined,
    };
  }, [requests]);

  const filtered = useMemo(
    () => requests.filter((r) => matchesRequestFilter(r.status, filter)),
    [requests, filter],
  );

  const tabOptions = FILTER_TABS.map((tab) => ({
    ...tab,
    count: counts[tab.id],
  }));

  return (
    <DashboardShell>
      <div className={dashboardSectionStackClass}>
        <DashboardHeader
          title="My property requests"
          description="Track registration requests you submitted to the registry. Status updates come from the chain after government review."
          actions={
            isConnected ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/dashboard/listings/create">
                  <Button variant="outline" size="sm" leftIcon={<Plus className="size-4" />}>
                    New request
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={
                    loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )
                  }
                  onClick={() => void refresh()}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
            ) : null
          }
        />

        {mockMode && isConnected ? (
          <p className="-mt-4 text-xs text-muted">
            Demo mode — showing sample requests for your wallet until the live registry is connected.
          </p>
        ) : null}

        {!isConnected ? (
          <MyRequestsConnectGate />
        ) : (
          <>
            <DashboardFilterTabs
              options={tabOptions}
              value={filter}
              onChange={(id) => setFilter(id as RegistryRequestFilter)}
            />

            {error ? (
              <div
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {loading && requests.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Loading your requests…
              </div>
            ) : filtered.length === 0 ? (
              <DashboardEmptyState
                icon={ClipboardList}
                title={requests.length === 0 ? 'No requests yet' : 'No requests in this filter'}
                description={
                  requests.length === 0
                    ? 'Submit a property registration to mint an NFT after government approval.'
                    : 'Try another status tab or refresh after a new submission.'
                }
                action={
                  requests.length === 0 ? (
                    <Link href="/dashboard/listings/create">
                      <Button variant="primary" leftIcon={<Plus className="size-4" />}>
                        Submit your first request
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" onClick={() => setFilter('ALL')}>
                      Show all
                    </Button>
                  )
                }
              />
            ) : (
              <MyRequestsList requests={filtered} />
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
