const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
  'auth/network-request-failed': 'Error de red. Verifica tu conexión.',
  'auth/popup-closed-by-user': 'Cerraste la ventana antes de completar el inicio de sesión.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Permite pop-ups e intenta de nuevo.',
  'auth/cancelled-popup-request': 'Solo puede haber una ventana de inicio de sesión abierta a la vez.',
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con ese correo usando otro método de acceso.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado para iniciar sesión con Google.',
}

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code
  if (code && MESSAGES[code]) return MESSAGES[code]
  return 'Ocurrió un error inesperado. Intenta nuevamente.'
}
