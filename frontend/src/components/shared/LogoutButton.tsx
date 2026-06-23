'use client';

import { useLogout } from '@/hooks/useLogout';
import { Button } from '@/components/ui/Button';

// Signs the current user out from the dashboard header.
export function LogoutButton() {
  const { mutate, isPending } = useLogout();

  return (
    <Button
      variant="secondary"
      className="px-4 py-2"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? 'Saliendo...' : 'Cerrar sesión'}
    </Button>
  );
}
