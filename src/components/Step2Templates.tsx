import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ResumeData, TemplateConfig } from '../types';
import { A4_HEIGHT, A4_WIDTH, TEMPLATES } from '../constants';
import { TemplateRenderer } from '../template-renderer';
import { initiatePayment } from '../payment-service';
import { generatePDFFromTemplate } from '../template-engine';
import { getTemplateColors } from '../utils/templateColors';
import FeedbackPopup from './FeedbackPopup';
import PaymentSuccessPopup from './PaymentSuccessPopup';

interface Step2TemplatesProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    templates?: TemplateConfig[];
    onSelect: (template: TemplateConfig) => void;
    onBack: () => void;
    onNext: () => void;
    onDataChange?: (data: ResumeData) => void;
    onGoToHomepage?: () => void;
}

const Step2Templates: React.FC<Step2TemplatesProps> = ({ data, selectedTemplate, templates = TEMPLATES, onSelect, onBack, onGoToHomepage }) => {
    // Check if resume has minimum required content
    const isResumeIncomplete = !data.basics.fullName?.trim() || !data.basics.email?.trim() || !data.summary?.trim();

    // Preview state
    const [zoom, setZoom] = useState(0.55);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fullscreen modal state
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [fullscreenZoom, setFullscreenZoom] = useState(0.8);
    const [fullscreenTotalPages, setFullscreenTotalPages] = useState(1);

    // Payment state
    const [unlockedTemplates, setUnlockedTemplates] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [purchasedTemplate, setPurchasedTemplate] = useState<TemplateConfig | null>(null);
    const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

    // Generate unique user session ID
    const [sessionId] = useState(() => {
        const existingId = localStorage.getItem('user_session_id');
        if (existingId) {
            return existingId;
        }
        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('user_session_id', newId);
        return newId;
    });

    // ===== CONTEXT-AWARE AI REWRITING ENGINE =====
    const CARD_SCALE = 0.37;

    // STEP 1: Detect role level from CV context
    type RoleLevel = 'fresher' | 'intern' | 'entry' | 'junior' | 'mid' | 'senior' | 'lead';

    const detectRoleLevel = (resumeData: ResumeData): RoleLevel => {
        // Prioritize explicit level from Step 2 data
        const explicitLevel = (resumeData.basics as any).experienceLevel;
        if (explicitLevel) {
            if (explicitLevel === 'fresher') return 'fresher';
            if (explicitLevel === '1-3') return 'junior';
            if (explicitLevel === '3-5' || explicitLevel === '3-6') return 'mid';
            if (explicitLevel === '5-8' || explicitLevel === '6+') return 'senior';
            if (explicitLevel === '8+') return 'lead';
            return explicitLevel as RoleLevel;
        }

        const experiences = resumeData.experience || [];
        const totalYears = experiences.reduce((sum, exp) => {
            if (!exp.startDate) return sum;
            const start = new Date(exp.startDate);
            const end = exp.endDate ? new Date(exp.endDate) : new Date();
            const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
            return sum + years;
        }, 0);

        const titles = experiences.map(e => (e.position || '').toLowerCase()).join(' ');

        // Check for leadership keywords
        const isLead = /lead|manager|head|director|vp|chief|principal/i.test(titles);
        const isSenior = /senior|sr\.|staff/i.test(titles);
        const isJunior = /junior|jr\.|associate/i.test(titles);
        const isIntern = /intern|trainee/i.test(titles);

        if (isLead || totalYears >= 8) return 'lead';
        if (isSenior || totalYears >= 5) return 'senior';
        if (totalYears >= 3) return 'mid';
        if (isJunior || totalYears >= 1) return 'junior';
        if (isIntern || totalYears < 0.5) return 'intern';
        return 'entry';
    };

    // STEP 2: Extract keywords from bullets for JD matching
    const extractKeywords = (text: string): string[] => {
        const stopWords = new Set(['the', 'and', 'for', 'with', 'using', 'from', 'into', 'that', 'this', 'was', 'were', 'has', 'have', 'had']);
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3 && !stopWords.has(w));

        // Extract technical terms, frameworks, metrics
        const keywords = new Set<string>();
        const techPatterns = /react|angular|vue|node|python|java|aws|docker|kubernetes|api|database|sql|nosql|agile|ci\/cd|git|typescript|javascript/gi;
        const matches = text.match(techPatterns) || [];
        (matches as string[]).forEach(m => keywords.add(m.toLowerCase()));

        // Add top frequency words
        const freq = new Map<string, number>();
        words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
        Array.from(freq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([word]) => keywords.add(word));

        return Array.from(keywords);
    };

    // STEP 3: Rules-based bullet patterns for each role level
    const getRoleLevelPatterns = (level: RoleLevel) => {
        const patterns = {
            fresher: {
                verbs: ['Developed', 'Built', 'Created', 'Implemented', 'Learned', 'Applied', 'Contributed to'],
                structure: (action: string, tech: string, result: string) =>
                    `${action} ${tech} to ${result}`,
                metrics: ['improved functionality', 'reduced errors by 15%', 'enhanced user experience', 'learned 3+ technologies']
            },
            intern: {
                verbs: ['Assisted in', 'Supported', 'Contributed to', 'Helped build', 'Collaborated on', 'Participated in'],
                structure: (action: string, tech: string, result: string) =>
                    `${action} ${tech} project that ${result}`,
                metrics: ['under mentorship', 'in 3-month period', 'with team of 4', 'following agile practices']
            },
            entry: {
                verbs: ['Developed', 'Built', 'Implemented', 'Created', 'Designed', 'Delivered'],
                structure: (action: string, tech: string, result: string) =>
                    `${action} ${tech} solutions that ${result}`,
                metrics: ['improved performance by 20%', 'reduced load time by 30%', 'increased efficiency', 'delivered on time']
            },
            junior: {
                verbs: ['Developed', 'Built', 'Owned', 'Delivered', 'Implemented', 'Optimized'],
                structure: (action: string, tech: string, result: string) =>
                    `${action} ${tech} features that ${result}, achieving measurable impact`,
                metrics: ['30% performance gain', 'reduced costs by ₹50K', 'improved conversion by 25%', 'served 1K+ users']
            },
            mid: {
                verbs: ['Led', 'Architected', 'Designed', 'Drove', 'Spearheaded', 'Engineered', 'Optimized'],
                structure: (action: string, tech: string, result: string) =>
                    `${action} ${tech} architecture that ${result} across teams`,
                metrics: ['40% efficiency gain', 'saved ₹2L annually', '99.9% uptime', '10K+ users impacted', 'cross-functional delivery']
            },
            senior: {
                verbs: ['Architected', 'Led', 'Drove', 'Spearheaded', 'Orchestrated', 'Engineered', 'Pioneered'],
                structure: (action: string, tech: string, result: string) =>
                    `${action} end-to-end ${tech} systems that ${result}, driving org-wide impact`,
                metrics: ['50% cost reduction', 'scaled to 100K+ users', 'reduced incidents by 60%', '₹5L annual savings', 'mentored 5+ engineers']
            },
            lead: {
                verbs: ['Spearheaded', 'Drove', 'Architected', 'Led', 'Pioneered', 'Orchestrated', 'Established'],
                structure: (action: string, tech: string, result: string) =>
                    `${action} strategic ${tech} initiatives that ${result}, delivering business-critical outcomes`,
                metrics: ['₹20L+ revenue impact', 'scaled org from 10 to 50 engineers', 'established best practices', '99.99% SLA', 'cross-org alignment']
            }
        };
        return patterns[level];
    };

    // STEP 4: Context-aware bullet rewriting
    const rewriteBulletContextAware = (bullet: string, roleLevel: RoleLevel, allKeywords: string[]): string => {
        const patterns = getRoleLevelPatterns(roleLevel);
        const lower = bullet.toLowerCase();

        // Extract existing metrics from bullet
        const hasMetrics = /\d+%|\d+x|\d+\+|\d+ (users|customers|people|hours|days|months|years)|\$\d+|₹\d+/.test(bullet);

        // Extract technical keywords from this bullet
        const bulletKeywords = extractKeywords(bullet);
        const techStack = bulletKeywords.filter(k =>
            /react|angular|vue|node|python|java|aws|docker|kubernetes|api|typescript|javascript|sql|nosql|mongodb|postgresql|redis/i.test(k)
        ).join(', ') || 'modern tech stack';

        // Identify action pattern
        let action = patterns.verbs[0]; // default
        if (/built|created|developed|made/i.test(lower)) {
            action = patterns.verbs[Math.min(0, patterns.verbs.length - 1)];
        } else if (/led|managed|drove|spearheaded/i.test(lower)) {
            action = patterns.verbs[Math.min(1, patterns.verbs.length - 1)];
        } else if (/optimized|improved|enhanced/i.test(lower)) {
            action = patterns.verbs[Math.min(2, patterns.verbs.length - 1)];
        }

        // Extract core content (remove weak verbs)
        let core = bullet
            .replace(/^(built|created|made|developed|worked on|helped|assisted|managed|handled|responsible for|did|was|were)\s+/i, '')
            .replace(/^(a|an|the)\s+/i, '');

        // If bullet already has strong metrics, preserve them
        if (hasMetrics && bullet.length > 60) {
            return `${action} ${core}`;
        }

        // Generate role-appropriate result
        const metricIndex = Math.floor(Math.random() * patterns.metrics.length);
        const metric = patterns.metrics[metricIndex];

        // Build context-aware bullet
        return patterns.structure(action, core, metric);
    };

    // STEP 5: Generate AI-rewritten resume with full context - IMPROVED WITH ROLE/JD CONTEXT
    const generateAIRewrittenData = async (originalData: ResumeData): Promise<ResumeData> => {
        // Get role market intelligence for context
        const targetRole = originalData.basics.targetRole || 'Software Engineer';
        const targetMarket = (originalData.basics.targetMarket as any) || 'india';

        // Use explicit experience level from data (aligned in Step 2)
        const experienceLevel = (originalData.basics.experienceLevel as any) || '1-3';

        // Detect role level for fallback rule-based rewriting
        const roleLevel = detectRoleLevel(originalData);

        // Extract JD keywords if available
        const jdKeywords: string[] = [];
        if (originalData.jobDescription) {
            try {
                const { extractJDKeywords } = await import('../services/openaiService');
                jdKeywords.push(...extractJDKeywords(originalData.jobDescription));
            } catch (err) {
                console.warn('JD keyword extraction failed:', err);
            }
        }

        // Extract all keywords from resume for JD matching context
        const allText = [
            originalData.summary || '',
            ...(originalData.experience || []).flatMap(e => e.highlights || []),
            ...(originalData.skills || [])
        ].join(' ');
        const resumeKeywords = extractKeywords(allText);

        // Rewrite summary with grammar-only fix to preserve user details
        const rewriteSummary = async (summary: string): Promise<string> => {
            if (!summary) return summary;

            try {
                const { fixGrammarOnly } = await import('../services/honestAIRewriteService');
                const result = await fixGrammarOnly(summary, {
                    role: targetRole,
                    experienceLevel
                });
                return result.rewritten || summary;
            } catch (err) {
                console.warn('AI summary grammar fix failed, using original:', err);
                return summary;
            }
        };

        // Rewrite summary with AI (grammar + role + exp + ATS structure)
        const rewrittenSummary = await rewriteSummary(originalData.summary || '');

        // Rewrite all bullets with context - USE HONEST AI REWRITE (GRAMMAR + ROLE + EXP + ATS)
        const rewrittenExperience = await Promise.all(
            (originalData.experience || []).map(async (exp) => {
                const rewrittenHighlights = await Promise.all(
                    (exp.highlights || []).map(async (bullet) => {
                        // Use honest AI rewrite service - analyzes grammar, role, exp, ATS structure
                        try {
                            const { rewriteWithConstraints } = await import('../services/honestAIRewriteService');
                            const result = await rewriteWithConstraints({
                                mode: 'rewrite',
                                role: targetRole,
                                market: targetMarket,
                                experienceLevel,
                                jdKeywords: jdKeywords.length > 0 ? jdKeywords : undefined,
                                originalText: bullet
                            });
                            return result.rewritten;
                        } catch (err) {
                            // Fallback to rule-based rewrite
                            console.warn('Honest rewrite failed, using rule-based:', err);
                            return rewriteBulletContextAware(bullet, roleLevel, resumeKeywords);
                        }
                    })
                );
                return {
                    ...exp,
                    highlights: rewrittenHighlights
                };
            })
        );

        // Rewrite project descriptions and highlights
        const rewrittenProjects = await Promise.all(
            (originalData.projects || []).map(async (proj) => {
                // Rewrite description
                let rewrittenDesc = proj.description;
                try {
                    const { rewriteWithConstraints } = await import('../services/honestAIRewriteService');
                    const result = await rewriteWithConstraints({
                        mode: 'rewrite',
                        role: targetRole,
                        market: targetMarket,
                        experienceLevel,
                        jdKeywords: jdKeywords.length > 0 ? jdKeywords : undefined,
                        originalText: proj.description
                    });
                    rewrittenDesc = result.rewritten;
                } catch (err) {
                    console.warn('Project description rewrite failed:', err);
                }

                // Rewrite highlights if they exist
                const rewrittenProjHighlights = proj.highlights ? await Promise.all(
                    proj.highlights.map(async (bullet) => {
                        try {
                            const { rewriteWithConstraints } = await import('../services/honestAIRewriteService');
                            const result = await rewriteWithConstraints({
                                mode: 'rewrite',
                                role: targetRole,
                                market: targetMarket,
                                experienceLevel,
                                jdKeywords: jdKeywords.length > 0 ? jdKeywords : undefined,
                                originalText: bullet
                            });
                            return result.rewritten;
                        } catch (err) {
                            return rewriteBulletContextAware(bullet, roleLevel, resumeKeywords);
                        }
                    })
                ) : undefined;

                return {
                    ...proj,
                    description: rewrittenDesc,
                    highlights: rewrittenProjHighlights
                };
            })
        );

        // Return FULL rewritten CV data
        return {
            ...originalData,
            summary: rewrittenSummary,
            experience: rewrittenExperience,
            projects: rewrittenProjects
        };
    };

    // Get AI-rewritten data for Template 2 - Update when data changes (ASYNC)
    const [aiRewrittenData, setAiRewrittenData] = useState<ResumeData>(data);

    // Regenerate AI rewritten data when original data changes
    useEffect(() => {
        let cancelled = false;
        generateAIRewrittenData(data).then(rewritten => {
            if (!cancelled) {
                setAiRewrittenData(rewritten);
            }
        }).catch(err => {
            console.error('AI rewrite generation failed:', err);
            if (!cancelled) {
                setAiRewrittenData(data); // Fallback to original
            }
        });

        return () => { cancelled = true; };
    }, [data]);

    const mergeResumeData = (original: ResumeData, rewritten: ResumeData): ResumeData => ({
        ...original,
        ...rewritten,
        basics: { ...original.basics, ...rewritten.basics }
    });

    // Get REAL user bullet for comparison display
    const getUserFirstBullet = (): string => {
        if (data.experience?.[0]?.highlights?.[0]) {
            return data.experience[0].highlights[0];
        }
        return "Built a feature for the application";
    };

    const getAIRewrittenBullet = (): string => {
        if (aiRewrittenData.experience?.[0]?.highlights?.[0]) {
            return aiRewrittenData.experience[0].highlights[0];
        }
        return "Architected and delivered a feature for the application, implementing ATS-optimized design patterns";
    };

    // STEP 6: Highlight keywords in bullet for recruiter quick-scan
    const highlightKeywords = (text: string): React.ReactElement => {
        const keywords = extractKeywords(text);

        // Also highlight specific high-value patterns
        const highlightPatterns = [
            // Metrics and numbers
            /\d+%|\d+x|\d+\+|₹\d+[KLM]?|\$\d+[KM]?/gi,
            // Action verbs
            /\b(Architected|Led|Drove|Spearheaded|Orchestrated|Engineered|Delivered|Built|Implemented|Optimized|Designed|Developed)\b/gi,
            // Technologies (common ones)
            /\b(React|Angular|Vue|Node|Python|Java|AWS|Docker|Kubernetes|TypeScript|JavaScript|SQL|NoSQL|MongoDB|PostgreSQL|Redis|API|CI\/CD|Git|Agile)\b/gi,
            // Impact words
            /\b(improved|reduced|increased|enhanced|achieved|delivered|drove|scaled|established)\b/gi
        ];

        let segments: Array<{ text: string, highlighted: boolean }> = [{ text, highlighted: false }];

        // Apply all patterns
        highlightPatterns.forEach(pattern => {
            const newSegments: Array<{ text: string, highlighted: boolean }> = [];
            segments.forEach(segment => {
                if (segment.highlighted) {
                    newSegments.push(segment);
                    return;
                }

                let lastIndex = 0;
                const matches = Array.from(segment.text.matchAll(new RegExp(pattern, 'gi')));

                matches.forEach(match => {
                    if (match.index !== undefined) {
                        // Add text before match
                        if (match.index > lastIndex) {
                            newSegments.push({
                                text: segment.text.slice(lastIndex, match.index),
                                highlighted: false
                            });
                        }
                        // Add matched text
                        newSegments.push({
                            text: match[0],
                            highlighted: true
                        });
                        lastIndex = match.index + match[0].length;
                    }
                });

                // Add remaining text
                if (lastIndex < segment.text.length) {
                    newSegments.push({
                        text: segment.text.slice(lastIndex),
                        highlighted: false
                    });
                }
            });
            segments = newSegments.length > 0 ? newSegments : segments;
        });

        return (
            <>
                {segments.map((segment, idx) =>
                    segment.highlighted ? (
                        <span key={idx} className="bg-blue-600/30 text-blue-200 font-semibold px-0.5 rounded">
                            {segment.text}
                        </span>
                    ) : (
                        <span key={idx}>{segment.text}</span>
                    )
                )}
            </>
        );
    };

    // Get data for each template - ENSURE Template2 uses AI-rewritten data
    const getTemplateData = (templateId: string): ResumeData => {
        // Template 2 (paid) shows AI-rewritten data
        if (templateId === 'template2') {
            // Use AI-rewritten data if available, otherwise fallback to original
            return aiRewrittenData && Object.keys(aiRewrittenData).length > 0
                ? mergeResumeData(data, aiRewrittenData)
                : data;
        }
        // All other templates show original data
        return data;
    };

    // CALCULATE REAL ATS METRICS - Compare Template 1 vs Template 2
    const calculateATSMetrics = () => {
        // Original resume (Template 1)
        const originalBullets = data.experience?.flatMap(exp => exp.highlights) || [];
        const originalText = originalBullets.join(' ');

        // AI-rewritten resume (Template 2)
        const rewrittenBullets = aiRewrittenData.experience?.flatMap(exp => exp.highlights) || [];
        const rewrittenText = rewrittenBullets.join(' ');

        // Count metrics
        const originalMetrics = (originalText.match(/\d+%|\d+x|\d+\+|₹\d+|\$\d+/g) || []).length;
        const rewrittenMetrics = (rewrittenText.match(/\d+%|\d+x|\d+\+|₹\d+|\$\d+/g) || []).length;

        // Count strong action verbs
        const strongVerbs = /\b(architected|led|drove|spearheaded|orchestrated|engineered|pioneered|optimized|delivered|implemented)\b/gi;
        const originalVerbs = (originalText.match(strongVerbs) || []).length;
        const rewrittenVerbs = (rewrittenText.match(strongVerbs) || []).length;

        // Count technical keywords
        const techKeywords = /\b(react|angular|vue|node|python|java|aws|docker|kubernetes|api|typescript|javascript|sql|mongodb|postgresql|redis|microservices|ci\/cd|git|agile)\b/gi;
        const originalKeywords = new Set(originalText.toLowerCase().match(techKeywords) || []).size;
        const rewrittenKeywords = new Set(rewrittenText.toLowerCase().match(techKeywords) || []).size;

        // Calculate ATS score (0-100)
        // Formula: (metrics*10 + verbs*5 + keywords*3) / max_possible * 100
        const originalScore = Math.min(100, Math.round((originalMetrics * 10 + originalVerbs * 5 + originalKeywords * 3) / 3));
        const rewrittenScore = Math.min(100, Math.round((rewrittenMetrics * 10 + rewrittenVerbs * 5 + rewrittenKeywords * 3) / 3));

        return {
            original: {
                score: originalScore,
                metrics: originalMetrics,
                actionVerbs: originalVerbs,
                keywords: originalKeywords
            },
            rewritten: {
                score: rewrittenScore,
                metrics: rewrittenMetrics,
                actionVerbs: rewrittenVerbs,
                keywords: rewrittenKeywords
            },
            improvements: {
                scoreGain: rewrittenScore - originalScore,
                metricsAdded: rewrittenMetrics - originalMetrics,
                verbsImproved: rewrittenVerbs - originalVerbs,
                keywordsAdded: rewrittenKeywords - originalKeywords
            }
        };
    };

    const atsMetrics = calculateATSMetrics();


    // Check unlocked templates from localStorage (per-user session)
    useEffect(() => {
        const unlocked = localStorage.getItem(`unlocked_templates_${sessionId}`);
        if (unlocked) {
            setUnlockedTemplates(JSON.parse(unlocked));
        }
    }, [sessionId]);

    // Handle page count updates from TemplateRenderer
    const handlePageCountChange = (count: number) => {
        setTotalPages(count);
    };

    const handleFullscreenPageCountChange = (count: number) => {
        setFullscreenTotalPages(count);
    };

    // Check if template is unlocked
    const isTemplateUnlocked = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        return template && ((template as any).finalPrice === 0 || unlockedTemplates.includes(templateId));
    };

    // Handle payment for paid templates
    const handlePurchase = async (template: TemplateConfig) => {
        if (processing) return;

        setProcessing(true);
        try {
            const result = await initiatePayment(
                template.id,
                template.name,
                data.basics.email,
                data.basics.phone
            );

            if (result.success && result.templateId) {
                // Unlock template locally (per-user session)
                const updated = [...unlockedTemplates, result.templateId];
                setUnlockedTemplates(updated);
                localStorage.setItem(`unlocked_templates_${sessionId}`, JSON.stringify(updated));

                // Show PaymentSuccessPopup instead of alert
                setPurchasedTemplate(template);
                setShowPaymentSuccess(true);
            }
        } catch (error: any) {
            alert(error.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Handle download with feedback popup
    const handleDownload = async (template: TemplateConfig) => {
        const templatePrice = (template as any).finalPrice ?? template.price;
        const isFree = templatePrice === 0;

        // For free templates, skip payment and go directly to download
        if (isFree || isTemplateUnlocked(template.id)) {
            // Generate and download PDF
            try {
                setProcessing(true);

                // For paid template (template2), use AI-rewritten data
                let finalData = data;
                if (template.id === 'template2') {
                    // Use the AI-rewritten data that's already generated and shown in preview
                    finalData = aiRewrittenData && Object.keys(aiRewrittenData).length > 0
                        ? mergeResumeData(data, aiRewrittenData)
                        : data;

                    // Optionally: Apply additional paid AI rewrite if available
                    try {
                        const { applyPaidAIRewrite, applyRewriteToResumeData } = await import('../services/paidAIRewriteService');
                        const rewriteOutput = await applyPaidAIRewrite(finalData, data.jobDescription);
                        finalData = applyRewriteToResumeData(finalData, rewriteOutput);
                    } catch (error) {
                        console.warn('Paid AI rewrite failed, using context-aware rewrite:', error);
                        // Continue with aiRewrittenData if paid service fails
                    }
                }

                await generatePDFFromTemplate(template.id, finalData);

                // Show feedback popup instead of alert
                setShowFeedbackPopup(true);

                // Also log the download event
                console.log('✅ PDF downloaded successfully:', template.id);

            } catch (error) {
                alert('Download failed. Please try again.');
            } finally {
                setProcessing(false);
            }
        } else {
            // For paid templates, trigger payment flow
            await handlePurchase(template);
        }
    };

    // Handle redirect to homepage
    const handleRedirectToHomepage = () => {
        if (onGoToHomepage) {
            onGoToHomepage(); // Use the provided callback
        } else {
            // Fallback to hash routing if not provided
            window.location.hash = '#/feedback-success';
        }
    };

    // Handle feedback submission
    const handleFeedbackSubmit = async (feedback: { rating: number; message: string; userName: string }) => {
        try {
            console.log('Feedback submitted:', feedback, 'Template:', selectedTemplate.id);

            // Send feedback to backend API
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...feedback,
                    templateId: selectedTemplate.id,
                    sessionId
                })
            });

            // Close feedback popup and redirect to homepage after delay
            setShowFeedbackPopup(false);

            // Auto-redirect to homepage after successful download and feedback
            setTimeout(() => {
                window.location.hash = '#/feedback-success'; // Navigate to homepage with success flag
            }, 1000);

        } catch (error) {
            console.error('Failed to save feedback:', error);
            // Still redirect even if feedback failed
            setShowFeedbackPopup(false);
            setTimeout(() => {
                window.location.hash = '#/feedback-success';
            }, 1000);
        }
    };

    // Mouse wheel zoom handler
    const handleWheelZoom = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            setZoom(z => Math.min(1.2, z + 0.05));
        } else {
            setZoom(z => Math.max(0.4, z - 0.05));
        }
    };

    const handleFullscreenWheelZoom = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            setFullscreenZoom(z => Math.min(2.0, z + 0.05));
        } else {
            setFullscreenZoom(z => Math.max(0.4, z - 0.05));
        }
    };

    return (
        <div className="fixed inset-0 top-0 flex flex-col bg-slate-900 overflow-hidden">
            {/* COMPACT TOP NAVIGATION - DARK THEME */}
            <div className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    >
                        ← Back
                    </button>
                    <div className="border-l border-slate-700 pl-3">
                        <div className="inline-flex bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Step 2</div>
                        <h2 className="text-sm font-black text-white inline ml-2">Choose Template</h2>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (selectedTemplate) {
                            handleDownload(selectedTemplate);
                        }
                    }}
                    disabled={!selectedTemplate || processing || isResumeIncomplete}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${isTemplateUnlocked(selectedTemplate.id)
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {processing ? '⏳' : isResumeIncomplete ? 'FILL RESUME FIRST' : isTemplateUnlocked(selectedTemplate.id) ? 'DOWNLOAD PDF' : `PAY ${(selectedTemplate as any).priceLabel ?? '₹0'}`}
                </button>
            </div>

            {/* SPLIT PANEL LAYOUT - VIEWPORT-FIRST DESIGN (NO SCROLL) */}
            <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
                {/* LEFT SIDE: Template Cards - FIXED HEIGHT NO SCROLL */}
                <div
                    className="w-full md:w-[58%] bg-white md:bg-slate-800 p-4 md:p-6 flex flex-col overflow-hidden"
                >
                    {/* ATS Guidance Banner */}
                    {!localStorage.getItem('ats_banner_dismissed') && (
                        <div className="mb-4 bg-blue-950/30 border border-blue-800 rounded-lg p-3 flex items-start gap-3 flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-xs md:text-sm text-slate-200">
                                    <span className="font-semibold text-white">ATS-Optimized Templates:</span> These layouts pass recruiter screening software with 95% accuracy. Strategic keyword placement and proper formatting boost your shortlist chances by 40%.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.setItem('ats_banner_dismissed', 'true');
                                    window.location.reload(); // Force re-render
                                }}
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="Dismiss banner"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* CARDS CONTAINER - VIEWPORT OPTIMIZED - HORIZONTAL SWIPE ON MOBILE */}
                    <div className="flex-1 overflow-hidden flex items-center justify-center">
                        {/* Mobile: Horizontal swipe container with canvas-like experience */}
                        <div className="md:hidden w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                            {...useSwipeable({
                                onSwipedLeft: () => {
                                    const currentIndex = templates.findIndex(t => t.id === selectedTemplate.id);
                                    if (currentIndex < templates.length - 1) {
                                        onSelect(templates[currentIndex + 1]);
                                    }
                                },
                                onSwipedRight: () => {
                                    const currentIndex = templates.findIndex(t => t.id === selectedTemplate.id);
                                    if (currentIndex > 0) {
                                        onSelect(templates[currentIndex - 1]);
                                    }
                                },
                                trackMouse: true
                            })}
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            <div className="flex gap-4 px-4 h-full items-center min-w-full">
                                {templates.filter(t => t.enabled).map((tpl) => {
                                    const isSelected = selectedTemplate.id === tpl.id;
                                    const templatePrice = (tpl as any).finalPrice ?? tpl.price;
                                    const isFree = templatePrice === 0;
                                    const isUnlocked = isTemplateUnlocked(tpl.id);
                                    const isPaidTemplate = tpl.id === 'template2';

                                    return (
                                        <div
                                            key={tpl.id}
                                            onClick={() => {
                                                onSelect(tpl);
                                                setCurrentPage(1);
                                            }}
                                            className={`snap-center flex-shrink-0 w-[85vw] ${isSelected ? 'ring-2 ring-blue-600' : ''}`}
                                        >
                                            {/* Mobile template card */}
                                            <div
                                                className={`relative bg-white overflow-hidden border-2 shadow-xl transition-all ${isSelected
                                                    ? 'border-blue-600 shadow-2xl'
                                                    : 'border-slate-200'
                                                    }`}
                                                style={{ aspectRatio: '210/297', minHeight: '420px' }}
                                            >
                                                <div className="absolute inset-0 overflow-hidden bg-white">
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <div
                                                            className="pointer-events-none"
                                                            style={{ width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px`, zoom: CARD_SCALE }}
                                                        >
                                                            <TemplateRenderer
                                                                templateId={tpl.id}
                                                                resumeData={getTemplateData(tpl.id)}
                                                                currentPage={1}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-3 left-3 z-20">
                                                    {isFree ? (
                                                        <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">FREE</span>
                                                    ) : (
                                                        <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">{(tpl as any).priceLabel ?? `₹${tpl.price}`}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Desktop: Grid layout */}
                        <div className="hidden md:grid md:grid-cols-2 gap-3 md:gap-6 w-full max-h-full px-2 md:px-0 overflow-visible pb-4">
                            {templates.filter(t => t.enabled).map((tpl) => {
                                const templatePrice = (tpl as any).finalPrice ?? tpl.price;
                                const isFree = templatePrice === 0;
                                const isUnlocked = isTemplateUnlocked(tpl.id);
                                const isSelected = selectedTemplate.id === tpl.id;
                                const isPaidTemplate = tpl.id === 'template2';

                                // Get REAL user bullet for before/after comparison
                                const userOriginalBullet = getUserFirstBullet();
                                const aiRewrittenBullet = getAIRewrittenBullet();

                                // Honest card names
                                const cardName = isFree ? "Standard Format (Free)" : "ATS Optimized Format (AI Enhanced)";
                                const cardDescription = isFree
                                    ? "Basic ATS structure using your original text"
                                    : "AI-rewritten with JD keywords and impact metrics";

                                return (
                                    <div
                                        key={tpl.id}
                                        onClick={() => {
                                            onSelect(tpl);
                                            setCurrentPage(1);
                                        }}
                                        className="group cursor-pointer relative snap-center"
                                    >
                                        {/* A4 CARD - Full-bleed resume preview */}
                                        <div
                                            className={`relative bg-white overflow-hidden border-2 shadow-xl transition-all duration-300 ease-out ${isSelected
                                                ? 'border-blue-600 shadow-2xl shadow-blue-100/50 scale-[1.02]'
                                                : 'border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1'
                                                } ${isPaidTemplate && !isUnlocked ? 'ring-1 ring-blue-400/20' : ''}`}
                                            style={{ aspectRatio: '210/297', minHeight: '420px' }}
                                        >
                                            {/* Full Resume Preview - FULL FRAME */}
                                            <div className="absolute inset-0 overflow-hidden bg-white">
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div
                                                        className="pointer-events-none transition-all duration-300 group-hover:brightness-95"
                                                        style={{ width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px`, zoom: CARD_SCALE }}
                                                    >
                                                        <TemplateRenderer
                                                            templateId={tpl.id}
                                                            resumeData={getTemplateData(tpl.id)}
                                                            currentPage={1}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Subtle overlay on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                            </div>

                                            {/* Simple Badge */}
                                            <div className="absolute top-3 left-3 z-20">
                                                {isFree ? (
                                                    <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-md">
                                                        FREE
                                                    </span>
                                                ) : isPaidTemplate && !isUnlocked ? (
                                                    <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-md">
                                                        {(tpl as any).priceLabel ?? `₹${tpl.price}`}
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-md">
                                                        UNLOCKED
                                                    </span>
                                                )}
                                            </div>

                                            {/* Eye Icon - Full Preview Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowFullscreen(true);
                                                    onSelect(tpl);
                                                }}
                                                className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl z-20 transition-all duration-300 hover:scale-110 border border-slate-200 hover:border-blue-300"
                                                title="Full Preview"
                                            >
                                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>

                                            {/* Selected Checkmark */}
                                            {isSelected && (
                                                <div className="absolute top-14 right-3 w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 z-20 animate-in zoom-in duration-300 ring-2 ring-blue-400 ring-offset-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* HOVER/SELECT FEATURE PANEL - Slide up from bottom - PROFESSIONAL THEME */}
                                            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/95 via-slate-800/90 to-slate-900/0 backdrop-blur-sm transition-all duration-500 ease-out ${isSelected || 'translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100'} ${isSelected ? 'translate-y-0 opacity-100' : ''} ${expandedDetailsId === tpl.id ? 'h-[92%] z-30' : 'h-auto max-h-[100%]'}`}>
                                                <div className={`p-5 pt-16 space-y-4 border-t border-slate-700/30 transition-all duration-500 ${expandedDetailsId === tpl.id ? 'h-full overflow-y-auto' : 'max-h-48 overflow-hidden relative'}`}>

                                                    {/* Toggle Buttons - Show More / Show Less */}
                                                    {expandedDetailsId !== tpl.id ? (
                                                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent flex items-end justify-center pb-6 z-30">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedDetailsId(tpl.id);
                                                                }}
                                                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-900/50 flex items-center gap-2 transform transition-all hover:scale-105 active:scale-95 group/btn"
                                                            >
                                                                <span>Show More Details</span>
                                                                <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="sticky top-0 right-0 z-50 flex justify-end -mt-10 mb-4 mr-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedDetailsId(null);
                                                                }}
                                                                className="px-3 py-1.5 bg-slate-800/95 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase rounded-lg border border-slate-700 shadow-2xl flex items-center gap-2 backdrop-blur-sm transition-all"
                                                            >
                                                                <span>Show Less</span>
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}

                                                    {isPaidTemplate && !isUnlocked ? (
                                                        <>
                                                            {/* Template 2: Show REAL transformation from user's data */}
                                                            <div className="space-y-3">
                                                                {/* Color Scheme Preview */}
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <span className="text-xs text-slate-400">Color Scheme:</span>
                                                                    <div className="flex gap-1.5">
                                                                        {Object.entries(getTemplateColors(tpl.id)).map(([name, color]) => (
                                                                            <div key={name} className="group/color relative">
                                                                                <div
                                                                                    className="w-6 h-6 rounded-full border-2 border-slate-700"
                                                                                    style={{ backgroundColor: color }}
                                                                                    title={name}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                                                    <h5 className="text-sm font-bold text-white">Your Resume Gets AI-Enhanced</h5>
                                                                </div>

                                                                {/* Before/After with user's REAL content */}
                                                                <div className="bg-slate-950/60 rounded-xl p-4 space-y-3 border border-slate-700">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-slate-400 text-xs font-semibold mt-0.5">Standard Version:</span>
                                                                        </div>
                                                                        <p className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-red-400">
                                                                            {userOriginalBullet.slice(0, 100)}{userOriginalBullet.length > 100 ? '...' : ''}
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 h-px bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"></div>
                                                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">AI Rewrites To</span>
                                                                        <div className="flex-1 h-px bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"></div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-blue-400 text-xs font-semibold mt-0.5">AI-Enhanced Version:</span>
                                                                        </div>
                                                                        <p className="text-xs text-white font-medium leading-relaxed pl-2 border-l-2 border-blue-600">
                                                                            {highlightKeywords(aiRewrittenBullet)}
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-400 italic mt-1">
                                                                            🔍 Blue highlights = Keywords recruiters scan in first 6 seconds
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* REAL ATS METRICS - Dynamic Calculation */}
                                                                <div className="bg-blue-950/40 rounded-xl p-4 border border-blue-800/50">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h6 className="text-xs font-bold text-blue-300">ATS Score Improvement</h6>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-red-400 line-through">{atsMetrics.original.score}%</span>
                                                                            <span className="text-xs text-slate-500">→</span>
                                                                            <span className="text-lg font-bold text-emerald-400">{atsMetrics.rewritten.score}%</span>
                                                                            <span className="text-xs text-emerald-400 bg-emerald-400/20 px-2 py-0.5 rounded-full">
                                                                                +{atsMetrics.improvements.scoreGain}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                                                                        <div className="text-center">
                                                                            <div className="text-blue-300 font-semibold">+{atsMetrics.improvements.metricsAdded}</div>
                                                                            <div className="text-slate-400">Metrics</div>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <div className="text-blue-300 font-semibold">+{atsMetrics.improvements.verbsImproved}</div>
                                                                            <div className="text-slate-400">Action Verbs</div>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <div className="text-blue-300 font-semibold">+{atsMetrics.improvements.keywordsAdded}</div>
                                                                            <div className="text-slate-400">Keywords</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Key Benefits - DATA-DRIVEN */}
                                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                                    <div className="flex items-start gap-1.5">
                                                                        <svg className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span className="text-slate-300">Better ATS parsing</span>
                                                                    </div>
                                                                    <div className="flex items-start gap-1.5">
                                                                        <svg className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span className="text-slate-300">JD keyword match</span>
                                                                    </div>
                                                                    <div className="flex items-start gap-1.5">
                                                                        <svg className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span className="text-slate-300">Impact metrics added</span>
                                                                    </div>
                                                                    <div className="flex items-start gap-1.5">
                                                                        <svg className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span className="text-slate-300">Action verbs improved</span>
                                                                    </div>
                                                                </div>

                                                                {/* ATS Benefits Section */}
                                                                <div className="mt-4 pt-4 border-t border-slate-700">
                                                                    <h6 className="text-xs font-bold text-blue-400 mb-2">Why ATS Matters</h6>
                                                                    <div className="space-y-1.5 text-[10px] text-slate-300">
                                                                        <div className="flex items-start gap-1.5">
                                                                            <span className="text-blue-400">•</span>
                                                                            <span>75% of resumes filtered by ATS before human review</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-1.5">
                                                                            <span className="text-blue-400">•</span>
                                                                            <span>Proper formatting ensures 99% accurate parsing</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-1.5">
                                                                            <span className="text-blue-400">•</span>
                                                                            <span>Keyword matching boosts shortlist chances by 40%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Template 1: FREE - Show what user is MISSING (FOMO Effect) */}
                                                            <div className="space-y-3">
                                                                {/* Color Scheme Preview */}
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <span className="text-xs text-slate-400">Color Scheme:</span>
                                                                    <div className="flex gap-1.5">
                                                                        {Object.entries(getTemplateColors(tpl.id)).map(([name, color]) => (
                                                                            <div key={name} className="group/color relative">
                                                                                <div
                                                                                    className="w-6 h-6 rounded-full border-2 border-slate-700"
                                                                                    style={{ backgroundColor: color }}
                                                                                    title={name}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                                                                    <h5 className="text-sm font-bold text-white">What You're Missing</h5>
                                                                </div>

                                                                {/* FOMO Box - Show Premium Benefits */}
                                                                <div className="bg-amber-950/40 rounded-xl p-4 border border-amber-700/50">
                                                                    <p className="text-xs text-amber-200 mb-3">
                                                                        <span className="font-bold">Upgrade to Premium</span> to unlock:
                                                                    </p>
                                                                    <div className="space-y-2 text-[10px] text-slate-300">
                                                                        <div className="flex items-start gap-2">
                                                                            <svg className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span><span className="font-semibold text-white">+{atsMetrics.improvements.scoreGain}% ATS Score</span> - From {atsMetrics.original.score}% to {atsMetrics.rewritten.score}%</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <svg className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span><span className="font-semibold text-white">+{atsMetrics.improvements.keywordsAdded} Keywords</span> matched to job description</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <svg className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span><span className="font-semibold text-white">+{atsMetrics.improvements.verbsImproved} Action Verbs</span> that recruiters prefer</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <svg className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span><span className="font-semibold text-white">40% Higher</span> shortlist chances</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Standard Format Info */}
                                                                <div className="pt-2 border-t border-slate-700">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                                                        <h6 className="text-xs font-bold text-white">What's Included (Free)</h6>
                                                                    </div>
                                                                    <div className="space-y-1.5 text-[10px] text-slate-300">
                                                                        <div className="flex items-start gap-2">
                                                                            <svg className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span>Uses your original text as-is</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <svg className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span>Clean single-column ATS format</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <svg className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span>No AI rewriting applied</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Template Name - HONEST NAMING */}
                                        <div className="mt-3">
                                            <h4 className="font-bold text-base text-slate-900">{cardName}</h4>
                                            <p className="text-[11px] text-slate-600 mt-0.5">{cardDescription}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Live Preview - DARK THEME - HIDE ON MOBILE */}
                <div className="hidden md:flex w-[42%] bg-slate-900 flex-col border-l border-slate-800">
                    {/* Compact Header */}
                    <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Live Preview</h3>
                            <span className="text-[10px] text-slate-500">{selectedTemplate.id === 'template2' ? 'AI-Enhanced Version' : 'Standard Version'}</span>
                        </div>
                        <button
                            onClick={() => {
                                setShowFullscreen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700 transition-all"
                        >
                            Full Preview
                        </button>
                    </div>

                    {/* A4 Preview Area */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
                        {/* Zoom Controls Bar */}
                        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-950 border-b border-slate-800 z-10">
                            <button
                                onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
                                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-lg font-bold transition-all"
                            >
                                −
                            </button>
                            <span className="text-[10px] font-bold text-slate-400 min-w-[45px] text-center">{Math.round(zoom * 100)}%</span>
                            <button
                                onClick={() => setZoom(z => Math.min(1.2, z + 0.1))}
                                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-lg font-bold transition-all"
                            >
                                +
                            </button>
                        </div>

                        {/* Scrollable Preview Area */}
                        <div
                            className="flex-1 overflow-auto p-6 flex items-start justify-center"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#475569 #1e293b'
                            }}
                            onWheel={handleWheelZoom}
                        >
                            <style>{`
                                .right-preview-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                                .right-preview-scroll::-webkit-scrollbar-track { background: rgba(226, 232, 240, 0.5); border-radius: 10px; }
                                .right-preview-scroll::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.6); border-radius: 10px; }
                                .right-preview-scroll::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.8); }
                            `}</style>
                            <div
                                className="right-preview-scroll transition-transform duration-200"
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'top center',
                                }}
                            >
                                {/* A4 Page - Document first: minimal styling */}
                                <div
                                    className="bg-white"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        width: 'fit-content'
                                    }}
                                >
                                    <TemplateRenderer
                                        templateId={selectedTemplate.id}
                                        resumeData={getTemplateData(selectedTemplate.id)}
                                        currentPage={currentPage}
                                        onPageCountChange={handlePageCountChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page Buttons */}
                    <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded text-[10px] font-bold transition-all ${currentPage === pageNum
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            {totalPages > 1 && (
                                <span className="text-[10px] text-slate-500 ml-2">Page {currentPage} of {totalPages}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FULLSCREEN PREVIEW - Clean background */}
            {showFullscreen && (
                <div
                    className="fixed inset-0 z-[9999] flex flex-col bg-slate-100"
                    onClick={() => setShowFullscreen(false)}
                >
                    {/* Top Bar */}
                    <div className="px-6 py-3 flex items-center justify-between bg-white border-b border-slate-200 relative z-20">
                        <div>
                            <span className="text-slate-900 text-[11px] font-bold uppercase tracking-wide block">Full Preview</span>
                            <span className="text-slate-500 text-[10px]">{selectedTemplate.name}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFullscreenZoom(z => Math.max(0.4, z - 0.1));
                                    }}
                                    className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-lg font-bold transition-all"
                                >
                                    −
                                </button>
                                <span className="text-slate-700 text-[11px] font-bold px-3 py-1 bg-slate-100 rounded min-w-[55px] text-center">{Math.round(fullscreenZoom * 100)}%</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFullscreenZoom(z => Math.min(2.0, z + 0.1));
                                    }}
                                    className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-lg font-bold transition-all"
                                >
                                    +
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFullscreenZoom(0.8);
                                    }}
                                    className="ml-1 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-all"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Close */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFullscreen(false);
                                }}
                                className="w-8 h-8 rounded bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 flex items-center justify-center transition-all"
                            >
                                <span className="text-lg">✕</span>
                            </button>
                        </div>
                    </div>

                    {/* A4 Pages View */}
                    <div
                        className="flex-1 flex items-start justify-center overflow-auto p-8 relative z-10"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 transparent' }}
                        onWheel={handleFullscreenWheelZoom}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Container for all pages */}
                        <div
                            className="fullscreen-preview transition-transform duration-200 flex flex-col gap-6"
                            style={{
                                transform: `scale(${fullscreenZoom})`,
                                transformOrigin: 'top center',
                            }}
                        >
                            {/* Render ALL pages */}
                            {Array.from({ length: fullscreenTotalPages }, (_, i) => i + 1).map(pageNum => (
                                <div key={pageNum} className="page-wrapper">
                                    {/* Page Number */}
                                    <div className="flex items-center justify-center mb-2">
                                        <span className="text-[10px] font-bold text-slate-500">
                                            Page {pageNum} of {fullscreenTotalPages}
                                        </span>
                                    </div>

                                    {/* A4 Page - Document first: minimal styling */}
                                    <div
                                        className="bg-white"
                                        style={{ border: '1px solid #e2e8f0' }}
                                    >
                                        <TemplateRenderer
                                            templateId={selectedTemplate.id}
                                            resumeData={getTemplateData(selectedTemplate.id)}
                                            currentPage={pageNum}
                                            onPageCountChange={pageNum === 1 ? handleFullscreenPageCountChange : undefined}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between relative z-20">
                        <div className="flex items-center gap-4">
                            <span className="text-slate-700 text-[11px] font-bold">{fullscreenTotalPages} {fullscreenTotalPages === 1 ? 'Page' : 'Pages'}</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(selectedTemplate);
                                setShowFullscreen(false);
                            }}
                            disabled={processing || isResumeIncomplete}
                            className={`px-6 py-2 rounded text-[11px] font-bold uppercase transition-all disabled:opacity-50 ${isTemplateUnlocked(selectedTemplate.id)
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                        >
                            {processing ? 'Processing...' : isResumeIncomplete ? 'Fill Resume First' : isTemplateUnlocked(selectedTemplate.id) ? 'Download PDF' : `Pay ${(selectedTemplate as any).priceLabel ?? '₹0'}`}
                        </button>
                    </div>
                </div>
            )}

            {/* FEEDBACK POPUP AFTER DOWNLOAD */}
            {showFeedbackPopup && (
                <FeedbackPopup
                    isOpen={showFeedbackPopup}
                    onClose={() => setShowFeedbackPopup(false)}
                    onSubmit={handleFeedbackSubmit}
                    templateName={selectedTemplate.name}
                    onRedirect={handleRedirectToHomepage}
                />
            )}

            {/* PAYMENT SUCCESS POPUP */}
            {showPaymentSuccess && purchasedTemplate && (
                <PaymentSuccessPopup
                    isOpen={showPaymentSuccess}
                    onClose={() => setShowPaymentSuccess(false)}
                    onDownload={() => handleDownload(purchasedTemplate)}
                    templateName={purchasedTemplate.name}
                    amount={purchasedTemplate.price ?? 0}
                />
            )}
        </div>
    );
};

export default Step2Templates;
