import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Flame,
  Bell,
  BookOpen,
  Github,
  ArrowRight,
} from 'lucide-react';
import { wisdomForDate } from '@/lib/wisdom';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Calendar,
    title: 'One coherent day',
    body: 'Today, week strip, and time-blocked schedule kept in sync so you always know what is next.',
  },
  {
    icon: Flame,
    title: 'Habit Points & ranks',
    body: 'Earn HP for every completion. Climb a 25-tier ladder from Iron to Radiant. Streaks and badges compound automatically.',
  },
  {
    icon: Bell,
    title: 'Reminders that respect you',
    body: 'Web-push notifications fire at the right moment in your own timezone. Skip a day when you need to.',
  },
  {
    icon: BookOpen,
    title: 'Built on the classics',
    body: 'Curated templates from Deep Work, Atomic Habits, and Can’t Hurt Me. Rotating daily wisdom on Today.',
  },
];

const AUTHORS = [
  { name: 'Cal Newport', book: 'Deep Work' },
  { name: 'James Clear', book: 'Atomic Habits' },
  { name: 'David Goggins', book: 'Can’t Hurt Me' },
];

function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function LandingPage() {
  const wisdom = wisdomForDate(todayIso());

  return (
    <div className="min-h-screen bg-bg text-primary">
      <TopBar />

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pt-24">
        <Hero />

        <Section eyebrow="What you get" className="mt-24">
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </Section>

        <Section eyebrow="Today’s wisdom" className="mt-24">
          <blockquote className="rounded-card border border-DEFAULT bg-surface p-6 shadow-card">
            <p className="font-serif-display text-[22px] leading-snug text-primary text-balance">
              &ldquo;{wisdom.quote}&rdquo;
            </p>
            <footer className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
              {wisdom.author} &middot;{' '}
              <span className="italic normal-case tracking-normal">{wisdom.book}</span>
            </footer>
          </blockquote>
          <p className="mt-3 text-center text-xs text-muted">
            Rotates daily. Powered by{' '}
            {AUTHORS.map((a, i) => (
              <span key={a.book}>
                <span className="text-secondary">{a.name}</span>
                {i < AUTHORS.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        </Section>

        <Section className="mt-24 text-center">
          <h2 className="font-serif-display text-[28px] leading-tight text-primary sm:text-[34px]">
            Ready when you are.
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Two minutes to sign up. No credit card.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast shadow-card"
            >
              Create an account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="rounded-pill px-4 py-3 text-sm font-semibold text-secondary"
            >
              Sign in
            </Link>
          </div>
        </Section>
      </main>

      <footer className="border-t border-DEFAULT">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs text-muted">
          <span>© {new Date().getFullYear()} Habit Tracker</span>
          <a
            href="https://github.com/mfcbdev/Habit-Tracker"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-secondary"
          >
            <Github className="h-3.5 w-3.5" /> Source
          </a>
        </div>
      </footer>
    </div>
  );
}

/* --------------------------- pieces --------------------------- */

function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-DEFAULT bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-contrast">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-serif-display text-lg text-primary">Habit Tracker</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-pill px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-pill bg-primary px-3.5 py-1.5 text-sm font-semibold text-inverse"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="text-center">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
      >
        A gentle, iOS-style habit tracker
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mt-4 font-serif-display text-[46px] leading-[1.05] tracking-tight text-primary text-balance sm:text-[68px]"
      >
        Build habits that build you.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-secondary text-balance"
      >
        A simple daily practice, framed with wisdom from the books that shaped
        habit science. Points, streaks, and reminders keep you honest —
        the tools stay out of your way.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-8 flex items-center justify-center gap-3"
      >
        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast shadow-card"
        >
          Start free <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/login"
          className="rounded-pill border border-DEFAULT px-5 py-3 text-sm font-semibold text-secondary"
        >
          I have an account
        </Link>
      </motion.div>
    </section>
  );
}

function Section({
  eyebrow,
  className,
  children,
}: {
  eyebrow?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      {eyebrow && (
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          {eyebrow}
        </p>
      )}
      {children}
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn('rounded-card border border-DEFAULT bg-surface p-5 shadow-card')}
    >
      <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/12 text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <p className="font-serif-display text-[18px] leading-tight text-primary">
        {feature.title}
      </p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-secondary">{feature.body}</p>
    </motion.div>
  );
}
