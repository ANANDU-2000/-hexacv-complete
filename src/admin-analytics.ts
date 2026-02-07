/**
 * ADMIN ANALYTICS COLLECTION MODULE
 * Local data collection for improving the rule engine
 * 
 * PRIVACY: All data is aggregated and anonymized
 * NO personally identifiable information is stored
 * 
 * Tracks:
 * - Which roles are most used
 * - Which skills are commonly missing
 * - Popular industries
 * - Template usage patterns
 * - Feature usage
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RoleUsageData {
    roleName: string;
    industry: string;
    usageCount: number;
    lastUsed: number;
}

export interface SkillGapData {
    skill: string;
    role: string;
    missedCount: number;
    lastSeen: number;
}

export interface TemplateUsageData {
    templateId: string;
    usageCount: number;
    purchaseCount: number;
    downloadCount: number;
    lastUsed: number;
}

export interface FeatureUsageData {
    featureName: string;
    usageCount: number;
    successCount: number;
    failureCount: number;
    lastUsed: number;
}

export interface SessionData {
    sessionId: string;
    startTime: number;
    endTime?: number;
    pagesVisited: string[];
    actionsPerformed: string[];
    mode: 'ai' | 'rule-based';
}

export interface AnalyticsSummary {
    totalSessions: number;
    topRoles: { role: string; count: number }[];
    topIndustries: { industry: string; count: number }[];
    missingSkillsReport: { skill: string; role: string; count: number }[];
    templatePopularity: { templateId: string; count: number }[];
    featureUsage: { feature: string; count: number }[];
    aiVsRuleBasedRatio: { ai: number; ruleBased: number };
    averageSessionDuration: number;
}

// ═══════════════════════════════════════════════════════════════
// LOCAL STORAGE KEYS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
    ROLE_USAGE: 'analytics_role_usage',
    SKILL_GAPS: 'analytics_skill_gaps',
    TEMPLATE_USAGE: 'analytics_template_usage',
    FEATURE_USAGE: 'analytics_feature_usage',
    SESSIONS: 'analytics_sessions',
    LAST_SYNC: 'analytics_last_sync'
};

// ═══════════════════════════════════════════════════════════════
// ANALYTICS COLLECTOR CLASS
// ═══════════════════════════════════════════════════════════════

class AnalyticsCollector {
    private currentSession: SessionData | null = null;
    private isEnabled: boolean = true;

    constructor() {
        this.initializeSession();
    }

    // ─────────────────────────────────────────────────────────────
    // SESSION MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    private initializeSession(): void {
        if (typeof window === 'undefined') return;

        this.currentSession = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            pagesVisited: [],
            actionsPerformed: [],
            mode: 'rule-based'
        };
    }

    private generateSessionId(): string {
        return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    /**
     * End current session and save
     */
    endSession(): void {
        if (this.currentSession) {
            this.currentSession.endTime = Date.now();
            this.saveSession(this.currentSession);
            this.currentSession = null;
        }
    }

    private saveSession(session: SessionData): void {
        const sessions = this.loadData<SessionData[]>(STORAGE_KEYS.SESSIONS) || [];
        sessions.push(session);

        // Keep only last 100 sessions
        const trimmedSessions = sessions.slice(-100);
        this.saveData(STORAGE_KEYS.SESSIONS, trimmedSessions);
    }

    /**
     * Track geographic hint (based on browser locale/timezone)
     */
    trackGeographicHint(): void {
        if (!this.isEnabled) return;
        const locale = typeof navigator !== 'undefined' ? navigator.language : 'unknown';
        const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unknown';
        this.trackAction(`geo_hint:${locale}|${timezone}`);
    }

    /**
     * Track tool usage specifically for clicks
     */
    trackToolClick(toolName: string): void {
        this.trackFeatureUsage(`tool_${toolName}`, true);
        this.trackAction(`click_tool:${toolName}`);
    }

    // ─────────────────────────────────────────────────────────────
    // DATA TRACKING
    // ─────────────────────────────────────────────────────────────

    /**
     * Track role usage
     */
    trackRoleUsage(roleName: string, industry: string): void {
        if (!this.isEnabled) return;

        const roleUsage = this.loadData<Record<string, RoleUsageData>>(STORAGE_KEYS.ROLE_USAGE) || {};
        const key = `${roleName.toLowerCase()}_${industry.toLowerCase()}`;

        if (roleUsage[key]) {
            roleUsage[key].usageCount++;
            roleUsage[key].lastUsed = Date.now();
        } else {
            roleUsage[key] = {
                roleName,
                industry,
                usageCount: 1,
                lastUsed: Date.now()
            };
        }

        this.saveData(STORAGE_KEYS.ROLE_USAGE, roleUsage);

        // Track in session
        this.trackAction(`role_select:${roleName}`);
    }

    /**
     * Track missing skills (for improving recommendations)
     */
    trackMissingSkills(skills: string[], role: string): void {
        if (!this.isEnabled) return;

        const skillGaps = this.loadData<Record<string, SkillGapData>>(STORAGE_KEYS.SKILL_GAPS) || {};

        for (const skill of skills) {
            const key = `${skill.toLowerCase()}_${role.toLowerCase()}`;

            if (skillGaps[key]) {
                skillGaps[key].missedCount++;
                skillGaps[key].lastSeen = Date.now();
            } else {
                skillGaps[key] = {
                    skill,
                    role,
                    missedCount: 1,
                    lastSeen: Date.now()
                };
            }
        }

        this.saveData(STORAGE_KEYS.SKILL_GAPS, skillGaps);
    }

    /**
     * Track template usage
     */
    trackTemplateUsage(templateId: string, action: 'view' | 'purchase' | 'download'): void {
        if (!this.isEnabled) return;

        const templateUsage = this.loadData<Record<string, TemplateUsageData>>(STORAGE_KEYS.TEMPLATE_USAGE) || {};

        if (!templateUsage[templateId]) {
            templateUsage[templateId] = {
                templateId,
                usageCount: 0,
                purchaseCount: 0,
                downloadCount: 0,
                lastUsed: Date.now()
            };
        }

        templateUsage[templateId].lastUsed = Date.now();

        switch (action) {
            case 'view':
                templateUsage[templateId].usageCount++;
                break;
            case 'purchase':
                templateUsage[templateId].purchaseCount++;
                break;
            case 'download':
                templateUsage[templateId].downloadCount++;
                break;
        }

        this.saveData(STORAGE_KEYS.TEMPLATE_USAGE, templateUsage);

        // Track in session
        this.trackAction(`template_${action}:${templateId}`);
    }

    /**
     * Track feature usage
     */
    trackFeatureUsage(featureName: string, success: boolean): void {
        if (!this.isEnabled) return;

        const featureUsage = this.loadData<Record<string, FeatureUsageData>>(STORAGE_KEYS.FEATURE_USAGE) || {};

        if (!featureUsage[featureName]) {
            featureUsage[featureName] = {
                featureName,
                usageCount: 0,
                successCount: 0,
                failureCount: 0,
                lastUsed: Date.now()
            };
        }

        featureUsage[featureName].usageCount++;
        featureUsage[featureName].lastUsed = Date.now();

        if (success) {
            featureUsage[featureName].successCount++;
        } else {
            featureUsage[featureName].failureCount++;
        }

        this.saveData(STORAGE_KEYS.FEATURE_USAGE, featureUsage);
    }

    /**
     * Track service mode (AI vs Rule-based)
     */
    trackServiceMode(mode: 'ai' | 'rule-based'): void {
        if (!this.isEnabled) return;

        if (this.currentSession) {
            this.currentSession.mode = mode;
        }

        this.trackFeatureUsage(`service_mode_${mode}`, true);
    }

    /**
     * Track page visit
     */
    trackPageVisit(page: string): void {
        if (!this.isEnabled || !this.currentSession) return;

        this.currentSession.pagesVisited.push(page);
    }

    /**
     * Track action
     */
    trackAction(action: string): void {
        if (!this.isEnabled || !this.currentSession) return;

        this.currentSession.actionsPerformed.push(action);
    }

    // ─────────────────────────────────────────────────────────────
    // DATA RETRIEVAL
    // ─────────────────────────────────────────────────────────────

    /**
     * Get analytics summary
     */
    getSummary(): AnalyticsSummary {
        const roleUsage = this.loadData<Record<string, RoleUsageData>>(STORAGE_KEYS.ROLE_USAGE) || {};
        const skillGaps = this.loadData<Record<string, SkillGapData>>(STORAGE_KEYS.SKILL_GAPS) || {};
        const templateUsage = this.loadData<Record<string, TemplateUsageData>>(STORAGE_KEYS.TEMPLATE_USAGE) || {};
        const featureUsage = this.loadData<Record<string, FeatureUsageData>>(STORAGE_KEYS.FEATURE_USAGE) || {};
        const sessions = this.loadData<SessionData[]>(STORAGE_KEYS.SESSIONS) || [];

        // Calculate top roles
        const topRoles = Object.values(roleUsage)
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 10)
            .map(r => ({ role: r.roleName, count: r.usageCount }));

        // Calculate top industries
        const industryMap = new Map<string, number>();
        for (const role of Object.values(roleUsage)) {
            const current = industryMap.get(role.industry) || 0;
            industryMap.set(role.industry, current + role.usageCount);
        }
        const topIndustries = Array.from(industryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([industry, count]) => ({ industry, count }));

        // Calculate missing skills report
        const missingSkillsReport = Object.values(skillGaps)
            .sort((a, b) => b.missedCount - a.missedCount)
            .slice(0, 20)
            .map(s => ({ skill: s.skill, role: s.role, count: s.missedCount }));

        // Calculate template popularity
        const templatePopularity = Object.values(templateUsage)
            .sort((a, b) => b.usageCount - a.usageCount)
            .map(t => ({ templateId: t.templateId, count: t.usageCount }));

        // Calculate feature usage
        const featureUsageReport = Object.values(featureUsage)
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 15)
            .map(f => ({ feature: f.featureName, count: f.usageCount }));

        // Calculate AI vs Rule-based ratio
        const aiUsage = featureUsage['service_mode_ai']?.usageCount || 0;
        const ruleBasedUsage = featureUsage['service_mode_rule-based']?.usageCount || 0;

        // Calculate average session duration
        const completedSessions = sessions.filter(s => s.endTime);
        const totalDuration = completedSessions.reduce((sum, s) =>
            sum + ((s.endTime || 0) - s.startTime), 0);
        const averageSessionDuration = completedSessions.length > 0
            ? totalDuration / completedSessions.length
            : 0;

        return {
            totalSessions: sessions.length,
            topRoles,
            topIndustries,
            missingSkillsReport,
            templatePopularity,
            featureUsage: featureUsageReport,
            aiVsRuleBasedRatio: {
                ai: aiUsage,
                ruleBased: ruleBasedUsage
            },
            averageSessionDuration
        };
    }

    /**
     * Get most requested roles
     */
    getTopRoles(limit: number = 10): { role: string; industry: string; count: number }[] {
        const roleUsage = this.loadData<Record<string, RoleUsageData>>(STORAGE_KEYS.ROLE_USAGE) || {};

        return Object.values(roleUsage)
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, limit)
            .map(r => ({ role: r.roleName, industry: r.industry, count: r.usageCount }));
    }

    /**
     * Get commonly missing skills for a role
     */
    getMissingSkillsForRole(role: string): { skill: string; count: number }[] {
        const skillGaps = this.loadData<Record<string, SkillGapData>>(STORAGE_KEYS.SKILL_GAPS) || {};

        return Object.values(skillGaps)
            .filter(s => s.role.toLowerCase() === role.toLowerCase())
            .sort((a, b) => b.missedCount - a.missedCount)
            .map(s => ({ skill: s.skill, count: s.missedCount }));
    }

    /**
     * Get feature success rate
     */
    getFeatureSuccessRate(featureName: string): number {
        const featureUsage = this.loadData<Record<string, FeatureUsageData>>(STORAGE_KEYS.FEATURE_USAGE) || {};
        const feature = featureUsage[featureName];

        if (!feature || feature.usageCount === 0) return 0;

        return (feature.successCount / feature.usageCount) * 100;
    }

    // ─────────────────────────────────────────────────────────────
    // DATA MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    /**
     * Export all analytics data
     */
    exportData(): string {
        const data = {
            roleUsage: this.loadData(STORAGE_KEYS.ROLE_USAGE),
            skillGaps: this.loadData(STORAGE_KEYS.SKILL_GAPS),
            templateUsage: this.loadData(STORAGE_KEYS.TEMPLATE_USAGE),
            featureUsage: this.loadData(STORAGE_KEYS.FEATURE_USAGE),
            sessions: this.loadData(STORAGE_KEYS.SESSIONS),
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Clear all analytics data
     */
    clearAllData(): void {
        if (typeof localStorage === 'undefined') return;

        for (const key of Object.values(STORAGE_KEYS)) {
            localStorage.removeItem(key);
        }
    }

    /**
     * Enable/disable analytics collection
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    /**
     * Check if analytics is enabled
     */
    isAnalyticsEnabled(): boolean {
        return this.isEnabled;
    }

    // ─────────────────────────────────────────────────────────────
    // STORAGE HELPERS
    // ─────────────────────────────────────────────────────────────

    private loadData<T>(key: string): T | null {
        if (typeof localStorage === 'undefined') return null;

        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    private saveData(key: string, data: unknown): void {
        if (typeof localStorage === 'undefined') return;

        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            // Storage might be full, clear old data
            console.warn('Analytics storage error:', e);
            this.pruneOldData();
        }
    }

    private pruneOldData(): void {
        // Keep only recent data when storage is full
        const sessions = this.loadData<SessionData[]>(STORAGE_KEYS.SESSIONS) || [];
        if (sessions.length > 50) {
            this.saveData(STORAGE_KEYS.SESSIONS, sessions.slice(-50));
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

export const analyticsCollector = new AnalyticsCollector();

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Quick track for common events
 */
export const track = {
    role: (roleName: string, industry: string) =>
        analyticsCollector.trackRoleUsage(roleName, industry),

    missingSkills: (skills: string[], role: string) =>
        analyticsCollector.trackMissingSkills(skills, role),

    template: (templateId: string, action: 'view' | 'purchase' | 'download') =>
        analyticsCollector.trackTemplateUsage(templateId, action),

    feature: (name: string, success: boolean = true) =>
        analyticsCollector.trackFeatureUsage(name, success),

    toolClick: (name: string) =>
        analyticsCollector.trackToolClick(name),

    mode: (mode: 'ai' | 'rule-based') =>
        analyticsCollector.trackServiceMode(mode),

    page: (page: string) =>
        analyticsCollector.trackPageVisit(page),

    action: (action: string) =>
        analyticsCollector.trackAction(action)
};

// ═══════════════════════════════════════════════════════════════
// INSIGHTS GENERATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Generate actionable insights from analytics data
 */
export function generateInsights(): string[] {
    const summary = analyticsCollector.getSummary();
    const insights: string[] = [];

    // Role insights
    if (summary.topRoles.length > 0) {
        const topRole = summary.topRoles[0];
        insights.push(`Most popular role: ${topRole.role} (${topRole.count} users)`);
    }

    // Industry insights
    if (summary.topIndustries.length > 0) {
        const topIndustry = summary.topIndustries[0];
        insights.push(`Top industry: ${topIndustry.industry}`);
    }

    // Missing skills insights
    if (summary.missingSkillsReport.length > 0) {
        const topMissing = summary.missingSkillsReport.slice(0, 3)
            .map(s => s.skill)
            .join(', ');
        insights.push(`Commonly missing skills: ${topMissing}`);
    }

    // AI vs Rule-based insights
    const { ai, ruleBased } = summary.aiVsRuleBasedRatio;
    const total = ai + ruleBased;
    if (total > 0) {
        const ruleBasedPercent = Math.round((ruleBased / total) * 100);
        if (ruleBasedPercent > 30) {
            insights.push(`Rule-based mode used ${ruleBasedPercent}% of the time (AI availability may need attention)`);
        }
    }

    // Session insights
    if (summary.averageSessionDuration > 0) {
        const minutes = Math.round(summary.averageSessionDuration / 60000);
        insights.push(`Average session duration: ${minutes} minutes`);
    }

    return insights;
}

// ═══════════════════════════════════════════════════════════════
// WINDOW EVENTS FOR SESSION TRACKING
// ═══════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    // End session when user leaves
    window.addEventListener('beforeunload', () => {
        analyticsCollector.endSession();
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            analyticsCollector.endSession();
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    analyticsCollector,
    track,
    generateInsights
};
