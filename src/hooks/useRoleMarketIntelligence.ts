/**
 * Hook to integrate Role Market Intelligence into components
 */

import { useState, useEffect } from 'react';
import { getRoleMarketIntelligence, RoleMarketIntelligence } from '../services/roleMarketIntelligenceService';

export function useRoleMarketIntelligence(
  role: string | null,
  market: 'india' | 'us' | 'uk' | 'eu' | 'gulf' | 'remote',
  experienceLevel: 'fresher' | '1-3' | '3-5' | '5-8' | '8+'
) {
  const [intelligence, setIntelligence] = useState<RoleMarketIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) {
      setIntelligence(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    getRoleMarketIntelligence(role, market, experienceLevel)
      .then(data => {
        setIntelligence(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load role market intelligence:', err);
        setError(err.message || 'Failed to load market intelligence');
        setLoading(false);
      });
  }, [role, market, experienceLevel]);

  return { intelligence, loading, error };
}
