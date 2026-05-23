'use client';

import { motion, useInView, useMotionValue, useSpring, type Variants } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200',
        className
      )}
    >
      {children}
    </span>
  );
}

export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent dark:from-violet-300 dark:via-fuchsia-300 dark:to-indigo-300',
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionWrapper({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('px-4 py-24 sm:px-6 lg:px-8', className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function GlowCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-sm backdrop-blur transition-colors duration-300 hover:border-violet-400/70 dark:border-gray-800 dark:bg-gray-950/70 dark:hover:border-violet-400/70',
        'before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-violet-500/0 before:via-fuchsia-500/0 before:to-indigo-500/0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-10',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({
  value,
  suffix = '',
  duration = 1.4,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(latest).toLocaleString()}${suffix}`;
      }
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

