/**
 * ATS COMPATIBILITY VALIDATOR
 * 
 * Validates resume content and formatting for ATS compatibility.
 * Checks for common issues that cause ATS parsing failures.
 */

// ============== TYPES ==============
export type IssueSeverity = 'error' | 'warning' | 'info';
export type IssueCategory = 'format' | 'content' | 'structure' | 'contact' | 'keyword';

export interface ATSIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  suggestion: string;
  affectedText?: string;
  autoFixable: boolean;
}

export interface ATSValidationResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: ATSIssue[];
  passed: ATSCheck[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  recommendations: string[];
}

export interface ATSCheck {
  id: string;
  category: IssueCategory;
  title: string;
  status: 'pass' | 'fail' | 'warning';
}

// ============== VALIDATORS ==============

/**
 * Check for formatting issues that break ATS parsing
 */
function checkFormattingIssues(text: string, html?: string): ATSIssue[] {
  const issues: ATSIssue[] = [];
  
  // Check for tables (many ATS can't parse)
  if (html && /<table[\s>]/i.test(html)) {
    issues.push({
      id: 'format-tables',
      category: 'format',
      severity: 'error',
      title: 'Tables Detected',
      description: 'Many ATS systems cannot parse table layouts correctly. Content may appear scrambled or missing.',
      suggestion: 'Use simple text formatting with clear section breaks instead of tables.',
      autoFixable: false
    });
  }
  
  // Check for text boxes (content often invisible to ATS)
  if (html && /<(?:text-box|v:textbox|w:txbxContent)/i.test(html)) {
    issues.push({
      id: 'format-textbox',
      category: 'format',
      severity: 'error',
      title: 'Text Boxes Detected',
      description: 'Text boxes are often invisible to ATS systems. Important content may be completely missed.',
      suggestion: 'Remove text boxes and use standard paragraph formatting.',
      autoFixable: false
    });
  }
  
  // Check for headers/footers (often ignored by ATS)
  if (html && /<(?:header|footer)[\s>]/i.test(html)) {
    issues.push({
      id: 'format-headers-footers',
      category: 'format',
      severity: 'warning',
      title: 'Headers/Footers May Be Ignored',
      description: 'Many ATS systems skip header and footer content. Important information like contact details may be missed.',
      suggestion: 'Place all important information in the main body of the document.',
      autoFixable: false
    });
  }
  
  // Check for columns (may scramble reading order)
  if (html && /column-count:\s*[2-9]|columns:\s*[2-9]/i.test(html)) {
    issues.push({
      id: 'format-columns',
      category: 'format',
      severity: 'warning',
      title: 'Multi-Column Layout',
      description: 'Multi-column layouts can confuse ATS systems, causing text to be read in the wrong order.',
      suggestion: 'Use a single-column layout for maximum compatibility.',
      autoFixable: false
    });
  }
  
  // Check for images (only alt text read)
  if (html && /<img[\s>]/i.test(html)) {
    issues.push({
      id: 'format-images',
      category: 'format',
      severity: 'info',
      title: 'Images Detected',
      description: 'ATS systems can only read alt text from images. Photo content is ignored.',
      suggestion: 'Ensure any text in images is also included as regular text. Photos are fine but don\'t rely on them for information.',
      autoFixable: false
    });
  }
  
  // Check for graphics/charts
  if (html && /<(?:svg|canvas|chart)/i.test(html)) {
    issues.push({
      id: 'format-graphics',
      category: 'format',
      severity: 'warning',
      title: 'Graphics/Charts Detected',
      description: 'Graphics and charts are completely invisible to ATS systems.',
      suggestion: 'Include the data from any charts as text (e.g., "Skills: React (5 years), Python (3 years)").',
      autoFixable: false
    });
  }
  
  // Check for unusual bullet points
  const unusualBullets = text.match(/[★☆●○◆◇►▻◄◅▲△▼▽■□▪▫●○◊♦♠♣♥♡]/g);
  if (unusualBullets && unusualBullets.length > 3) {
    issues.push({
      id: 'format-bullets',
      category: 'format',
      severity: 'info',
      title: 'Unusual Bullet Characters',
      description: 'Some ATS systems may not recognize fancy bullet points.',
      suggestion: 'Use standard bullet points (•) or hyphens (-) for maximum compatibility.',
      autoFixable: true
    });
  }
  
  // Check for excessive special characters
  const specialChars = text.match(/[^\w\s\.\,\;\:\-\'\"\(\)\[\]\{\}\@\#\$\%\&\*\+\=\/\\\|\<\>\?\!]/g);
  if (specialChars && specialChars.length > 10) {
    issues.push({
      id: 'format-special-chars',
      category: 'format',
      severity: 'warning',
      title: 'Special Characters',
      description: `Found ${specialChars.length} special characters that may cause parsing issues.`,
      suggestion: 'Replace special characters with standard alternatives.',
      affectedText: [...new Set(specialChars)].slice(0, 10).join(' '),
      autoFixable: true
    });
  }
  
  return issues;
}

/**
 * Check contact information formatting
 */
function checkContactInfo(text: string): ATSIssue[] {
  const issues: ATSIssue[] = [];
  
  // Check phone number format
  const phonePatterns = [
    /\b\d{10}\b/,                          // 1234567890
    /\b\d{3}[\-\.\s]\d{3}[\-\.\s]\d{4}\b/, // 123-456-7890
    /\b\(\d{3}\)\s?\d{3}[\-\.\s]\d{4}\b/,  // (123) 456-7890
    /\b\+\d{1,3}[\s\-]?\d{10,}\b/          // +1 1234567890
  ];
  
  const hasPhone = phonePatterns.some(p => p.test(text));
  
  if (!hasPhone) {
    // Check if there's any number that looks like a phone
    const maybePhone = text.match(/\d{7,}/g);
    if (maybePhone) {
      issues.push({
        id: 'contact-phone-format',
        category: 'contact',
        severity: 'warning',
        title: 'Phone Number Format',
        description: 'Phone number may not be in a standard format. ATS may not extract it correctly.',
        suggestion: 'Use format: (123) 456-7890 or +1 123-456-7890',
        affectedText: maybePhone[0],
        autoFixable: true
      });
    }
  }
  
  // Check email format
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  
  if (!emailMatch) {
    issues.push({
      id: 'contact-email-missing',
      category: 'contact',
      severity: 'error',
      title: 'No Email Found',
      description: 'A valid email address is essential for ATS systems and recruiters to contact you.',
      suggestion: 'Add a professional email address (preferably firstname.lastname@provider.com).',
      autoFixable: false
    });
  } else {
    // Check for unusual email characters
    const email = emailMatch[0];
    if (/[^a-zA-Z0-9._%+\-@]/.test(email)) {
      issues.push({
        id: 'contact-email-chars',
        category: 'contact',
        severity: 'warning',
        title: 'Email Contains Unusual Characters',
        description: 'Emails with unusual characters may not be parsed correctly by some ATS systems.',
        suggestion: 'Use a simple email format with only letters, numbers, dots, and underscores.',
        affectedText: email,
        autoFixable: false
      });
    }
  }
  
  // Check for emojis in name/contact area
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojis = text.match(emojiRegex);
  if (emojis && emojis.length > 0) {
    issues.push({
      id: 'contact-emojis',
      category: 'contact',
      severity: 'warning',
      title: 'Emojis Detected',
      description: 'Emojis may cause parsing errors in some ATS systems.',
      suggestion: 'Remove emojis from your resume for maximum compatibility.',
      affectedText: emojis.join(' '),
      autoFixable: true
    });
  }
  
  return issues;
}

/**
 * Check content structure
 */
function checkStructure(text: string): ATSIssue[] {
  const issues: ATSIssue[] = [];
  const lowerText = text.toLowerCase();
  
  // Check for standard section headers
  const standardSections = [
    { name: 'Experience', patterns: ['experience', 'work history', 'employment', 'professional experience'] },
    { name: 'Education', patterns: ['education', 'academic', 'qualifications', 'degrees'] },
    { name: 'Skills', patterns: ['skills', 'technical skills', 'competencies', 'expertise'] }
  ];
  
  for (const section of standardSections) {
    const found = section.patterns.some(p => lowerText.includes(p));
    if (!found) {
      issues.push({
        id: `structure-missing-${section.name.toLowerCase()}`,
        category: 'structure',
        severity: section.name === 'Experience' || section.name === 'Education' ? 'error' : 'warning',
        title: `Missing ${section.name} Section`,
        description: `ATS systems look for a clear "${section.name}" section header.`,
        suggestion: `Add a clearly labeled "${section.name.toUpperCase()}" section.`,
        autoFixable: false
      });
    }
  }
  
  // Check for dates
  const datePatterns = [
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]+\d{4}\b/gi,
    /\b\d{1,2}\/\d{4}\b/g,
    /\b(19|20)\d{2}\s*[\-–]\s*(19|20)?\d{2,4}\b/g,
    /\b(19|20)\d{2}\s*[\-–]\s*present\b/gi
  ];
  
  const hasStandardDates = datePatterns.some(p => p.test(text));
  if (!hasStandardDates) {
    issues.push({
      id: 'structure-dates',
      category: 'structure',
      severity: 'warning',
      title: 'Date Format Issue',
      description: 'No standard date formats detected. ATS systems may not correctly parse your timeline.',
      suggestion: 'Use consistent date formats like "Jan 2020 - Present" or "01/2020 - 12/2023".',
      autoFixable: false
    });
  }
  
  // Check resume length (word count)
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 150) {
    issues.push({
      id: 'structure-too-short',
      category: 'structure',
      severity: 'warning',
      title: 'Resume Too Short',
      description: `Your resume has approximately ${wordCount} words. This may appear incomplete to ATS systems.`,
      suggestion: 'Add more detail to your experience and skills sections. Aim for 300-600 words.',
      autoFixable: false
    });
  } else if (wordCount > 1200) {
    issues.push({
      id: 'structure-too-long',
      category: 'structure',
      severity: 'info',
      title: 'Resume May Be Too Long',
      description: `Your resume has approximately ${wordCount} words. Very long resumes may be truncated by some ATS.`,
      suggestion: 'Consider condensing to 1-2 pages. Focus on the most relevant and recent experience.',
      autoFixable: false
    });
  }
  
  // Check for abbreviations without context
  const abbreviations = text.match(/\b[A-Z]{2,5}\b/g) || [];
  const commonAbbreviations = new Set(['USA', 'UK', 'CEO', 'CTO', 'CFO', 'VP', 'HR', 'IT', 'MBA', 'PhD', 'MS', 'BS', 'BA']);
  const unknownAbbreviations = abbreviations.filter(a => !commonAbbreviations.has(a));
  
  if (unknownAbbreviations.length > 5) {
    issues.push({
      id: 'structure-abbreviations',
      category: 'structure',
      severity: 'info',
      title: 'Multiple Abbreviations',
      description: 'Found several abbreviations. Some ATS systems may not recognize industry-specific abbreviations.',
      suggestion: 'Consider spelling out abbreviations at least once (e.g., "Customer Relationship Management (CRM)").',
      affectedText: [...new Set(unknownAbbreviations)].slice(0, 5).join(', '),
      autoFixable: false
    });
  }
  
  return issues;
}

/**
 * Check for keyword optimization
 */
function checkKeywordOptimization(text: string, jdKeywords?: string[]): ATSIssue[] {
  const issues: ATSIssue[] = [];
  
  if (!jdKeywords || jdKeywords.length === 0) {
    issues.push({
      id: 'keyword-no-jd',
      category: 'keyword',
      severity: 'info',
      title: 'No Job Description Provided',
      description: 'Keyword matching cannot be checked without a job description.',
      suggestion: 'Paste a job description to check keyword alignment.',
      autoFixable: false
    });
    return issues;
  }
  
  const lowerText = text.toLowerCase();
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  for (const keyword of jdKeywords) {
    const regex = new RegExp(`\\b${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }
  
  const matchRate = Math.round((matchedKeywords.length / jdKeywords.length) * 100);
  
  if (matchRate < 50) {
    issues.push({
      id: 'keyword-low-match',
      category: 'keyword',
      severity: 'error',
      title: 'Low Keyword Match',
      description: `Only ${matchRate}% of job description keywords found in your resume.`,
      suggestion: 'Review the job description and incorporate relevant missing keywords naturally.',
      affectedText: missingKeywords.slice(0, 5).join(', '),
      autoFixable: false
    });
  } else if (matchRate < 70) {
    issues.push({
      id: 'keyword-moderate-match',
      category: 'keyword',
      severity: 'warning',
      title: 'Moderate Keyword Match',
      description: `${matchRate}% keyword match rate. Could be improved.`,
      suggestion: 'Consider adding more relevant keywords from the job description.',
      affectedText: missingKeywords.slice(0, 5).join(', '),
      autoFixable: false
    });
  }
  
  // Check for keyword stuffing
  const wordCounts = new Map<string, number>();
  const words = lowerText.split(/\s+/);
  words.forEach(word => {
    if (word.length > 3) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });
  
  const stuffedWords = Array.from(wordCounts.entries())
    .filter(([word, count]) => count > 8 && jdKeywords.some(kw => kw.toLowerCase().includes(word)))
    .map(([word]) => word);
  
  if (stuffedWords.length > 0) {
    issues.push({
      id: 'keyword-stuffing',
      category: 'keyword',
      severity: 'warning',
      title: 'Possible Keyword Stuffing',
      description: 'Some keywords appear many times. This may be flagged as keyword stuffing.',
      suggestion: 'Use keywords naturally. Vary your language and use synonyms.',
      affectedText: stuffedWords.slice(0, 3).join(', '),
      autoFixable: false
    });
  }
  
  return issues;
}

// ============== MAIN VALIDATION FUNCTION ==============

export interface ATSValidationOptions {
  html?: string;
  jdKeywords?: string[];
  strictMode?: boolean;
}

/**
 * Main function: Validate resume for ATS compatibility
 */
export function validateATSCompatibility(
  resumeText: string,
  options: ATSValidationOptions = {}
): ATSValidationResult {
  const { html, jdKeywords, strictMode = false } = options;
  
  // Collect all issues
  const allIssues: ATSIssue[] = [
    ...checkFormattingIssues(resumeText, html),
    ...checkContactInfo(resumeText),
    ...checkStructure(resumeText),
    ...checkKeywordOptimization(resumeText, jdKeywords)
  ];
  
  // Count by severity
  const summary = {
    errors: allIssues.filter(i => i.severity === 'error').length,
    warnings: allIssues.filter(i => i.severity === 'warning').length,
    info: allIssues.filter(i => i.severity === 'info').length
  };
  
  // Calculate score (0-100)
  let score = 100;
  score -= summary.errors * 15;  // -15 per error
  score -= summary.warnings * 5; // -5 per warning
  score -= summary.info * 1;     // -1 per info
  score = Math.max(0, Math.min(100, score));
  
  // Determine grade
  let grade: ATSValidationResult['grade'];
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';
  
  // Generate passed checks
  const passed: ATSCheck[] = [];
  
  // Check what passed
  if (!allIssues.some(i => i.id.startsWith('format-tables'))) {
    passed.push({ id: 'format-no-tables', category: 'format', title: 'No tables', status: 'pass' });
  }
  if (!allIssues.some(i => i.id.startsWith('format-textbox'))) {
    passed.push({ id: 'format-no-textbox', category: 'format', title: 'No text boxes', status: 'pass' });
  }
  if (!allIssues.some(i => i.id.startsWith('contact-email-missing'))) {
    passed.push({ id: 'contact-has-email', category: 'contact', title: 'Email present', status: 'pass' });
  }
  if (!allIssues.some(i => i.id.startsWith('structure-missing-experience'))) {
    passed.push({ id: 'structure-has-experience', category: 'structure', title: 'Experience section', status: 'pass' });
  }
  if (!allIssues.some(i => i.id.startsWith('structure-missing-education'))) {
    passed.push({ id: 'structure-has-education', category: 'structure', title: 'Education section', status: 'pass' });
  }
  if (!allIssues.some(i => i.id.startsWith('structure-dates'))) {
    passed.push({ id: 'structure-has-dates', category: 'structure', title: 'Proper date formats', status: 'pass' });
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (summary.errors > 0) {
    recommendations.push('Address all error-level issues first as they significantly impact ATS parsing.');
  }
  
  if (allIssues.some(i => i.category === 'keyword')) {
    recommendations.push('Tailor your resume keywords to match the job description.');
  }
  
  if (allIssues.some(i => i.id.includes('format'))) {
    recommendations.push('Simplify your resume formatting for better ATS compatibility.');
  }
  
  if (score >= 80) {
    recommendations.push('Your resume has good ATS compatibility. Focus on content quality.');
  } else if (score >= 60) {
    recommendations.push('Your resume needs some improvements for optimal ATS performance.');
  } else {
    recommendations.push('Significant changes are needed to improve ATS compatibility.');
  }
  
  return {
    score,
    grade,
    issues: allIssues,
    passed,
    summary,
    recommendations
  };
}

/**
 * Quick ATS score check (lighter validation)
 */
export function quickATSScore(resumeText: string): { score: number; grade: string; topIssue?: string } {
  const result = validateATSCompatibility(resumeText);
  return {
    score: result.score,
    grade: result.grade,
    topIssue: result.issues.find(i => i.severity === 'error')?.title || 
              result.issues.find(i => i.severity === 'warning')?.title
  };
}

/**
 * Auto-fix common issues
 */
export function autoFixATSIssues(text: string): { fixed: string; changes: string[] } {
  let fixed = text;
  const changes: string[] = [];
  
  // Fix fancy bullet points
  const fancyBullets = /[★☆●○◆◇►▻◄◅▲△▼▽■□▪▫●○◊♦♠♣♥♡]/g;
  if (fancyBullets.test(fixed)) {
    fixed = fixed.replace(fancyBullets, '•');
    changes.push('Replaced fancy bullet points with standard bullets');
  }
  
  // Remove emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  if (emojiRegex.test(fixed)) {
    fixed = fixed.replace(emojiRegex, '');
    changes.push('Removed emojis');
  }
  
  // Normalize whitespace
  if (/\s{3,}/.test(fixed)) {
    fixed = fixed.replace(/\s{3,}/g, '  ');
    changes.push('Normalized excessive whitespace');
  }
  
  // Clean up line breaks
  if (/\n{4,}/.test(fixed)) {
    fixed = fixed.replace(/\n{4,}/g, '\n\n');
    changes.push('Cleaned up excessive line breaks');
  }
  
  return { fixed, changes };
}
