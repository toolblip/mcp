// JWT decoder — decode and inspect JSON Web Tokens (no verification)

export interface JwtResult {
  header?: { alg: string; typ: string; [key: string]: unknown };
  payload?: Record<string, unknown>;
  signature?: string;
  valid: boolean;
  error?: string;
  expired?: boolean;
  issuedAt?: string;
  expiresAt?: string;
}

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and pad
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  try {
    return decodeURIComponent(
      atob(s)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(s);
  }
}

export function decodeJwt(token: string): JwtResult {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'JWT must have 3 parts separated by dots (header.payload.signature)' };
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    const result: JwtResult = { header, payload, signature, valid: true };

    // Check expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      result.expired = expDate < new Date();
      result.expiresAt = expDate.toISOString();
    }

    if (payload.iat) {
      result.issuedAt = new Date(payload.iat * 1000).toISOString();
    }

    return result;
  } catch (e: any) {
    return { valid: false, error: `Failed to decode JWT: ${e.message}` };
  }
}
