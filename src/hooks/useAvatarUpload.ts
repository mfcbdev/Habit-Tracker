import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const AVATAR_SIZE = 512; // px, square — server-stored resolution

/** Downscales, center-crops, and re-encodes an image to a 512×512 JPEG blob
 *  so uploads stay under a few hundred KB regardless of source resolution. */
async function normalizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - size) / 2;
  const sy = (bitmap.height - size) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))), 'image/jpeg', 0.88);
  });
}

export function useAvatarUpload() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      if (!session) return null;
      setIsUploading(true);
      setError(null);
      try {
        const blob = await normalizeImage(file);
        const path = `${session.user.id}/avatar-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, blob, { contentType: 'image/jpeg', upsert: true, cacheControl: '3600' });
        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(path);
        const avatarUrl = publicUrl.publicUrl;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', session.user.id);
        if (updateError) throw updateError;

        queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] });
        return avatarUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'upload failed');
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [session, queryClient],
  );

  return { upload, isUploading, error };
}
