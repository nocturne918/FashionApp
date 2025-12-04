export const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
} as const;

if (!env.VITE_API_URL) {
  console.warn('Missing VITE_API_URL');
}
