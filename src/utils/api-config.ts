/**
 * API Configuration Utility
 * Centralized API base URL management
 */

export function getApiBaseUrl(): string {
  // Check environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if running on localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  
  // Production default
  return 'https://api.hexacv.online';
}
