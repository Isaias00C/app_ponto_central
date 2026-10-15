import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import { Button } from '@/components/button';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { errorMessage } from '@/lib/shirts';

import styles from './login-page.module.css';

export function LoginPage() {
  const { signIn } = useAuth();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  function onEmailKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter no e-mail vai para a senha em vez de enviar o formulario incompleto.
    if (event.key === 'Enter' && password.length === 0) {
      event.preventDefault();
      passwordRef.current?.focus();
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);
    try {
      // Ao entrar, o guarda de rotas leva para o app sozinho.
      await signIn(email, password);
    } catch (e) {
      setError(errorMessage(e));
      setLoading(false);
    }
  }

  return (
    <main className={styles.content}>
      <form className={styles.card} onSubmit={submit}>
        <Logo className={styles.logo} />
        <h1 className={styles.title}>Ponto Central</h1>
        <p className={styles.subtitle}>Entre para acessar o estoque de camisas.</p>

        <label className={styles.field}>
          <span className={styles.label}>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={onEmailKeyDown}
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            disabled={loading}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Senha</span>
          <input
            ref={passwordRef}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            enterKeyHint="go"
            disabled={loading}
            className={styles.input}
          />
        </label>

        {error ? <p className="banner banner-error">{error}</p> : null}

        <Button type="submit" label="Entrar" disabled={!canSubmit} loading={loading} />
      </form>
    </main>
  );
}
