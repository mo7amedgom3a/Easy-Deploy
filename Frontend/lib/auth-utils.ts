/**
 * Server-side authentication utilities
 * These functions can be safely used in middleware and server components
 */

/**
 * Check if a route is protected and requires authentication
 * @param path - The current path/route
 * @returns boolean indicating if the route requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  return path.startsWith("/dashboard");
}