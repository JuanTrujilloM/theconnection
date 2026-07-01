import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';
import { GuestGate } from '@/components/shared/GuestGate';

export default function LoginPage() {
  return (
    <GuestGate>
      <div className="space-y-1">
        <h1 className="text-cream text-xl font-bold">Inicia sesión</h1>
        <p className="text-slate text-sm">
          Te enviaremos un código de acceso a tu correo universitario.
        </p>
      </div>

      <LoginForm />

      <p className="text-slate text-center text-xs">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-cyan underline">
          Regístrate
        </Link>
      </p>
    </GuestGate>
  );
}
