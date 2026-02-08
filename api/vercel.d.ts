/**
 * Type declarations for @vercel/node so API routes type-check without requiring
 * the package to be resolved (e.g. when api/ is type-checked separately).
 * Vercel provides these at runtime.
 */
declare module '@vercel/node' {
  import { IncomingMessage, ServerResponse } from 'http';
  export interface VercelRequest extends IncomingMessage {
    body?: unknown;
    query?: Record<string, string | string[]>;
    cookies?: Record<string, string>;
  }
  export interface VercelResponse extends ServerResponse {
    status(code: number): VercelResponse;
    json(body: unknown): VercelResponse;
    end(body?: string): VercelResponse;
  }
  export type VercelRequestHandler = (
    req: VercelRequest,
    res: VercelResponse
  ) => void | Promise<void>;
}
