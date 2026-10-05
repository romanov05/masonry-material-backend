// 23505 — код PostgreSQL для нарушения ограничения UNIQUE
export function isMasonryMaterialUniqueViolation(error: unknown): boolean {
  const candidate = error as { code?: string; driverError?: { code?: string } } | null;
  return candidate?.code === '23505' || candidate?.driverError?.code === '23505';
}
