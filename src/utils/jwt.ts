export function isJwtExpired(token: string): boolean {
  if (!token) return true;
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    if (!decoded.exp) return true;
    // exp is in seconds
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
} 