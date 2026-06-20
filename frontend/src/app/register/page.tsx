import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Crea tu cuenta
          </h1>
          <p className="text-sm text-zinc-500">
            Regístrate con tu correo universitario para verificar que eres
            estudiante.
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-xs text-zinc-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/" className="underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
