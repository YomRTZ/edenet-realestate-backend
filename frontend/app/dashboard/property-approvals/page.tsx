'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Building2,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Shield,
  XCircle,
} from 'lucide-react';

import { AdminSection } from '@/components/admin/AdminSection';
import { AssignAdminForm } from '@/components/admin/AssignAdminForm';
import { PendingMintRequestCard } from '@/components/admin/PendingMintRequestCard';
import { PendingUpdateRequestCard } from '@/components/admin/PendingUpdateRequestCard';
import { PropertyDocumentsModal } from '@/components/admin/PropertyDocumentsModal';
import {
  DashboardOverviewStats,
} from '@/components/dashboard/DashboardOverviewStats';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { GovOnlyGate } from '@/components/web3/GovOnlyGate';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, FormDialog } from '@/components/ui/Dialog';
import {
  approveAdminRequest,
  declineAdminRequest,
  approveUpdateAdminRequest,
  declineUpdateAdminRequest,
} from '@/lib/api/admin';
import {
  resolveAdminRequestDbId,
} from '@/lib/admin-request-matching';
import { dashboardSectionStackClass } from '@/lib/constants/dashboard-layout';
import { useAdminPanel, type MintRequestReviewItem } from '@/hooks/useAdminPanel';
import type { RegistryUpdateRequest } from '@/types/registry-update-request';

export default function PropertyApprovalsPage() {
  const panel = useAdminPanel();
  const {
    address,
    writeContract,
    mockMode,
    properties,
    propertyDbMap,
    pendingMint,
    pendingUpdates,
    stats,
    loading,
    chainError,
    apiWarning,
    apiError,
    registryError,
    refresh,
  } = panel;

  const [actionKey, setActionKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [approveMint, setApproveMint] = useState<MintRequestReviewItem | null>(null);
  const [declineMint, setDeclineMint] = useState<MintRequestReviewItem | null>(null);
  const [declineMintReason, setDeclineMintReason] = useState('');

  const [declineUpdate, setDeclineUpdate] = useState<RegistryUpdateRequest | null>(null);
  const [declineUpdateReason, setDeclineUpdateReason] = useState('');

  const [preview, setPreview] = useState<{ 
    dbId: string; 
    title: string;
    isRequest: boolean;
  } | null>(null);

  const propertyById = useMemo(() => {
    const map = new Map(properties.map((p) => [p.id, p]));
    return map;
  }, [properties]);

  const openMintPreview = useCallback(
      (item: MintRequestReviewItem) => {
        if (!item.apiMatch) {
          setActionError('No API request matched. Refresh after the citizen submits via the registry API.');
          return;
        }
        // Files are stored against the property record, not the request record
        const propertyId = item.apiMatch.propertyId;
        if (!propertyId) {
          setActionError('API record has no propertyId — cannot load files.');
          return;
        }
        setPreview({
          dbId: String(propertyId),
          title: item.chain.name,
          isRequest: true,
        });
      },
      [],
    );

  const openUpdatePreview = useCallback(
    (update: RegistryUpdateRequest) => {
      const dbId = propertyDbMap[update.propertyId];
      if (!dbId) {
        setActionError('Property is not linked in the registry database yet.');
        return;
      }
      const property = propertyById.get(update.propertyId);
      setPreview({
        dbId,
        title: property?.name ?? `NFT #${update.propertyId} update`,
        isRequest: false, // This is an approved property, not a pending request
      });
    },
    [propertyDbMap, propertyById],
  );

  const handleConfirmMintApprove = async () => {
    if (!address || !approveMint?.apiMatch) return;
    const dbId = resolveAdminRequestDbId(approveMint.apiMatch);
    const chainIndex = approveMint.chain.id;

    setActionKey(approveMint.chain.id);
    setActionError(null);
    try {
      if (!mockMode) {
        await approveAdminRequest(address, dbId, Number(chainIndex));
      }
      setApproveMint(null);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setActionKey(null);
    }
  };

  const handleMintDecline = async () => {
    if (!address || !declineMint?.apiMatch || !declineMintReason.trim()) return;
    const dbId = resolveAdminRequestDbId(declineMint.apiMatch);

    setActionKey(declineMint.chain.id);
    setActionError(null);
    try {
      if (!mockMode) {
        await declineAdminRequest(address, dbId, declineMintReason.trim());
      }
      setDeclineMint(null);
      setDeclineMintReason('');
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Decline failed');
    } finally {
      setActionKey(null);
    }
  };

  const handleUpdateApprove = async (update: RegistryUpdateRequest) => {
    const key = `${update.propertyId}-${update.updateIndex}`;
    setActionKey(key);
    setActionError(null);
    try {
      if (mockMode) {
        await refresh();
        return;
      }
      if (!address) {
        throw new Error('Connect the government wallet.');
      }

      // Find the DB request matching this update by requester wallet
      const pendingUpdates = await import('@/lib/api/admin').then(m =>
        m.fetchAdminRequests(address, 'PENDING')
      );
      const dbRequest = pendingUpdates.find(
        r => r.type === 'UPDATE' &&
             r.submittedBy?.toLowerCase() === update.requester?.toLowerCase()
      );
      if (!dbRequest) {
        throw new Error('Could not find this update request in the database.');
      }

      // Backend signs with GOV_PRIVATE_KEY — no MetaMask popup
      await approveUpdateAdminRequest(address, dbRequest.id, update.updateIndex);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Update approval failed');
    } finally {
      setActionKey(null);
    }
  };

  const handleUpdateDecline = async () => {
    if (!declineUpdate || !declineUpdateReason.trim()) return;
    const key = `${declineUpdate.propertyId}-${declineUpdate.updateIndex}`;
    setActionKey(key);
    setActionError(null);
    try {
      if (mockMode) {
        setDeclineUpdate(null);
        setDeclineUpdateReason('');
        await refresh();
        return;
      }
      if (!address) {
        throw new Error('Connect the government wallet.');
      }

      // Find DB request matching this update
      const pendingUpdates = await import('@/lib/api/admin').then(m =>
        m.fetchAdminRequests(address, 'PENDING')
      );
      const dbRequest = pendingUpdates.find(
        r => r.type === 'UPDATE' &&
             r.submittedBy?.toLowerCase() === declineUpdate.requester?.toLowerCase()
      );
      if (!dbRequest) {
        throw new Error('Could not find this update request in the database.');
      }

      await declineUpdateAdminRequest(address, dbRequest.id, declineUpdateReason.trim());
      setDeclineUpdate(null);
      setDeclineUpdateReason('');
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'On-chain decline failed');
    } finally {
      setActionKey(null);
    }
  };

  const alerts = [chainError, apiWarning, apiError, registryError, actionError].filter(
    Boolean,
  ) as string[];

  return (
    <DashboardShell>
      <div className={dashboardSectionStackClass}>
        <DashboardHeader
          title="Admin dashboard"
          description="Review citizen registration and metadata updates. Mint approval uses the registry API; update approval is signed on-chain by the government wallet."
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
              Refresh all
            </Button>
          }
        />

        {mockMode ? (
          <p className="-mt-2 text-xs text-muted">
            Demo mode — chain and API actions are simulated where the live registry is not
            configured.
          </p>
        ) : null}

        <GovOnlyGate
          title="Government wallet required"
          description="Only the wallet in NEXT_PUBLIC_GOV_WALLET can access the admin dashboard."
        >
          {alerts.length > 0 ? (
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
          ) : null}

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <DashboardOverviewStats stats={stats} />
          </section>

          <AdminSection
            title="Pending registration (mint)"
            subtitle="Chain requests with status Pending. Approve via API using the chain request index as tokenId."
          >
            {loading && pendingMint.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Loading pending mint requests…
              </div>
            ) : pendingMint.length === 0 ? (
              <DashboardEmptyState
                icon={ClipboardCheck}
                title="No pending registrations"
                description="New citizen submissions appear here after submitRequest on the registry."
              />
            ) : (
              <div className="space-y-4">
                {pendingMint.map((item) => (
                  <PendingMintRequestCard
                    key={item.chain.id}
                    item={item}
                    hasApiMatch={!!item.apiMatch}
                    actionKey={actionKey}
                    onApprove={setApproveMint}
                    onDecline={setDeclineMint}
                    onPreview={openMintPreview}
                  />
                ))}
              </div>
            )}
          </AdminSection>

          <AdminSection
            title="Pending metadata updates"
            subtitle="On-chain update requests per property. Approve or decline with your connected government wallet."
          >
            {loading && pendingUpdates.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Loading update queue…
              </div>
            ) : pendingUpdates.length === 0 ? (
              <DashboardEmptyState
                icon={Building2}
                title="No pending updates"
                description="Owners submit metadata changes from Registry NFTs; they appear here for review."
              />
            ) : (
              <div className="space-y-4">
                {pendingUpdates.map((update) => (
                  <PendingUpdateRequestCard
                    key={`${update.propertyId}-${update.updateIndex}`}
                    update={update}
                    property={propertyById.get(update.propertyId)}
                    canSign={mockMode || !!writeContract}
                    actionKey={actionKey}
                    onApprove={handleUpdateApprove}
                    onDecline={setDeclineUpdate}
                    onPreview={openUpdatePreview}
                  />
                ))}
              </div>
            )}
          </AdminSection>

          <AdminSection
            title="Assign admin"
            subtitle="Optional — extend who can approve on-chain actions."
          >
            <AssignAdminForm
              contract={writeContract}
              mockMode={mockMode}
              onSuccess={() => void refresh()}
            />
          </AdminSection>
        </GovOnlyGate>

        <ConfirmDialog
          isOpen={!!approveMint}
          onClose={() => setApproveMint(null)}
          title="Approve registration & mint"
          description="The registry API will mint the NFT and link it to this submission. The chain request index is sent as tokenId."
          icon={Shield}
          tone="accent"
          summary={
            approveMint
              ? [
                  { label: 'Property', value: approveMint.chain.name, highlight: true },
                  { label: 'Chain request #', value: approveMint.chain.id },
                  {
                    label: 'Requester',
                    value: approveMint.chain.requester.slice(0, 10) + '…',
                  },
                  {
                    label: 'API record',
                    value: approveMint.apiMatch
                      ? resolveAdminRequestDbId(approveMint.apiMatch)
                      : '—',
                  },
                ]
              : undefined
          }
          confirmLabel="Approve & mint"
          onConfirm={() => void handleConfirmMintApprove()}
          isLoading={actionKey === approveMint?.chain.id}
          confirmDisabled={!approveMint?.apiMatch}
        />

        <FormDialog
          isOpen={!!declineMint}
          onClose={() => {
            setDeclineMint(null);
            setDeclineMintReason('');
          }}
          title="Decline registration"
          description="Stored via the registry API. The citizen will see this reason on My property requests."
          icon={XCircle}
          submitLabel="Confirm decline"
          submitVariant="danger"
          onSubmit={() => void handleMintDecline()}
          isLoading={actionKey === declineMint?.chain.id}
          submitDisabled={!declineMintReason.trim()}
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Reason
            <textarea
              className="min-h-[8rem] w-full resize-y rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
              rows={5}
              placeholder="Explain what is missing or incorrect…"
              value={declineMintReason}
              onChange={(e) => setDeclineMintReason(e.target.value)}
            />
          </label>
        </FormDialog>

        <FormDialog
          isOpen={!!declineUpdate}
          onClose={() => {
            setDeclineUpdate(null);
            setDeclineUpdateReason('');
          }}
          title="Decline metadata update"
          description="Your wallet will sign declineUpdateRequest with the reason below."
          icon={XCircle}
          submitLabel="Sign decline"
          submitVariant="danger"
          onSubmit={() => void handleUpdateDecline()}
          isLoading={
            !!declineUpdate &&
            actionKey === `${declineUpdate.propertyId}-${declineUpdate.updateIndex}`
          }
          submitDisabled={!declineUpdateReason.trim()}
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Reason
            <textarea
              className="min-h-[8rem] w-full resize-y rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
              rows={5}
              placeholder="e.g. Documents do not match the listed address…"
              value={declineUpdateReason}
              onChange={(e) => setDeclineUpdateReason(e.target.value)}
            />
          </label>
        </FormDialog>

        <PropertyDocumentsModal
          isOpen={!!preview}
          dbId={preview?.dbId ?? null}
          title={preview?.title ?? 'Property files'}
          isRequest={preview?.isRequest ?? false}
          onClose={() => setPreview(null)}
        />
      </div>
    </DashboardShell>
  );
}
