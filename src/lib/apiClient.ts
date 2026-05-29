/**
 * Utility tool to handle CSRF tokens and safe data-mutating network configurations
 */

// Helper to securely extract cookie string tokens browser-side
function getCookieValue(cookieName: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Helper to generate a random cryptographic token string if missing
function generateSecureToken(): string {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

/**
 * Custom Fetch Wrapper that automatically injects CSRF headers for mutating requests
 */
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

  // Initialize or maintain client-side tracking tokens if missing
  if (typeof document !== 'undefined' && !getCookieValue('csrfToken')) {
    const freshToken = generateSecureToken();
    document.cookie = `csrfToken=${freshToken}; path=/; max-age=3600; SameSite=Strict; Secure`;
  }

  const token = getCookieValue('csrfToken');
  const secureHeaders = new Headers(options.headers || {});

  // Automatically attach the required token to the matching header fields
  if (mutatingMethods.includes(method) && token) {
    secureHeaders.set('x-csrf-token', token);
  }

  return fetch(url, {
    ...options,
    headers: secureHeaders,
  });
}
