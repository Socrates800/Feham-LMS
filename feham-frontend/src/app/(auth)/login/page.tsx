'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

const roleRoutes: Record<UserRole, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('admin@beacon.test');
  const [password, setPassword] = useState('password');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'Password looks too short.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.token, data.school);
      toast.success('Welcome back!');
      router.push(roleRoutes[data.user.role as UserRole] || '/admin');
    } catch {
      setErrors({ form: 'Invalid email or password.' });
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="orb absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="orb orb-delay absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-[420px] rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90"
      >
        <Link href="/" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-extrabold text-white shadow-lg shadow-violet-500/25">
          F
        </Link>
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your Feham workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {errors.form ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {errors.form}
            </p>
          ) : null}
          <div>
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu.pk"
              className="mt-2 h-12 rounded-xl border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600 dark:text-red-300">{errors.email}</p> : null}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Password
              </Label>
              <Link href="mailto:support@feham.app" className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-300">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 h-12 rounded-xl border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
            />
            {errors.password ? <p className="mt-1 text-xs text-red-600 dark:text-red-300">{errors.password}</p> : null}
          </div>
          <Button type="submit" className="h-12 w-full rounded-xl bg-violet-600 font-semibold hover:bg-violet-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          or continue with
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
            <span className="text-sm font-bold">G</span>
            Google
          </button>
          <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
            <span className="text-sm font-bold">GH</span>
            GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/get-started" className="font-semibold text-violet-600 hover:underline dark:text-violet-300">
            Get started
          </Link>
        </p>
      </motion.div>
    </main>
  );
}




