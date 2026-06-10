'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { WalletConnectControl } from '@/components/web3/WalletConnectControl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { dashboardCardClass, dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import { enableAdminPreview, disableAdminPreview } from '@/lib/admin-preview-actions';
import { selectIsAppAdmin } from '@/lib/auth-selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { profileFormSchema } from '@/lib/validation/profile-schema';
import { zodFieldErrors } from '@/lib/validation/zod-utils';
import { addToast } from '@/store/slices/uiSlice';
import { updateUser } from '@/store/slices/authSlice';
import { cn, getInitials, truncateAddress } from '@/lib/utils';

export default function DashboardProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const isAppAdmin = useAppSelector(selectIsAppAdmin);
  const { address, isConnected } = useAppSelector((s) => s.wallet);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: '',
    bio: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const result = profileFormSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      dispatch(
        addToast({
          type: 'error',
          title: 'Check your details',
          message: result.error.issues[0]?.message ?? 'Please fix the highlighted fields.',
        }),
      );
      return;
    }
    setFieldErrors({});
    dispatch(
      updateUser({
        first_name: result.data.first_name,
        last_name: result.data.last_name,
        email: result.data.email,
        phone: result.data.phone || undefined,
      }),
    );
    setIsEditing(false);
    dispatch(
      addToast({
        type: 'success',
        title: 'Profile saved',
        message: 'Your changes are stored locally until the profile API is connected.',
      }),
    );
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: '',
      bio: '',
    });
    setFieldErrors({});
    setIsEditing(false);
  };

  return (
    <DashboardShell>
      <DashboardHeader
        title="Profile"
        description="Your account details and connected wallet. Identity documents are under KYC in the sidebar."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </Link>
            <Link href="/dashboard/verification">
              <Button variant="outline" size="sm">
                KYC
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={cn(dashboardCardClass, 'p-6 lg:col-span-1')}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-2xl gradient-gold text-2xl font-bold text-white">
              {getInitials(formData.first_name || 'U', formData.last_name || 'S')}
            </div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {formData.first_name || 'User'} {formData.last_name}
            </h2>
            <Badge variant="gold" className="mt-2">
              {(user?.role || 'USER').toUpperCase()}
            </Badge>

            {user?.isVerified ? (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-success">
                <CheckCircle className="size-4" aria-hidden />
                Verified account
              </p>
            ) : (
              <Link
                href="/dashboard/verification"
                className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
              >
                Complete KYC →
              </Link>
            )}

            <div className="mt-6 space-y-2">
              {!isAppAdmin ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    enableAdminPreview(dispatch);
                    router.push('/dashboard/property-approvals');
                  }}
                >
                  Open admin preview
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    disableAdminPreview(dispatch);
                    router.push('/dashboard');
                  }}
                >
                  Exit admin preview
                </Button>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-left">
              <p className="text-xs font-medium text-muted">Connected wallet</p>
              {isConnected && address ? (
                <p className="mt-1 font-mono text-sm text-foreground">
                  {truncateAddress(address)}
                </p>
              ) : (
                <div className="mt-3">
                  <WalletConnectControl fullWidth />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cn(dashboardPanelClass, 'lg:col-span-2')}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-heading text-base font-semibold text-foreground">
              Personal information
            </h3>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              disabled={!isEditing}
              leftIcon={<User className="size-4" />}
              error={fieldErrors.first_name}
            />
            <Input
              label="Last name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              disabled={!isEditing}
              error={fieldErrors.last_name}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              leftIcon={<Mail className="size-4" />}
              error={fieldErrors.email}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              leftIcon={<Phone className="size-4" />}
              error={fieldErrors.phone}
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={!isEditing}
              leftIcon={<MapPin className="size-4" />}
              containerClassName="sm:col-span-2"
              error={fieldErrors.location}
            />
          </div>

          <div className="mt-6 space-y-4 border-t border-border pt-6">
            <div className="flex items-start gap-3 rounded-xl bg-surface p-4">
              <Calendar className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
              <div>
                <p className="text-sm font-medium text-foreground">Member since</p>
                <p className="text-sm text-muted">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-surface p-4">
              <Shield className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Identity (KYC)</p>
                <p className="text-sm text-muted">
                  Upload ID and a selfie with your ID. An admin approves or declines — not automatic.
                </p>
              </div>
              <Link href="/dashboard/verification">
                <Button variant="outline" size="sm" rightIcon={<ExternalLink className="size-3.5" />}>
                  Open KYC
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
