'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Clock,
  CreditCard,
  Shield,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSectionLabel } from '@/components/dashboard/DashboardSectionLabel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import {
  KYC_DOC_DESCRIPTIONS,
  KYC_DOC_LABELS,
  KYC_REQUIRED_KINDS,
  type KycDocKind,
} from '@/lib/kyc/types';
import { revokeKycDocPreview, setKycDocPreview } from '@/lib/kyc/preview-cache';
import { mockUser } from '@/lib/mockData';
import { cn, formatDate } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { selectKycSubmissionByUserId } from '@/lib/kyc/selectors';
import {
  removeDraftDocument,
  resetKycAfterReject,
  submitKycForReview,
  upsertDraftDocument,
} from '@/store/slices/kycSlice';
import { validateKycReadyForSubmit, validateKycUploadFile } from '@/lib/validation/kyc-schema';
import { addToast } from '@/store/slices/uiSlice';

const DOC_ICONS: Record<KycDocKind, typeof CreditCard> = {
  ID_FRONT: CreditCard,
  ID_BACK: CreditCard,
  SELFIE: Camera,
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VerificationPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const userId = user?.id ?? mockUser.id;
  const submission = useAppSelector(selectKycSubmissionByUserId(userId));
  const userName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : `${mockUser.first_name} ${mockUser.last_name}`;
  const userEmail = user?.email ?? mockUser.email;

  const status = submission?.status ?? 'DRAFT';

  const [uploading, setUploading] = useState<KycDocKind | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [submitConfirm, setSubmitConfirm] = useState(false);

  const canEdit = status === 'DRAFT';
  const isPending = status === 'PENDING';
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  const uploadedKinds = useMemo(
    () => new Set(submission?.documents.map((d) => d.kind) ?? []),
    [submission?.documents],
  );

  const allRequiredUploaded = KYC_REQUIRED_KINDS.every((k) => uploadedKinds.has(k));

  useEffect(() => {
    if (isApproved) {
      dispatch(updateUser({ isVerified: true }));
    }
  }, [isApproved, dispatch]);

  const docToDelete = submission?.documents.find((d) => d.id === deleteDocId);

  const handleFileUpload = async (kind: KycDocKind, files: FileList | null) => {
    if (!files?.length || !canEdit) return;
    const file = files[0];
    const fileError = validateKycUploadFile(file);
    if (fileError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Invalid file',
          message: fileError,
        }),
      );
      return;
    }

    setUploading(kind);
    await new Promise((r) => setTimeout(r, 600));

    const docId = `${userId}-${kind}-${Date.now()}`;
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    if (previewUrl) setKycDocPreview(docId, previewUrl);

    dispatch(
      upsertDraftDocument({
        userId,
        userName,
        userEmail,
        document: {
          id: docId,
          kind,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: new Date().toISOString(),
        },
      }),
    );

    setUploading(null);
    dispatch(
      addToast({
        type: 'success',
        title: 'File saved',
        message: `${KYC_DOC_LABELS[kind]} — submit when all three are uploaded.`,
      }),
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteDocId) return;
    revokeKycDocPreview(deleteDocId);
    dispatch(removeDraftDocument({ userId, documentId: deleteDocId }));
    setDeleteDocId(null);
    dispatch(addToast({ type: 'info', title: 'File removed', message: 'You can upload again.' }));
  };

  const handleSubmitForReview = () => {
    const readyError = validateKycReadyForSubmit(uploadedKinds);
    if (readyError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Cannot submit yet',
          message: readyError,
        }),
      );
      return;
    }
    dispatch(submitKycForReview({ userId, userName, userEmail }));
    dispatch(updateUser({ isVerified: false }));
    setSubmitConfirm(false);
    dispatch(
      addToast({
        type: 'success',
        title: 'Submitted for review',
        message: 'An admin will approve or decline your identity documents.',
      }),
    );
  };

  const handleResubmit = () => {
    submission?.documents.forEach((d) => revokeKycDocPreview(d.id));
    dispatch(resetKycAfterReject({ userId }));
    dispatch(
      addToast({
        type: 'info',
        title: 'Ready to resubmit',
        message: 'Upload new ID and selfie photos, then submit again.',
      }),
    );
  };

  const statusBanner = (() => {
    if (isApproved) {
      return {
        title: 'Identity approved',
        body: 'An admin verified your documents. You have full platform access.',
        className: 'bg-success/10 border-success/20',
        icon: CheckCircle,
        iconClass: 'text-success',
      };
    }
    if (isPending) {
      return {
        title: 'Waiting for admin review',
        body: 'Your ID and selfie are with our team. You will be notified after approve or decline — this is not automatic.',
        className: 'bg-warning/10 border-warning/20',
        icon: Clock,
        iconClass: 'text-warning',
      };
    }
    if (isRejected) {
      return {
        title: 'Submission declined',
        body:
          submission?.rejectionReason ??
          'Your documents were not accepted. Upload new photos and submit again.',
        className: 'bg-destructive/10 border-destructive/20',
        icon: XCircle,
        iconClass: 'text-destructive',
      };
    }
    return {
      title: 'Submit identity documents',
      body: 'Upload government ID (front and back) and a selfie with your ID. An admin reviews every submission manually.',
      className: 'bg-primary/10 border-primary/20',
      icon: Shield,
      iconClass: 'text-primary dark:text-foreground',
    };
  })();

  const BannerIcon = statusBanner.icon;

  return (
    <DashboardShell>
      <DashboardHeader
        title="KYC"
        description="Submit ID and face photos for manual admin review — verification is not automatic."
      />

      <Card className={cn('mb-8 p-6', statusBanner.className)}>
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface">
            <BannerIcon className={cn('size-6', statusBanner.iconClass)} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-semibold text-foreground">{statusBanner.title}</h3>
            <p className="mt-1 text-sm text-muted">{statusBanner.body}</p>
            {isRejected ? (
              <Button variant="primary" size="sm" className="mt-4" onClick={handleResubmit}>
                Upload new documents
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {isRejected ? null : (
        <section className="mb-8">
          <DashboardSectionLabel className="mb-4">Required photos</DashboardSectionLabel>
          <div className="grid gap-4">
            {KYC_REQUIRED_KINDS.map((kind) => {
              const Icon = DOC_ICONS[kind];
              const uploaded = submission?.documents.find((d) => d.kind === kind);
              const isUploading = uploading === kind;

              return (
                <Card key={kind} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-6 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{KYC_DOC_LABELS[kind]}</h3>
                          <p className="mt-0.5 text-sm text-muted">{KYC_DOC_DESCRIPTIONS[kind]}</p>
                        </div>
                        {uploaded ? (
                          <Badge variant={isPending ? 'warning' : 'outline'} size="sm">
                            {isPending ? 'Submitted' : 'Ready'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm">
                            Missing
                          </Badge>
                        )}
                      </div>

                      {uploaded ? (
                        <div className="mt-4 rounded-lg bg-surface p-4">
                          <p className="font-medium text-foreground">{uploaded.fileName}</p>
                          <p className="text-xs text-muted">
                            {formatFileSize(uploaded.size)} · {formatDate(uploaded.uploadedAt)}
                          </p>
                          {canEdit ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 text-destructive"
                              leftIcon={<Trash2 className="size-4" />}
                              onClick={() => setDeleteDocId(uploaded.id)}
                            >
                              Remove
                            </Button>
                          ) : null}
                        </div>
                      ) : canEdit ? (
                        <div className="mt-4">
                          <label>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={isUploading}
                              onChange={(e) => {
                                void handleFileUpload(kind, e.target.files);
                                e.target.value = '';
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="md"
                              leftIcon={<Upload className="size-4" />}
                              disabled={isUploading}
                              onClick={(e) => {
                                const input = (e.currentTarget.parentElement as HTMLLabelElement)
                                  ?.querySelector('input');
                                input?.click();
                              }}
                            >
                              {isUploading ? 'Uploading…' : 'Upload image'}
                            </Button>
                          </label>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {canEdit ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                disabled={!allRequiredUploaded}
                onClick={() => setSubmitConfirm(true)}
              >
                Submit for admin review
              </Button>
              {!allRequiredUploaded ? (
                <p className="text-sm text-muted self-center">
                  Upload all three images before submitting.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      )}

      <Card className={cn(dashboardPanelClass, 'p-6')}>
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-muted" />
          <ul className="space-y-1 text-sm text-muted">
            <li>· JPG, PNG, or WebP only — max 10MB each</li>
            <li>· ID must be valid and fully visible</li>
            <li>· Selfie must show your face and the ID clearly</li>
            <li>· Review is manual; typical turnaround 24–48 hours</li>
          </ul>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={deleteDocId !== null}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove this image?"
        description="You can upload a replacement before submitting for review."
        confirmLabel="Remove"
        tone="danger"
        confirmVariant="danger"
        summary={
          docToDelete
            ? [{ label: 'File', value: docToDelete.fileName, highlight: true }]
            : undefined
        }
      />

      <ConfirmDialog
        isOpen={submitConfirm}
        onClose={() => setSubmitConfirm(false)}
        onConfirm={handleSubmitForReview}
        title="Submit for review?"
        description="An admin will check your ID and selfie and approve or decline. You cannot edit files while pending."
        confirmLabel="Submit"
        tone="accent"
        summary={[
          { label: 'Name', value: userName, highlight: true },
          { label: 'Email', value: userEmail },
          { label: 'Files', value: `${KYC_REQUIRED_KINDS.length} images` },
        ]}
      />
    </DashboardShell>
  );
}
