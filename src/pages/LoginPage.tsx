import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/I18nProvider';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-primary">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <header className="mb-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            {t('auth.login.eyebrow')}
          </p>
          <h1 className="font-serif-display text-[34px] leading-tight text-primary">
            {t('auth.login.title')}
          </h1>
        </header>
        <input
          type="email"
          placeholder={t('auth.login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-input border border-DEFAULT bg-surface px-4 py-3 text-base text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <input
          type="password"
          placeholder={t('auth.login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-input border border-DEFAULT bg-surface px-4 py-3 text-base text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-pill bg-accent py-3.5 font-semibold text-accent-contrast shadow-card transition active:scale-[0.98] disabled:opacity-50"
        >
          {t('auth.login.submit')}
        </button>
        <p className="text-center text-sm text-muted">
          {t('auth.login.noAccount')}{' '}
          <Link to="/signup" className="text-accent underline-offset-4 hover:underline">
            {t('auth.login.signup')}
          </Link>
        </p>
      </form>
    </div>
  );
}
