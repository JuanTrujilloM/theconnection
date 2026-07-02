import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  // Cell renderer for one row.
  cell: (row: T) => ReactNode;
  // Optional extra classes for alignment/width (e.g. 'text-right').
  className?: string;
}

// Desktop data table with loading, empty and error states. Rows are keyed by
// `rowKey` so React can reconcile after mutations.
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  emptyMessage = 'No hay datos para mostrar.',
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="border-white/10 bg-navy-card/60 overflow-x-auto rounded-2xl border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-white/10 border-b">
            {columns.map((column) => (
              <th
                key={column.header}
                className={`text-slate px-4 py-3 text-xs font-semibold tracking-wide uppercase ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <StateRow span={columns.length} text="Cargando..." pulse />
          ) : isError ? (
            <StateRow
              span={columns.length}
              text="No se pudo cargar la información."
            />
          ) : !rows || rows.length === 0 ? (
            <StateRow span={columns.length} text={emptyMessage} />
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-white/5 hover:bg-white/[0.03] border-b transition last:border-0"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`text-cream px-4 py-3 align-middle ${column.className ?? ''}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StateRow({
  span,
  text,
  pulse,
}: {
  span: number;
  text: string;
  pulse?: boolean;
}) {
  return (
    <tr>
      <td
        colSpan={span}
        className={`text-slate px-4 py-10 text-center text-sm ${pulse ? 'animate-pulse' : ''}`}
      >
        {text}
      </td>
    </tr>
  );
}
