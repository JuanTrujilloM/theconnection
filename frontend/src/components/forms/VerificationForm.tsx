'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifySchema, type VerifyValues } from '@/lib/validation/auth';
import { useVerifyCode } from '@/hooks/useVerifyCode';
import { useResendCode } from '@/hooks/useResendCode';
import { getApiErrorMessage } from '@/lib/api/client';

const RESEND_COOLDOWN_SECONDS = 60;

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-center text-lg tracking-[0.4em] text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

export function VerificationForm() {
  const router = useRouter();
  const email = useSearchParams().get('email') ?? '';

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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No encontramos tu correo.{' '}
        <Link href="/register" className="underline">
          Vuelve a registrarte
        </Link>
        .
      </p>
    );
  }

  const onSubmit = async (values: VerifyValues) => {
    try {
      await verify({ email, code: values.code });
      router.push('/onboarding');
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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Ingresa el código de 6 dígitos que enviamos a{' '}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {email}
        </span>
        .
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            className={inputClass}
            {...register('code')}
          />
          {errors.code && (
            <p className="text-xs text-red-500">{errors.code.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {isPending ? 'Verificando...' : 'Verificar'}
        </button>
      </form>

      <div className="text-center text-sm text-zinc-500">
        <button
          type="button"
          onClick={onResend}
          disabled={isResending || cooldown > 0}
          className="underline disabled:no-underline disabled:opacity-50"
        >
          {cooldown > 0
            ? `Reenviar código en ${cooldown}s`
            : 'Reenviar código'}
        </button>
        {resendNotice && (
          <p className="mt-1 text-xs text-zinc-400">{resendNotice}</p>
        )}
      </div>
    </div>
  );
}
