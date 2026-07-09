'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/admin/PageHeader';

// Business overview — TEMPLATE. The metric cards below are placeholders wired to
// no data yet; implement the /admin/overview endpoint + real figures later
// (users, matches by status, attendance rate, commission revenue, top venues).
// Kept as a scaffold so the layout and navigation are already in place.

interface MetricSlot {
  label: string;
  hint: string;
}

const METRICS: MetricSlot[] = [
  { label: 'Usuarios totales', hint: 'verificados · activos · en pausa' },
  { label: 'Matches de la semana', hint: 'pendientes · confirmados' },
  { label: 'Citas confirmadas', hint: 'próximas · completadas' },
  { label: 'Tasa de asistencia', hint: 'de las citas con feedback' },
  { label: 'Ingresos por comisión', hint: 'estimado del período' },
  { label: 'Gasto promedio', hint: 'por persona / por cita' },
];

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        title="Resumen de negocio"
        description="Vista general de la operación. Las métricas se conectarán en una próxima iteración."
      />

      <div className="mb-4 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-gold">
        Plantilla: estas tarjetas son marcadores de posición. La lógica de
        métricas se implementará después.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPlaceholder title="Matches por estado" />
        <ChartPlaceholder title="Usuarios por universidad" />
      </div>

      <p className="text-slate mt-8 text-sm">
        Mientras tanto, explora los datos reales en{' '}
        <Link href="/admin/matches" className="text-cyan hover:underline">
          Matches
        </Link>
        ,{' '}
        <Link href="/admin/usuarios" className="text-cyan hover:underline">
          Usuarios
        </Link>{' '}
        y{' '}
        <Link href="/admin/venues" className="text-cyan hover:underline">
          Lugares
        </Link>
        .
      </p>
    </>
  );
}

function MetricCard({ metric }: { metric: MetricSlot }) {
  return (
    <div className="border-white/10 bg-navy-card/60 rounded-2xl border p-5">
      <p className="text-slate text-sm font-medium">{metric.label}</p>
      <p className="text-cream/40 mt-2 text-3xl font-bold">—</p>
      <p className="text-slate/70 mt-1 text-xs">{metric.hint}</p>
    </div>
  );
}

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="border-white/10 bg-navy-card/60 rounded-2xl border p-5">
      <p className="text-cream text-sm font-semibold">{title}</p>
      <div className="mt-4 flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10">
        <span className="text-slate/60 text-xs">Gráfico pendiente</span>
      </div>
    </div>
  );
}
