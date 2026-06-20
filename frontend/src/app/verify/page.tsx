import { Suspense } from 'react';
import { VerificationForm } from '@/components/forms/VerificationForm';

export default function VerifyPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Verifica tu correo
        </h1>

        {/* useSearchParams requires a Suspense boundary or the production build fails. */}
        <Suspense
          fallback={<p className="text-sm text-zinc-400">Cargando...</p>}
        >
          <VerificationForm />
        </Suspense>
      </div>
    </div>
  );
}
