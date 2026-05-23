'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import api from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const { token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const { data } = await api.get('/auth/me', { timeout: 8000 });
        setAuth(data.user, token, data.school);
      } catch {
        clearAuth();
      } finally {
        setReady(true);
      }
    };
    const fallback = window.setTimeout(() => setReady(true), 10000);
    verify().finally(() => window.clearTimeout(fallback));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}



