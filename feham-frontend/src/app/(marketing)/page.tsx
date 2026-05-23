'use client';

import { motion } from 'framer-motion';
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AnimatedCounter,
  Badge,
  GradientText,
  GlowCard,
  SectionWrapper,
  fadeUp,
  stagger,
} from '@/components/marketing/MarketingPrimitives';

const words = ['Build faster.', 'Ship smarter.','Succeed faster.'];

const features = [
  {
    icon: Banknote,
    title: 'Fee Automation',
    description: 'Generate monthly challans, track paid status, and export polished slips in seconds.',
  },
  {
    icon: CalendarDays,
    title: 'Visual Timetables',
    description: 'Plan weekly schedules by section, period, subject, and teacher without spreadsheets.',
  },
  {
    icon: Users,
    title: 'Teacher Workflows',
    description: 'Give teachers a clean portal for schedules, homework, remarks, and parent updates.',
  },
  {
    icon: GraduationCap,
    title: 'Student Records',
    description: 'Keep roll numbers, guardians, sections, and parent portal access in one profile.',
  },
  {
    icon: MessageSquareText,
    title: 'Parent Communication',
    description: 'Keep families informed with homework, remarks, challans, and real-time updates.',
  },
  {
    icon: ShieldCheck,
    title: 'School Isolation',
    description: 'Every school gets its own secure workspace with roles, branding, and clean data boundaries.',
  },
];

const testimonials = [
  {
    initials: 'AR',
    name: 'Ayesha R.',
    role: 'Principal',
    company: 'Beacon Light Academy',
    quote: 'Feham turned our daily admin work into a simple morning routine. Fees, sections, and schedules finally feel connected.',
  },
  {
    initials: 'HK',
    name: 'Hamza K.',
    role: 'Administrator',
    company: 'North Star School',
    quote: 'The team stopped juggling Excel sheets. We can see students, teachers, and timetable data in one place.',
  },
  {
    initials: 'SM',
    name: 'Sana M.',
    role: 'Director',
    company: 'City Grammar',
    quote: 'It feels modern without being complicated. Our staff understood the flow in the first week.',
  },
];

export default function HomePage() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % words.length);
    }, 2500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="orb absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl dark:bg-violet-500/20" />
        <div className="orb orb-delay absolute bottom-10 right-[-8%] h-96 w-96 rounded-full bg-fuchsia-400/25 blur-3xl dark:bg-fuchsia-500/15" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(124,58,237,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}>
              <Badge>Modern school management for Pakistan</Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-6 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Manage every school workflow.
              <motion.span
                key={words[wordIndex]}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mt-3 block pb-2"
              >
                <GradientText>{words[wordIndex]}</GradientText>
              </motion.span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300"
            >
              Feham brings fees, classes, timetables, teachers, students, and parent communication into one polished SaaS platform.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/get-started"
                className="rounded-lg bg-violet-600 px-6 py-3 font-medium text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:bg-violet-700"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                See Features
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 blur-3xl" />
            <div className="relative rounded-3xl border border-white/20 bg-white/90 p-4 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/90 dark:shadow-black/40">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                  Live dashboard
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
                <div className="rounded-2xl bg-gray-950 p-4 text-white">
                  <p className="text-xs text-gray-400">Today</p>
                  <p className="mt-2 text-3xl font-bold">PKR 248K</p>
                  <p className="mt-1 text-sm text-emerald-300">+18% collections</p>
                  <div className="mt-8 space-y-3">
                    {['Students', 'Teachers', 'Classes'].map((item, i) => (
                      <div key={item} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{item}</span>
                        <span className="font-semibold">{[842, 48, 22][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/60">
                  <div className="grid grid-cols-3 gap-3">
                    {[72, 44, 88].map((height, i) => (
                      <div key={i} className="rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900">
                        <div className="h-2 w-10 rounded bg-violet-200 dark:bg-violet-500/30" />
                        <div className="mt-6 rounded bg-gradient-to-t from-violet-600 to-fuchsia-400" style={{ height }} />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">Class 5-A timetable</span>
                      <CalendarDays className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      {['Math', 'Science', 'English', 'Urdu', 'Lab', 'Sports'].map((subject) => (
                        <span key={subject} className="rounded-lg bg-violet-50 px-2 py-2 text-center text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50 py-8 dark:border-gray-800 dark:bg-gray-900/40">
        <p className="text-center text-sm font-medium uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
          Trusted by teams at
        </p>
        <div className="mt-6 overflow-hidden">
          <div className="marquee flex min-w-max gap-12 text-2xl font-extrabold text-gray-400 dark:text-gray-600">
            {[...['Beacon Light', 'City Grammar', 'North Star', 'Future Roots', 'Lahore Prep', 'Bright School'], ...['Beacon Light', 'City Grammar', 'North Star', 'Future Roots', 'Lahore Prep', 'Bright School']].map((logo, index) => (
              <span key={`${logo}-${index}`}>{logo}</span>
            ))}
          </div>
        </div>
      </section>

      <SectionWrapper id="features" className="bg-white dark:bg-gray-950">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge>Feature overview</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Everything your school needs, beautifully connected.
          </motion.h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <GlowCard key={feature.title}>
              <feature.icon className="h-8 w-8 text-violet-600 dark:text-violet-300" />
              <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">{feature.description}</p>
            </GlowCard>
          ))}
        </motion.div>
      </SectionWrapper>

      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/40">
        <div className="text-center">
          <Badge>How it works</Badge>
          <h2 className="mt-4 text-4xl font-extrabold">From signup to smooth operations.</h2>
        </div>
        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-9 hidden h-px bg-gradient-to-r from-violet-200 via-violet-500 to-violet-200 dark:from-violet-900 dark:via-violet-400 dark:to-violet-900 md:block" />
          {['Launch your school workspace', 'Configure people and classes', 'Run daily workflows'].map((step, index) => (
            <motion.div
              key={step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: index * 0.12 }}
              className="relative text-center"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-8 border-gray-50 bg-violet-600 text-2xl font-extrabold text-white shadow-xl shadow-violet-500/20 dark:border-gray-900">
                {index + 1}
              </span>
              <h3 className="mt-6 text-xl font-bold">{step}</h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                {[
                  'Create your branded workspace and invite administrators.',
                  'Add classes, sections, students, teachers, and fee structures.',
                  'Generate challans, assign timetables, and keep parents updated.',
                ][index]}
              </p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper className="dot-grid bg-white dark:bg-gray-950">
        <div className="text-center">
          <Badge>Testimonials</Badge>
          <h2 className="mt-4 text-4xl font-extrabold">School teams love the clarity.</h2>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <GlowCard key={item.name} className="bg-white/90 dark:bg-gray-950/90">
              <p className="text-lg leading-8 text-gray-700 dark:text-gray-300">“{item.quote}”</p>
              <div className="mt-8 flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 font-bold text-white">
                  {item.initials}
                </span>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.role}, {item.company}
                  </p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-gray-950 text-white">
        <div className="grid gap-8 md:grid-cols-4">
          {[
            ['50', 'K+ Users'],
            ['99', '.9% Uptime'],
            ['150', '+ Schools'],
            ['49', '/50 Rating'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-5xl font-extrabold text-violet-300">
                <AnimatedCounter value={Number(value)} />
              </p>
              <p className="mt-2 text-gray-300">{label}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper className="relative overflow-hidden bg-violet-700 text-white">
        <div className="orb absolute left-0 top-0 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="orb orb-delay absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-violet-100" />
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Ready to modernise your school?
          </h2>
          <p className="mt-5 text-lg text-violet-100">
            Start with a polished workspace today and bring your staff, students, and parents into one flow.
          </p>
          <Link
            href="/get-started"
            className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-violet-700 shadow-xl shadow-black/10 transition hover:bg-violet-50"
          >
            Get Started Free
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
