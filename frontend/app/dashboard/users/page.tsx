'use client';

import { useAdminPanel } from '@/hooks/useAdminPanel';
import { useAppSelector } from '@/store/hooks';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardOverviewStats } from '@/components/dashboard/DashboardOverviewStats';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { DashboardSectionLabel } from '@/components/dashboard/DashboardSectionLabel';
import { AssignAdminForm } from '@/components/admin/AssignAdminForm';
import { AdminSection } from '@/components/admin/AdminSection';
import { GovOnlyGate } from '@/components/web3/GovOnlyGate';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WalletConnectControl } from '@/components/web3/WalletConnectControl';
import { dashboardSectionStackClass, dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import { truncateAddress } from '@/lib/utils';
import { Loader2, RefreshCw, Shield, Users, Wallet } from 'lucide-react';

export default function UsersPage() {
  const isConnected = useAppSelector((s) => s.wallet.isConnected);
  const address = useAppSelector((s) => s.wallet.address);
  const isAdmin = useAppSelector((s) => s.wallet.isAdminOnChain);

  const {
    writeContract,
    mockMode,
    properties,
    chainRequests,
    pendingMint,
    stats,
    loading,
    chainError,
    apiError,
    registryError,
    refresh,
  } = useAdminPanel();

  if (!isConnected) {
    return (
      <DashboardShell>
        <DashboardEmptyState
          icon={Wallet}
          title="Connect your wallet"
          description="Connect the government wallet to manage on-chain users and registry participants."
          action={<WalletConnectControl fullWidth />}
        />
      </DashboardShell>
    );
  }

  const alerts = [chainError, apiError, registryError].filter(Boolean) as string[];

  return (
    <DashboardShell>
      <div className={dashboardSectionStackClass}>
        <DashboardHeader
          title="On-chain participants"
          description="Registry wallets, admin roles, and on-chain request overview. Approve/decline submissions from the Property Approvals page."
          actions={
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
          }
        />

        {mockMode && (
          <p className="-mt-2 text-xs text-muted">
            Demo mode — data is simulated until the live registry is connected.
          </p>
        )}

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((msg) => (
              <p
                key={msg}
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {msg}
              </p>
            ))}
          </div>
        )}

        <GovOnlyGate
          title="Government wallet required"
          description="Only the wallet in NEXT_PUBLIC_GOV_WALLET can access admin controls."
        >
          {/* Stats */}
          <section className={dashboardPanelClass}>
            <DashboardSectionLabel className="mb-6 block">Registry overview</DashboardSectionLabel>
            {loading && stats.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Loading registry data…
              </div>
            ) : (
              <DashboardOverviewStats stats={stats} />
            )}
          </section>

          {/* Connected wallet info */}
          <AdminSection
            title="Connected wallet"
            subtitle="Your currently connected address and its registry role."
          >
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
              <Wallet className="size-5 shrink-0 text-accent" aria-hidden />
              <span className="flex-1 font-mono text-sm text-foreground break-all">
                {address}
              </span>
              <Badge variant={isAdmin ? 'verified' : 'gold'} size="sm">
                <Shield className="size-3" />
                {isAdmin ? 'Admin' : 'Citizen'}
              </Badge>
            </div>
          </AdminSection>

          {/* Registered property owners */}
          <AdminSection
            title="Registered property owners"
            subtitle="Unique wallet addresses that own at least one property NFT in the registry."
          >
            {loading && properties.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Loading properties…
              </div>
            ) : properties.length === 0 ? (
              <DashboardEmptyState
                icon={Users}
                title="No registered properties"
                description="Property NFTs appear here once registration requests are approved."
              />
            ) : (
              <DashboardPanel bodyClassName="p-0">
                <ul className="divide-y divide-border">
                  {Array.from(
                    new Map(properties.map((p) => [p.owner.toLowerCase(), p])).values(),
                  ).map((p, i) => (
                    <li
                      key={p.owner}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                          {i + 1}
                        </div>
                        <span className="font-mono text-sm text-foreground break-all">
                          {p.owner}
                        </span>
                      </div>
                      <Badge variant="gold" size="sm">
                        {properties.filter(
                          (x) => x.owner.toLowerCase() === p.owner.toLowerCase(),
                        ).length}{' '}
                        NFT
                        {properties.filter(
                          (x) => x.owner.toLowerCase() === p.owner.toLowerCase(),
                        ).length !== 1
                          ? 's'
                          : ''}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </DashboardPanel>
            )}
          </AdminSection>

          {/* Registration requesters */}
          <AdminSection
            title="Registration requesters"
            subtitle="Wallets that have submitted property registration requests (any status)."
          >
            {loading && chainRequests.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Loading requests…
              </div>
            ) : chainRequests.length === 0 ? (
              <DashboardEmptyState
                icon={Users}
                title="No requests yet"
                description="Wallets that call submitRequest appear here."
              />
            ) : (
              <DashboardPanel bodyClassName="p-0">
                <ul className="divide-y divide-border">
                  {Array.from(
                    new Map(
                      chainRequests.map((r) => [r.requester.toLowerCase(), r]),
                    ).values(),
                  ).map((r) => {
                    const count = chainRequests.filter(
                      (x) => x.requester.toLowerCase() === r.requester.toLowerCase(),
                    ).length;
                    const pending = chainRequests.filter(
                      (x) =>
                        x.requester.toLowerCase() === r.requester.toLowerCase() &&
                        x.status === 0,
                    ).length;
                    return (
                      <li
                        key={r.requester}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                      >
                        <span className="font-mono text-sm text-foreground break-all">
                          {r.requester}
                        </span>
                        <div className="flex gap-2">
                          <Badge variant="gold" size="sm">
                            {count} request{count !== 1 ? 's' : ''}
                          </Badge>
                          {pending > 0 && (
                            <Badge variant="warning" size="sm">
                              {pending} pending
                            </Badge>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </DashboardPanel>
            )}
          </AdminSection>

          {/* Assign admin */}
          <AdminSection
            title="Assign admin role"
            subtitle="Grant admin/verifier role to a government officer wallet address."
          >
            <AssignAdminForm
              contract={writeContract}
              mockMode={mockMode}
              onSuccess={() => void refresh()}
            />
          </AdminSection>
        </GovOnlyGate>
      </div>
    </DashboardShell>
  );
}
