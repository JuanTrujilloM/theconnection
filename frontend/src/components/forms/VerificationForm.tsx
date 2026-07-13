'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  registerSchema,
  verifySchema,
  type VerifyValues,
} from '@/lib/validation/auth';
import { useVerifyCode } from '@/hooks/useVerifyCode';
import { useResendCode } from '@/hooks/useResendCode';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { RESEND_COOLDOWN_SECONDS } from '@/lib/constants/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function VerificationForm() {
  const router = useRouter();
  // Trust the URL only if it carries a valid registration email; otherwise the
  // guard below sends the user back to /register.
  const rawEmail = useSearchParams().get('email') ?? '';
  const email = registerSchema.shape.email.safeParse(rawEmail).success
    ? rawEmail
    : '';

  const { mutateAsync: verify, isPending } = useVerifyCode();
  const { mutateAsync: resend, isPending: isResending } = useResendCode();

  const [cooldown, setCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyValues>({ resolver: zodResolver(verifySchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!email) {
    return (
      <p className="text-slate text-sm">
        No encontramos tu correo.{' '}
        <Link href="/register" className="text-cyan underline">
          Vuelve a registrarte
        </Link>
        .
      </p>
    );
  }

  const onSubmit = async (values: VerifyValues) => {
    try {
      // Returning users (login) skip onboarding; new users (register) start it.
      const user = await verify({ email, code: values.code });
      router.push(user.onboardingCompleted ? '/dashboard' : '/onboarding/perfil');
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  };

  const onResend = async () => {
    setResendNotice(null);
    try {
      await resend(email);
      setResendNotice('Te enviamos un nuevo código.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setResendNotice(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate text-sm">
        Ingresa el código de 6 dígitos que enviamos a{' '}
        <span className="text-cream font-medium">{email}</span>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            className="text-center text-lg tracking-[0.4em]"
            {...register('code')}
          />
          {errors.code && (
            <p className="text-blush text-xs">{errors.code.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-blush text-sm">{errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Verificando...' : 'Verificar'}
        </Button>
      </form>

      <div className="text-slate text-center text-sm">
        <button
          type="button"
          onClick={onResend}
          disabled={isResending || cooldown > 0}
          className="text-cyan underline disabled:text-slate disabled:no-underline disabled:opacity-50"
        >
          {cooldown > 0
            ? `Reenviar código en ${cooldown}s`
            : 'Reenviar código'}
        </button>
        {resendNotice && (
          <p className="text-slate mt-1 text-xs">{resendNotice}</p>
        )}
      </div>
    </div>
  );
}
