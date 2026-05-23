'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge, GradientText, GlowCard, SectionWrapper, fadeUp, stagger } from '@/components/marketing/MarketingPrimitives';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Starter',
    monthly: 0,
    description: 'For small schools getting organised.',
    badge: 'Free',
    features: ['Up to 100 students', 'Basic student records', 'Class and section setup', 'Email support'],
    missing: ['Advanced reports', 'Salary slips'],
  },
  {
    name: 'Pro',
    monthly: 2500,
    description: 'For growing schools that need automation.',
    badge: 'Most Popular',
    popular: true,
    features: ['Up to 500 students', 'Fee challans and PDFs', 'Visual timetable builder', 'Teacher and parent portals', 'Priority support'],
    missing: ['Dedicated onboarding'],
  },
  {
    name: 'Enterprise',
    monthly: null,
    description: 'For networks and custom deployments.',
    badge: 'Custom',
    features: ['Unlimited students', 'Multi-school controls', 'Custom reports', 'Dedicated onboarding', 'SLA support'],
    missing: [],
  },
];

const comparison = [
  ['Students', '100', '500', 'Unlimited'],
  ['Fee challans', 'Basic', 'Advanced', 'Advanced'],
  ['Timetable builder', 'No', 'Yes', 'Yes'],
  ['Parent portal', 'No', 'Yes', 'Yes'],
  ['Priority support', 'No', 'Yes', 'SLA'],
];

const faqs = [
  ['Can I start free?', 'Yes. Starter is free for small schools and lets you configure core records before upgrading.'],
  ['Do annual plans include a discount?', 'Yes. Annual billing applies an estimated 20% discount compared with monthly billing.'],
  ['Can parents log in?', 'Yes. Parent accounts can view children, challans, homework, and remarks when configured.'],
  ['Can we import existing student data?', 'CSV import can be added during onboarding for paid plans.'],
  ['Is support included?', 'Starter includes email support. Pro adds priority support, and Enterprise includes SLA support.'],
  ['Can one account manage multiple schools?', 'Enterprise is designed for networks and multi-campus deployments.'],
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const priceLabel = (monthly: number | null) => {
    if (monthly === null) return 'Custom';
    if (monthly === 0) return 'Free';
    const value = annual ? Math.round(monthly * 12 * 0.8) : monthly;
    return `PKR ${value.toLocaleString()}${annual ? '/yr' : '/mo'}`;
  };

  return (
    <div className="bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <SectionWrapper className="text-center">
        <Badge>Simple pricing</Badge>
        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl">
          Choose the plan that fits your <GradientText>school stage</GradientText>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
          Transparent plans for schools that want modern operations without enterprise complexity.
        </p>

        <div className="mt-10 inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
          {[
            ['Monthly', false],
            ['Annual - save 20%', true],
          ].map(([label, value]) => (
            <button
              key={String(label)}
              type="button"
              onClick={() => setAnnual(Boolean(value))}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                annual === value
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-14 grid items-stretch gap-6 lg:grid-cols-3"
        >
          {tiers.map((tier) => (
            <GlowCard
              key={tier.name}
              className={cn(
                'flex flex-col text-left',
                tier.popular && 'scale-[1.02] border-violet-500 shadow-2xl shadow-violet-500/15 ring-2 ring-violet-500/20'
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold">{tier.name}</h2>
                <Badge className={tier.popular ? 'bg-violet-600 text-white dark:bg-violet-500' : ''}>
                  {tier.badge}
                </Badge>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{tier.description}</p>
              <p className="mt-8 text-4xl font-extrabold">{priceLabel(tier.monthly)}</p>
              <Link
                href="/get-started"
                className={cn(
                  'mt-8 rounded-lg px-6 py-3 text-center font-medium transition-all duration-200',
                  tier.popular
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700'
                    : 'border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                )}
              >
                Get started
              </Link>
              <div className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {feature}
                  </div>
                ))}
                {tier.missing.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-gray-400">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </GlowCard>
          ))}
        </motion.div>
      </SectionWrapper>

      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/40">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <button
            type="button"
            onClick={() => setCompareOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 text-left font-bold dark:border-gray-800 dark:bg-gray-950"
          >
            Compare all features
            <ChevronDown className={cn('h-5 w-5 transition-transform', compareOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {compareOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="p-4 text-left">Feature</th>
                        <th className="p-4 text-left">Starter</th>
                        <th className="p-4 text-left">Pro</th>
                        <th className="p-4 text-left">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((row) => (
                        <tr key={row[0]} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                          {row.map((cell) => (
                            <td key={cell} className="p-4 text-gray-700 dark:text-gray-300">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <div className="mt-16">
          <div className="text-center">
            <Badge>FAQ</Badge>
            <h2 className="mt-4 text-4xl font-extrabold">Questions before you start?</h2>
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {faqs.map(([question, answer], index) => (
              <div key={question} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold"
                >
                  {question}
                  <ChevronDown className={cn('h-5 w-5 transition-transform', openFaq === index && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {openFaq === index ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 leading-7 text-gray-600 dark:text-gray-400">{answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}

