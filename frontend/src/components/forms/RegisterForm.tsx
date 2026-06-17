'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterValues } from '@/lib/validation/auth';
import { useRegister } from '@/hooks/useRegister';
import { getApiErrorMessage } from '@/lib/api/client';

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

export function RegisterForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useRegister();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await mutateAsync(values);
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Correo universitario
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@eafit.edu.co"
          className={inputClass}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="cellphone"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Celular
        </label>
        <input
          id="cellphone"
          type="tel"
          autoComplete="tel"
          placeholder="+57 300 123 4567"
          className={inputClass}
          {...register('cellphone')}
        />
        {errors.cellphone && (
          <p className="text-xs text-red-500">{errors.cellphone.message}</p>
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
        {isPending ? 'Enviando...' : 'Continuar'}
      </button>
    </form>
  );
}
