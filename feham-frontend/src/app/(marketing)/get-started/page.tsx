'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { GradientText } from '@/components/marketing/MarketingPrimitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const benefits = [
  'Launch your branded school workspace',
  'Configure classes, students, teachers, and fees',
  'Invite your staff and parents when ready',
];

function strengthScore(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function GetStartedPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = useMemo(() => strengthScore(form.password), [form.password]);
  const strengthLabel = ['Weak', 'Weak', 'Good', 'Strong', 'Excellent'][strength];
  const strengthColor = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500'][strength];

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match.';
    if (!form.terms) next.terms = 'Please agree before continuing.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    toast.success('Great. Continue with school setup.');
    router.push('/register');
  };

  return (
    <main className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden bg-gray-950 px-6 py-16 text-white sm:px-10 lg:px-16">
          <div className="orb absolute left-[-20%] top-10 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="orb orb-delay absolute bottom-0 right-[-20%] h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-center">
            <Link href="/" className="mb-16 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 font-extrabold">
                F
              </span>
              <span className="text-xl font-extrabold">Feham</span>
            </Link>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <p className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-violet-100">
                Start free
              </p>
              <h1 className="mt-6 max-w-xl text-5xl font-extrabold tracking-tight sm:text-6xl">
                Build a calmer school operation with <GradientText>Feham</GradientText>.
              </h1>
              <div className="mt-8 grid gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 text-violet-50">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    {benefit}
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="mt-14 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-lg leading-8 text-violet-50">
                “Feham gave us one clean place for fee work, classes, and parent communication. It feels built for schools like ours.”
              </p>
              <p className="mt-4 font-semibold">Ayesha R., Principal</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl shadow-violet-950/10 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold">Create your account</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">We&apos;ll guide you through school setup next.</p>
              </div>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" className="mt-2 h-12 rounded-xl bg-gray-50 dark:bg-gray-900" value={form.name} onChange={(e) => update('name', e.target.value)} />
                {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="mt-2 h-12 rounded-xl bg-gray-50 dark:bg-gray-900" value={form.email} onChange={(e) => update('email', e.target.value)} />
                {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="mt-2 h-12 rounded-xl bg-gray-50 dark:bg-gray-900" value={form.password} onChange={(e) => update('password', e.target.value)} />
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4].map((level) => (
                    <span key={level} className={cn('h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-800', strength >= level && strengthColor)} />
                  ))}
                  <span className="w-16 text-right text-xs text-gray-500">{strengthLabel}</span>
                </div>
                {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
              </div>
              <div>
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" className="mt-2 h-12 rounded-xl bg-gray-50 dark:bg-gray-900" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} />
                {errors.confirm ? <p className="mt-1 text-xs text-red-600">{errors.confirm}</p> : null}
              </div>

              <label className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => update('terms', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-violet-600"
                />
                <span>
                  I agree to the Terms of Service and Privacy Policy.
                  {errors.terms ? <span className="mt-1 block text-xs text-red-600">{errors.terms}</span> : null}
                </span>
              </label>

              <Button type="submit" className="h-12 w-full rounded-xl bg-violet-600 font-semibold hover:bg-violet-700">
                <Zap className="mr-2 h-4 w-4" />
                Create my account
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
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-violet-600 hover:underline dark:text-violet-300">
                Sign in
              </Link>
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4" />
              Your setup continues on the school registration flow.
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

