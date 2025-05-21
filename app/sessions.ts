import { createCookie } from "@remix-run/node";

/**
 * Creates a cookie with the specified name and options
 * @param name - The name of the cookie
 * @param options - Optional cookie settings like expiration, path, etc.
 */
export function createCookieSession(name: string, options?: {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}) {
  return createCookie(name, options);
}

/**
 * Sets a cookie value
 * @param cookie - The cookie instance created with createCookieSession
 * @param value - The value to store in the cookie
 * @returns A Response object with the Set-Cookie header
 */
export async function setCookie(cookie: ReturnType<typeof createCookie>, value: any) {
  return await cookie.serialize(value);
}

/**
 * Gets a cookie value
 * @param cookie - The cookie instance created with createCookieSession
 * @param request - The request object containing the cookie
 * @returns The parsed cookie value or null if not found
 */
export async function getCookie(cookie: ReturnType<typeof createCookie>, request: Request) {
  return await cookie.parse(request.headers.get("Cookie"));
}

/**
 * Deletes a cookie by name
 * @param name - The name of the cookie to delete
 */
export function deleteCookie(name: string) {
    return createCookie(name, {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
}
