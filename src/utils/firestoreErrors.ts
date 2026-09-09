export function getFirestoreErrorMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string })?.code
  if (code === 'permission-denied') {
    return 'No tienes permisos actualizados para esta acción. Cierra sesión y vuelve a entrar.'
  }
  return fallback
}
