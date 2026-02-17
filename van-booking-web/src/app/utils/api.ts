const BACKEND_URL = 'http://localhost:8080';

/**
 * Utility function to make authenticated fetch requests
 */
export async function authFetch(url: string, options: RequestInit = {}) {
    const session = typeof window !== 'undefined' ? localStorage.getItem('user_session') : null;
    let token = null;

    if (session) {
        try {
            const parsed = JSON.parse(session);
            token = parsed.token;
        } catch (e) {
            console.error('Error parsing session for token', e);
        }
    }

    const headers = {
        ...options.headers,
    } as Record<string, string>;

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
