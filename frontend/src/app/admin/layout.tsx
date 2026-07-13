'use client';

import type { ReactNode } from 'react';
import { AdminGate } from '@/components/admin/AdminGate';
import { AdminShell } from '@/components/admin/AdminShell';

// Desktop admin section. The gate authorizes, the shell provides the sidebar +
// top bar chrome shared by every admin page.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      {(user) => <AdminShell user={user}>{children}</AdminShell>}
    </AdminGate>
  );
}
