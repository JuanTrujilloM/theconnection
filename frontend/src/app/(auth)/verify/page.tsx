import { Suspense } from 'react';
import { VerificationForm } from '@/components/forms/VerificationForm';

export default function VerifyPage() {
  return (
    <>
      <h1 className="text-cream text-xl font-bold">Verifica tu correo</h1>

      {/* useSearchParams requires a Suspense boundary or the production build fails. */}
      <Suspense fallback={<p className="text-slate text-sm">Cargando...</p>}>
        <VerificationForm />
      </Suspense>
    </>
  );
}
