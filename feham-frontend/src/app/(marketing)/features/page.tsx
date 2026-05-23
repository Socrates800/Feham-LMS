'use client';

import { motion } from 'framer-motion';
import {
  Banknote,
  CalendarDays,
  FileText,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { Badge, GradientText, GlowCard, SectionWrapper, fadeUp, stagger } from '@/components/marketing/MarketingPrimitives';

const featureBlocks = [
  {
    icon: Banknote,
    title: 'Fee collection without spreadsheet chaos',
    description:
      'Create fee structures, generate monthly challans, track payment status, and prepare printable slips for parents and banks.',
    points: ['Monthly challan generation', 'Paid, pending, and overdue status', 'PDF-ready fee slips'],
  },
  {
    icon: CalendarDays,
    title: 'A timetable builder staff can actually use',
    description:
      'Build weekly schedules by section, day, period, subject, and teacher with clear time labels and connected records.',
    points: ['Period time setup', 'Teacher assignment', 'Section-based weekly grids'],
  },
  {
    icon: GraduationCap,
    title: 'Complete student profiles from day one',
    description:
      'Manage enrollment, roll numbers, class placement, guardian details, parent login access, and exportable student lists.',
    points: ['Class and section placement', 'Guardian contact records', 'CSV exports'],
  },
  {
    icon: Users,
    title: 'Teacher and parent portals built in',
    description:
      'Give teachers a focused workspace and parents a reliable way to view challans, homework, and remarks.',
    points: ['Teacher schedules', 'Homework and remarks', 'Parent self-service portal'],
  },
  {
    icon: ShieldCheck,
    title: 'Designed for multi-school SaaS',
    description:
      'Every school stays isolated with its own branding, roles, records, and operational dashboard.',
    points: ['Tenant-safe data', 'Role-based access', 'School branding'],
  },
];

const detailCards = [
  { icon: FileText, title: 'Clean reports', description: 'Quick exports and printable records for school administration.' },
  { icon: Wallet, title: 'Salary workflows', description: 'Prepare salary slips with allowances and deductions.' },
  { icon: MessageSquareText, title: 'Parent updates', description: 'Centralise homework, remarks, and fee communication.' },
  { icon: CalendarDays, title: 'Daily visibility', description: 'See today’s timetable and upcoming operational tasks.' },
  { icon: Users, title: 'Staff directory', description: 'Keep teacher information, subjects, and assignments updated.' },
  { icon: ShieldCheck, title: 'Secure access', description: 'Admin, teacher, and parent roles stay cleanly separated.' },
];

function MockupCard({ index }: { index: number }) {
  return (
    <div className="relative rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl shadow-violet-950/10 dark:border-gray-800 dark:bg-gray-900">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-2xl" />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
          Module {index + 1}
        </span>
      </div>
      <div className="mt-6 grid gap-3">
        <div className="h-4 w-1/2 rounded-full bg-violet-200 dark:bg-violet-500/30" />
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-800/70">
            <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500" />
            <span className="h-3 flex-1 rounded-full bg-gray-200 dark:bg-gray-700" />
            <span className="h-3 w-16 rounded-full bg-violet-200 dark:bg-violet-500/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <SectionWrapper className="pb-12 pt-24 text-center">
        <Badge>Platform features</Badge>
        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl">
          Built to connect every part of <GradientText>school operations</GradientText>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
          Feham gives administrators, teachers, students, and parents one reliable system for daily school management.
        </p>
      </SectionWrapper>

      <div className="space-y-12 pb-16">
        {featureBlocks.map((feature, index) => (
          <SectionWrapper key={feature.title} className="py-12">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -48 : 48 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={index % 2 === 1 ? 'lg:order-2' : ''}
              >
                <feature.icon className="h-10 w-10 text-violet-600 dark:text-violet-300" />
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{feature.title}</h2>
                <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">{feature.description}</p>
                <div className="mt-8 grid gap-3">
                  {feature.points.map((point) => (
                    <div key={point} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <span className="h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-300" />
                      {point}
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 48 : -48 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={index % 2 === 1 ? 'lg:order-1' : ''}
              >
                <MockupCard index={index} />
              </motion.div>
            </div>
          </SectionWrapper>
        ))}
      </div>

      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/40">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center">
            <Badge>More capability</Badge>
            <h2 className="mt-4 text-4xl font-extrabold">Details that make daily work smoother.</h2>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {detailCards.map((card) => (
              <GlowCard key={card.title}>
                <card.icon className="h-8 w-8 text-violet-600 dark:text-violet-300" />
                <h3 className="mt-5 text-xl font-bold">{card.title}</h3>
                <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">{card.description}</p>
              </GlowCard>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>
    </div>
  );
}

