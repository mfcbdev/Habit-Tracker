import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signUp(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-primary">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <header className="mb-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Start a new habit</p>
          <h1 className="font-serif-display text-[34px] leading-tight text-primary">Create your account.</h1>
        </header>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-input border border-DEFAULT bg-surface px-4 py-3 text-base text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-input border border-DEFAULT bg-surface px-4 py-3 text-base text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-pill bg-accent py-3.5 font-semibold text-accent-contrast shadow-card transition active:scale-[0.98] disabled:opacity-50"
        >
          Sign up
        </button>
        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
