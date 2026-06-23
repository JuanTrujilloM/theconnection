import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-cream text-xl font-bold">Crea tu cuenta</h1>
        <p className="text-slate text-sm">
          Regístrate con tu correo universitario para verificar que eres
          estudiante.
        </p>
      </div>

      <RegisterForm />

      <p className="text-slate text-center text-xs">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-cyan underline">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
