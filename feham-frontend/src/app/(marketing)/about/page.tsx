'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Lock, Rocket, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge, GradientText, GlowCard, SectionWrapper, fadeUp, stagger } from '@/components/marketing/MarketingPrimitives';

const team = [
  ['MA', 'Mariam Ali', 'Founder & Product', 'Designs practical workflows for school owners and administrators.'],
  ['HK', 'Hamza Khan', 'Engineering Lead', 'Builds reliable systems for school data, roles, and automation.'],
  ['SR', 'Sana Raza', 'Customer Success', 'Helps schools onboard teams and migrate from paper records.'],
  ['AT', 'Ahmed Tariq', 'Design Lead', 'Shapes the clean visual language across dashboards and portals.'],
  ['FN', 'Fatima Noor', 'Operations', 'Turns school feedback into product improvements and support playbooks.'],
  ['ZZ', 'Zain Zafar', 'Growth', 'Partners with school networks to modernise daily operations.'],
];

const values = [
  { icon: Users, title: 'Human first', description: 'Software should make school teams calmer, not busier.' },
  { icon: Lock, title: 'Trust by design', description: 'School data needs clear permissions, privacy, and separation.' },
  { icon: Lightbulb, title: 'Clarity over clutter', description: 'Every screen should answer the next obvious question.' },
  { icon: Rocket, title: 'Built to scale', description: 'Start small, then grow into multi-school operations.' },
];

const timeline = [
  ['2024', 'Research with private schools across Pakistan shaped the first product requirements.'],
  ['2025', 'Core modules launched for classes, students, teachers, fees, salaries, and timetables.'],
  ['2026', 'Feham evolved into a modern SaaS experience with polished portals and school hierarchy views.'],
  ['Next', 'Admissions, attendance, analytics, and richer parent communication workflows are next.'],
];

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <SectionWrapper className="text-center">
        <Badge>About Feham</Badge>
        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl">
          We&apos;re building the future of <GradientText>school operations</GradientText>.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
          Feham exists to help Pakistani private schools move from scattered paper, spreadsheets, and WhatsApp threads into one calm digital operating system.
        </p>
      </SectionWrapper>

      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/40">
        <div className="text-center">
          <Badge>Team</Badge>
          <h2 className="mt-4 text-4xl font-extrabold">The people behind the platform.</h2>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {team.map(([initials, name, role, bio]) => (
            <GlowCard key={name}>
              <div className="flex items-start justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-lg font-extrabold text-white">
                  {initials}
                </span>
                <Link href="https://linkedin.com" className="text-sm font-bold text-gray-400 hover:text-violet-600 dark:hover:text-violet-300">
                  in
                </Link>
              </div>
              <h3 className="mt-6 text-xl font-bold">{name}</h3>
              <p className="mt-1 text-sm font-semibold text-violet-600 dark:text-violet-300">{role}</p>
              <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">{bio}</p>
            </GlowCard>
          ))}
        </motion.div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="text-center">
          <Badge>Values</Badge>
          <h2 className="mt-4 text-4xl font-extrabold">What guides our decisions.</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <GlowCard key={value.title}>
              <value.icon className="h-8 w-8 text-violet-600 dark:text-violet-300" />
              <h3 className="mt-5 text-xl font-bold">{value.title}</h3>
              <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">{value.description}</p>
            </GlowCard>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/40">
        <div className="text-center">
          <Badge>Timeline</Badge>
          <h2 className="mt-4 text-4xl font-extrabold">Milestones on the way.</h2>
        </div>
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="absolute left-4 top-0 h-full w-px bg-violet-200 dark:bg-violet-900 md:left-1/2" />
          {timeline.map(([year, event], index) => (
            <motion.div
              key={year}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`relative mb-10 grid gap-6 md:grid-cols-2 ${index % 2 === 1 ? 'md:text-right' : ''}`}
            >
              <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                <div className="ml-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:ml-0">
                  <p className="text-2xl font-extrabold text-violet-600 dark:text-violet-300">{year}</p>
                  <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">{event}</p>
                </div>
              </div>
              <span className="absolute left-4 top-7 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-white bg-violet-600 dark:border-gray-900 md:left-1/2" />
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-violet-700 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold">Want to build with us?</h2>
          <p className="mt-4 text-lg text-violet-100">
            We&apos;re looking for people who care about education, operations, and beautifully useful software.
          </p>
          <Link
            href="mailto:careers@feham.app"
            className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-violet-700 transition hover:bg-violet-50"
          >
            Join us
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}

