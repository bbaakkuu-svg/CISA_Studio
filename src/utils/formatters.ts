/**
 * CISA Studio — Utilidades Puras de Formateo
 * Autor: Agente 4 (Auditor & Refactor)
 */

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDateSpanish(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Fecha no disponible';
  }
}

export function sanitizeFilename(name: string, fallback: string = 'Documento_CISA'): string {
  if (!name || typeof name !== 'string') return fallback;
  return name.replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚñÑ]/g, '_').substring(0, 40);
}
