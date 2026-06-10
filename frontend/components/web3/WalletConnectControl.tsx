'use client';

import { useEffect, useState } from 'react';
import { Loader2, LogOut, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { useWeb3 } from '@/contexts/Web3Context';
import { selectWalletBadges } from '@/lib/wallet-selectors';
import { useAppSelector } from '@/store/hooks';
import { cn, truncateAddress } from '@/lib/utils';

interface WalletConnectControlProps {
  className?: string;
  chipClassName?: string;
  walletVariant?: ButtonProps['variant'];
  fullWidth?: boolean;
}

export function WalletConnectControl({
  className,
  chipClassName,
  walletVariant = 'outline',
  fullWidth = false,
}: WalletConnectControlProps) {
  const { connect, disconnect } = useWeb3();
  const { address, isConnected, isConnecting } = useAppSelector((s) => s.wallet);
  const badges = useAppSelector(selectWalletBadges);

  // Render a stable placeholder until the component is mounted on the client.
  // This prevents server/client HTML mismatches caused by wallet state
  // (isConnecting, isConnected) which is always false on the server but may
  // change immediately on the client when auto-connect runs.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    // Matches exactly what the "not connected, not connecting" state renders,
    // so server HTML and first client render are identical.
    return (
      <Button
        variant={walletVariant}
        size="sm"
        className={cn(fullWidth && 'w-full', className)}
        leftIcon={<Wallet className="size-4" />}
        disabled={false}
        onClick={() => void connect()}
      >
        Wallet
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', fullWidth && 'w-full', className)}>
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs',
            chipClassName,
          )}
        >
          {truncateAddress(address)}
        </span>
        {badges.map((b) => (
          <Badge key={b.label} variant={b.variant} size="sm">
            {b.label}
          </Badge>
        ))}
        <button
          type="button"
          onClick={disconnect}
          className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-surface hover:text-foreground"
          title="Disconnect wallet"
          aria-label="Disconnect wallet"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <Button
      variant={walletVariant}
      size="sm"
      className={cn(fullWidth && 'w-full', className)}
      leftIcon={
        isConnecting
          ? <Loader2 className="size-4 animate-spin" />
          : <Wallet className="size-4" />
      }
      disabled={isConnecting}
      onClick={() => void connect()}
    >
      Wallet
    </Button>
  );
}
