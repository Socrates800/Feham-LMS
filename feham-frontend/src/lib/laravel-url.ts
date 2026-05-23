/** Public disk URL for files stored under storage/app/public (synced to public/storage). */
export function laravelStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const api = process.env.NEXT_PUBLIC_API_URL ?? '';
  const origin = api.replace(/\/api\/?$/i, '') || 'http://127.0.0.1:8000';
  return `${origin}/storage/${String(path).replace(/^\//, '')}`;
}
