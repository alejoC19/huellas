export function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'recién';
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;

  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// isoDate es un "date" de Postgres (YYYY-MM-DD, sin hora) — se parsea como
// fecha local, no UTC, para que "hoy"/"mañana" coincidan con el calendario
// del dispositivo.
export function formatDueDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  const today = startOfDay(new Date());
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';
  if (diffDays > 1 && diffDays <= 7) return `En ${diffDays} días`;
  if (diffDays < -1 && diffDays >= -7) return `Venció hace ${-diffDays} días`;

  return due.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}
