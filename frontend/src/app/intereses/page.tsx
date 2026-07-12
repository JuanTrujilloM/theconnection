'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { PreferencesForm } from '@/components/forms/PreferencesForm';

// Edit-interests screen. Reuses the HU-03 form in edit mode (pre-filled from
// GET /preferences/me); protected by AuthGate.
export default function EditInterestsPage() {
  return (
    <AuthGate>
      {(user) => (
        <>
          <div className="mb-6">
            <h1 className="text-cream text-2xl font-bold">Editar intereses</h1>
            <p className="text-slate mt-1 text-sm">
              Ajusta lo que buscas cuando quieras.
            </p>
          </div>

          <PreferencesForm user={user} edit />
        </>
      )}
    </AuthGate>
  );
}
