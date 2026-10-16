export const ADMIN_SESSION_KEY = 'uemg-champions-admin';

/** Conferência só da interface. O site é estático: qualquer pessoa pode inspecionar o JavaScript. */
export function checkAdminCredentials(user: string, password: string): boolean {
  return user.trim().toLowerCase() === 'uemg' && password === 'champs';
}

export function isAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAdminSession(on: boolean): void {
  try {
    if (on) sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
