import { RoleMarketIntelligence } from '../ats/roleIntelligence';
import { ExperienceLevel } from '../types';

export function validateRewrite(
    rewritten: string,
    experienceLevel: ExperienceLevel,
    intelligence: RoleMarketIntelligence
): string[] {
    const warnings: string[] = [];
    const lower = rewritten.toLowerCase();

    for (const avoid of intelligence.avoidClaims) {
        if (lower.includes(avoid.toLowerCase())) {
            warnings.push(`⚠️ Contains "${avoid}" - may be questioned in interviews`);
        }
    }

    if (experienceLevel === 'fresher' || experienceLevel === '1-3') {
        const leadershipTerms = ['led team', 'managed', 'spearheaded', 'drove strategy', 'orchestrated'];
        for (const term of leadershipTerms) {
            if (lower.includes(term)) {
                warnings.push(`⚠️ Leadership claim "${term}" may not match ${experienceLevel} level`);
            }
        }
    }

    return warnings;
}
