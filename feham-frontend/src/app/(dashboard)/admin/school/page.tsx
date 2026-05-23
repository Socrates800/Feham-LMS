'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { laravelStorageUrl } from '@/lib/laravel-url';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';
import type { School } from '@/types';

export default function SchoolSettingsPage() {
  const school = useAuthStore((s) => s.school);
  const patchSchool = useAuthStore((s) => s.patchSchool);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { data: freshSchool } = useQuery({
    queryKey: ['auth-me-school'],
    queryFn: async () => {
      const { data } = await api.get<{ school: School }>('/auth/me');
      return data.school;
    },
    enabled: !!token,
    staleTime: 60_000,
  });

  const displaySchool = freshSchool ?? school ?? null;
  const logoSrc = preview ?? laravelStorageUrl(displaySchool?.logo_path);

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      const { data } = await api.post<{ logo_url: string; school: School }>(
        '/admin/school/logo',
        formData
      );
      return data;
    },
    onSuccess: async (data) => {
      patchSchool(data.school);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      try {
        const me = await api.get('/auth/me');
        setAuth(me.data.user, token!, me.data.school);
      } catch {
        /* store already patched */
      }
      await queryClient.invalidateQueries({ queryKey: ['auth-me-school'] });
      toast.success('School logo updated');
    },
    onError: () => {
      toast.error('Upload failed. Use an image under 2MB.');
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setPreview(URL.createObjectURL(file));
    uploadLogo.mutate(file);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">School Settings</h1>
        <p className="text-sm text-neutral-600 sm:text-base">Branding and contact details</p>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              School logo
            </CardTitle>
            <CardDescription>
              Shown in the sidebar and on PDFs. PNG or JPG, max 2MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={displaySchool?.name ? `${displaySchool.name} logo` : 'School logo'}
                    width={112}
                    height={112}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs text-neutral-400">No logo</span>
                )}
              </div>
              <div className="flex w-full flex-1 flex-col gap-2 sm:w-auto">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={onFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={uploadLogo.isPending}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploadLogo.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload picture
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <Label className="text-neutral-500">Name</Label>
              <p className="font-medium">{displaySchool?.name}</p>
            </div>
            <div>
              <Label className="text-neutral-500">Email</Label>
              <p className="font-medium">{displaySchool?.email ?? '—'}</p>
            </div>
            <div>
              <Label className="text-neutral-500">Phone</Label>
              <p className="font-medium">{displaySchool?.phone ?? '—'}</p>
            </div>
            <div>
              <Label className="text-neutral-500">Address</Label>
              <p className="font-medium">{displaySchool?.address ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
