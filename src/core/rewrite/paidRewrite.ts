/**
 * Paid rewrite: calls backend API only (OpenAI key never in frontend).
 */
import { ExperienceLevel, TargetMarket } from '../types';

export interface PaidRewriteOptions {
  originalText: string;
  role: string;
  market: TargetMarket;
  experienceLevel: ExperienceLevel;
  jdKeywords?: string[];
}

export interface PaidRewriteResult {
  rewritten: string;
  changes: string[];
  warnings: string[];
}

const API_BASE = typeof window !== 'undefined' ? '' : '';

export async function rewriteWithConstraints(
  options: PaidRewriteOptions
): Promise<PaidRewriteResult> {
  try {
    const res = await fetch(`${API_BASE}/api/rewrite/paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalText: options.originalText,
        role: options.role,
        market: options.market,
        experienceLevel: options.experienceLevel,
        jdKeywords: options.jdKeywords,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        rewritten: options.originalText,
        changes: [],
        warnings: [data.error || 'Paid rewrite unavailable'],
      };
    }

    return {
      rewritten: data.rewritten ?? options.originalText,
      changes: Array.isArray(data.changes) ? data.changes : [],
      warnings: Array.isArray(data.warnings) ? data.warnings : [],
    };
  } catch (e) {
    console.error('Paid rewrite failed', e);
    return {
      rewritten: options.originalText,
      changes: [],
      warnings: ['Service error'],
    };
  }
}
