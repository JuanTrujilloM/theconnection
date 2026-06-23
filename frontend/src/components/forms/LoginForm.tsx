'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginValues } from '@/lib/validation/auth';
import { useLogin } from '@/hooks/useLogin';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// HU-01 login: passwordless. Requests a code, then reuses the /verify flow.
export function LoginForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      await mutateAsync(values.email);
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label htmlFor="email" className="text-cream text-sm font-medium">
          Correo universitario
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@eafit.edu.co"
          hasError={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-blush text-xs">{errors.email.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-blush text-sm">{errors.root.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Enviando...' : 'Enviar código de acceso'}
      </Button>
    </form>
  );
}
