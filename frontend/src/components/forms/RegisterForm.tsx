'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterValues } from '@/lib/validation/auth';
import { useRegister } from '@/hooks/useRegister';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@eafit.edu.co"
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
        <Input
          id="cellphone"
          type="tel"
          autoComplete="tel"
          placeholder="+57 300 123 4567"
          {...register('cellphone')}
        />
        {errors.cellphone && (
          <p className="text-xs text-red-500">{errors.cellphone.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enviando...' : 'Continuar'}
      </Button>
    </form>
  );
}
