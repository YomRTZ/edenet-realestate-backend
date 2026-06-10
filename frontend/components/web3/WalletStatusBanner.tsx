'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearWalletMessage } from '@/store/slices/walletSlice';
import { cn } from '@/lib/utils';

/** Above site navbar (z-50); sits under the nav bar on marketing pages. */
const WALLET_BANNER_Z = 'z-[60]';

export function WalletStatusBanner() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { error, message, isConnected } = useAppSelector((s) => s.wallet);

  const text = error || (isConnected ? message : null);
  const isError = Boolean(error);
  const hasSiteNav = pathname ? !pathname.startsWith('/dashboard') : true;

  useEffect(() => {
    const height = text ? '2.75rem' : '0px';
    document.documentElement.style.setProperty('--wallet-status-banner-height', height);
    return () => {
      document.documentElement.style.setProperty('--wallet-status-banner-height', '0px');
    };
  }, [text]);

  if (!text) return null;

  return (
    <div
      className={cn(
        'fixed inset-x-0 border-b px-4 py-2.5 text-sm shadow-sm backdrop-blur-sm',
        WALLET_BANNER_Z,
        hasSiteNav ? 'top-[var(--site-nav-header-height,5rem)]' : 'top-0',
        isError
          ? 'border-warning/30 bg-warning/10 text-warning'
          : 'border-success/30 bg-success/10 text-success',
      )}
      role="status"
    >
      <div className="mx-auto flex w-full max-w-[var(--app-content-max)] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {isError ? (
            <AlertCircle className="size-4 shrink-0" aria-hidden />
          ) : (
            <CheckCircle className="size-4 shrink-0" aria-hidden />
          )}
          <span className="truncate">{text}</span>
        </div>
        <button
          type="button"
          onClick={() => dispatch(clearWalletMessage())}
          className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
