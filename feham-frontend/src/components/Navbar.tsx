'use client';

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 90);
  });

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? -88 : 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-gray-800/60 dark:bg-gray-950/80"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-extrabold text-white shadow-lg shadow-violet-500/25">
            F
          </span>
          <span className="text-xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            Feham
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm font-medium text-gray-600 transition-colors hover:text-violet-600 dark:text-gray-300 dark:hover:text-violet-300"
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-600 opacity-0 transition-opacity dark:bg-violet-300',
                    active && 'opacity-100'
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Sign in
          </Link>
          <Link
            href="/get-started"
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:bg-violet-700 hover:shadow-violet-500/30"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-gray-950/40 backdrop-blur-sm md:hidden">
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25 }}
            className="ml-auto flex h-screen w-80 max-w-[86vw] flex-col bg-white p-6 shadow-2xl dark:bg-gray-950"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold text-gray-950 dark:text-white">Feham</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
                    pathname === link.href && 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-200 px-5 py-3 text-center font-medium dark:border-gray-800"
              >
                Sign in
              </Link>
              <Link
                href="/get-started"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-violet-600 px-5 py-3 text-center font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </motion.header>
  );
}

