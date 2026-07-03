import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface AvatarUploaderProps {
  avatarUrl: string | null;
  displayName: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function AvatarUploader({ avatarUrl, displayName, size = 96, className }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error } = useAvatarUpload();
  const { showToast } = useToast();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Choose an image file.', 'error');
      return;
    }
    const url = await upload(file);
    if (url) showToast('Avatar updated.', 'success');
    else showToast(`Upload failed${error ? `: ${error}` : ''}.`, 'error');
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label="Change profile picture"
        className={cn(
          'group relative overflow-hidden rounded-full border-2 border-DEFAULT bg-surface-raised text-primary transition disabled:opacity-50',
        )}
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-serif-display text-3xl text-secondary">
            {initials(displayName) || '·'}
          </span>
        )}
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100',
            isUploading && 'opacity-100',
          )}
        >
          <Camera className="h-5 w-5 text-white" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
