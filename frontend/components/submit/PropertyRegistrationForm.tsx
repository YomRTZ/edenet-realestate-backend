'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { FileText, ImageIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PROPERTY_REGISTRATION_TYPES } from '@/lib/submit-property';
import { useSubmitProperty } from '@/hooks/useSubmitProperty';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAppSelector } from '@/store/hooks';

const ACCEPT_IMAGES = 'image/*';
const ACCEPT_DOCUMENTS = '.pdf,.doc,.docx';

export function PropertyRegistrationForm() {
  const { contract } = useWeb3();
  const {
    form,
    updateForm,
    images,
    documents,
    setImageFiles,
    setDocumentFiles,
    loading,
    fieldError,
    imageError,
    submit,
  } = useSubmitProperty(contract);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles(files);
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setDocumentFiles(files);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Property name"
              required
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder="e.g. Sunset Villa"
              disabled={loading}
            />
            <Select
              label="Property type"
              required
              value={form.propertyType}
              onChange={(e) =>
                updateForm({
                  propertyType: e.target.value as (typeof PROPERTY_REGISTRATION_TYPES)[number],
                })
              }
              disabled={loading}
              options={PROPERTY_REGISTRATION_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <Input
            label="Location"
            required
            value={form.location}
            onChange={(e) => updateForm({ location: e.target.value })}
            placeholder="Full address or area"
            disabled={loading}
            containerClassName="md:col-span-2"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Price (ETH)"
              required
              type="number"
              min={0}
              step="any"
              value={form.price}
              onChange={(e) => updateForm({ price: e.target.value })}
              placeholder="0.5"
              disabled={loading}
            />
            <Select
              label="List for sale?"
              required
              value={form.isForSale ? 'true' : 'false'}
              onChange={(e) => updateForm({ isForSale: e.target.value === 'true' })}
              disabled={loading}
              options={[
                { value: 'false', label: 'No' },
                { value: 'true', label: 'Yes' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Bedrooms"
              required
              type="number"
              min={0}
              step={1}
              value={form.bedrooms}
              onChange={(e) => updateForm({ bedrooms: e.target.value })}
              disabled={loading}
            />
            <Input
              label="Bathrooms"
              required
              type="number"
              min={0}
              step={1}
              value={form.bathrooms}
              onChange={(e) => updateForm({ bathrooms: e.target.value })}
              disabled={loading}
            />
            <Input
              label="Sqft"
              required
              type="number"
              min={0}
              step={1}
              value={form.sqft}
              onChange={(e) => updateForm({ sqft: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Parking"
              required
              type="number"
              min={0}
              step={1}
              value={form.parking}
              onChange={(e) => updateForm({ parking: e.target.value })}
              disabled={loading}
            />
            <Input
              label="Floors"
              required
              type="number"
              min={0}
              step={1}
              value={form.floors}
              onChange={(e) => updateForm({ floors: e.target.value })}
              disabled={loading}
            />
            <Input
              label="Year built"
              required
              type="number"
              min={1800}
              max={2100}
              step={1}
              value={form.yearBuilt}
              onChange={(e) => updateForm({ yearBuilt: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Property images <span className="text-red-500">*</span>
              <span className="ml-1 font-normal text-muted">(minimum 3)</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={imageInputRef}
                type="file"
                accept={ACCEPT_IMAGES}
                multiple
                className="hidden"
                onChange={handleImagesChange}
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<ImageIcon className="size-4" />}
                onClick={() => imageInputRef.current?.click()}
                disabled={loading}
              >
                Choose files
              </Button>
              {images.length > 0 ? (
                <span className="text-sm text-success">{images.length} image(s) selected</span>
              ) : null}
            </div>
            {imageError ? (
              <p className="text-xs text-red-500">{imageError}</p>
            ) : images.length > 0 && images.length < 3 ? (
              <p className="text-xs text-red-500">Please select at least 3 images</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Property documents
              <span className="ml-1 font-normal text-muted">(title deed, etc.)</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={documentInputRef}
                type="file"
                accept={ACCEPT_DOCUMENTS}
                multiple
                className="hidden"
                onChange={handleDocumentsChange}
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<FileText className="size-4" />}
                onClick={() => documentInputRef.current?.click()}
                disabled={loading}
              >
                Choose files
              </Button>
              {documents.length > 0 ? (
                <span className="text-sm text-success">{documents.length} document(s) selected</span>
              ) : null}
            </div>
          </div>

          {fieldError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
              {fieldError}
            </p>
          ) : null}

          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
              leftIcon={loading ? <Loader2 className="size-5 animate-spin" /> : undefined}
            >
              {loading ? 'Processing…' : 'Submit registration request'}
            </Button>
            <p className="text-center text-xs text-muted">
              Your request will be reviewed by the registry. You&apos;ll be notified when it&apos;s
              approved or declined. The property is not listed publicly until approval.{' '}
              <Link href="/dashboard/my-requests" className="font-medium text-accent hover:underline">
                View my requests
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function SubmitRegistrationConnectGate() {
  const { connect } = useWeb3();
  const isConnecting = useAppSelector((s) => s.wallet.isConnecting);

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <p className="text-lg font-semibold text-foreground">
          Connect wallet to submit a registration request
        </p>
        <p className="max-w-md text-sm text-muted">
          You need MetaMask on Hardhat Local (chain 31337) to upload files and sign your on-chain
          request.
        </p>
        <Button variant="primary" onClick={() => void connect()} disabled={isConnecting}>
          {isConnecting ? 'Connecting…' : 'Connect wallet'}
        </Button>
      </CardContent>
    </Card>
  );
}
