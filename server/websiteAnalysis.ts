/**
 * Website Analysis Service
 *
 * Analyzes existing websites to determine:
 * - Estimated age (via Wayback Machine CDX API + HTML copyright year parsing)
 * - Quality score (mobile-friendliness, HTTPS, modern tech indicators)
 * - Lead type classification (no_website, outdated_website, poor_website)
 */

export interface WebsiteAnalysisResult {
  hasWebsite: boolean;
  leadType: "no_website" | "outdated_website" | "poor_website" | "unknown";
  websiteAge: number | null; // years
  websiteScore: number; // 0-100
  details: {
    firstSeenYear: number | null;
    copyrightYear: number | null;
    hasHttps: boolean;
    hasMobileViewport: boolean;
    hasModernCms: boolean;
    cmsVersion: string | null;
    isResponsive: boolean;
    hasContactForm: boolean;
    pageLoadIndicators: string[];
    ageSource: "wayback" | "copyright" | "estimated" | "none";
  };
}

const CURRENT_YEAR = new Date().getFullYear();
const OUTDATED_THRESHOLD_YEARS = 4; // websites older than 4 years are "outdated"
const POOR_SCORE_THRESHOLD = 40; // score below 40 = "poor website"

/**
 * Fetch the first snapshot year from Wayback Machine CDX API.
 */
async function getWaybackFirstYear(url: string): Promise<number | null> {
  try {
    const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=1&fl=timestamp&filter=statuscode:200&from=19960101&to=${CURRENT_YEAR}0101`;
    const res = await fetch(cdxUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json() as string[][];
    if (!data || data.length < 2) return null;
    const timestamp = data[1]?.[0];
    if (!timestamp || timestamp.length < 4) return null;
    return parseInt(timestamp.slice(0, 4), 10);
  } catch {
    return null;
  }
}

/**
 * Fetch website HTML and extract quality signals.
 */
async function analyzeWebsiteHtml(url: string): Promise<{
  copyrightYear: number | null;
  hasMobileViewport: boolean;
  hasModernCms: boolean;
  cmsVersion: string | null;
  isResponsive: boolean;
  hasContactForm: boolean;
  hasHttps: boolean;
  pageLoadIndicators: string[];
}> {
  const result = {
    copyrightYear: null as number | null,
    hasMobileViewport: false,
    hasModernCms: false,
    cmsVersion: null as string | null,
    isResponsive: false,
    hasContactForm: false,
    hasHttps: url.startsWith("https://"),
    pageLoadIndicators: [] as string[],
  };

  try {
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const res = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PageblitzBot/1.0; +https://pageblitz.de)",
        "Accept": "text/html",
      },
    });

    if (!res.ok) return result;

    // Check HTTPS from final URL
    result.hasHttps = res.url.startsWith("https://");

    const html = await res.text();
    const lower = html.toLowerCase();

    // Mobile viewport
    result.hasMobileViewport = lower.includes('name="viewport"') || lower.includes("name='viewport'");

    // Responsive indicators
    result.isResponsive = result.hasMobileViewport ||
      lower.includes("@media") ||
      lower.includes("bootstrap") ||
      lower.includes("tailwind") ||
      lower.includes("responsive");

    // Contact form
    result.hasContactForm = lower.includes('<form') && (
      lower.includes('contact') || lower.includes('kontakt') ||
      lower.includes('email') || lower.includes('message') || lower.includes('nachricht')
    );

    // CMS detection
    if (lower.includes("wp-content") || lower.includes("wp-includes")) {
      result.hasModernCms = true;
      // Try to extract WordPress version
      const wpMatch = html.match(/wordpress[^"]*?([0-9]+\.[0-9]+)/i);
      result.cmsVersion = wpMatch ? `WordPress ${wpMatch[1]}` : "WordPress";
      result.pageLoadIndicators.push("WordPress");
    } else if (lower.includes("joomla")) {
      result.hasModernCms = true;
      result.cmsVersion = "Joomla";
      result.pageLoadIndicators.push("Joomla");
    } else if (lower.includes("typo3")) {
      result.hasModernCms = true;
      result.cmsVersion = "TYPO3";
      result.pageLoadIndicators.push("TYPO3");
    } else if (lower.includes("drupal")) {
      result.hasModernCms = true;
      result.cmsVersion = "Drupal";
      result.pageLoadIndicators.push("Drupal");
    } else if (lower.includes("wix.com") || lower.includes("wixsite")) {
      result.hasModernCms = true;
      result.cmsVersion = "Wix";
      result.pageLoadIndicators.push("Wix");
    } else if (lower.includes("squarespace")) {
      result.hasModernCms = true;
      result.cmsVersion = "Squarespace";
      result.pageLoadIndicators.push("Squarespace");
    } else if (lower.includes("jimdo")) {
      result.hasModernCms = true;
      result.cmsVersion = "Jimdo";
      result.pageLoadIndicators.push("Jimdo");
    }

    // Copyright year extraction
    const copyrightPatterns = [
      /©\s*(?:copyright\s*)?(\d{4})/i,
      /copyright\s*©?\s*(\d{4})/i,
      /&copy;\s*(\d{4})/i,
      /alle rechte vorbehalten.*?(\d{4})/i,
      /all rights reserved.*?(\d{4})/i,
    ];

    for (const pattern of copyrightPatterns) {
      const match = html.match(pattern);
      if (match) {
        const year = parseInt(match[1], 10);
        if (year >= 2000 && year <= CURRENT_YEAR) {
          result.copyrightYear = year;
          break;
        }
      }
    }

    // Also check for year ranges like "2018-2024" → use the last year
    const yearRangeMatch = html.match(/©\s*(\d{4})\s*[-–]\s*(\d{4})/);
    if (yearRangeMatch) {
      const lastYear = parseInt(yearRangeMatch[2], 10);
      if (lastYear >= 2000 && lastYear <= CURRENT_YEAR) {
        result.copyrightYear = lastYear;
      }
    }

    // Modern tech indicators
    if (lower.includes("react") || lower.includes("vue") || lower.includes("angular") || lower.includes("next.js")) {
      result.pageLoadIndicators.push("Modern JS Framework");
    }
    if (lower.includes("bootstrap 5") || lower.includes("tailwind")) {
      result.pageLoadIndicators.push("Modern CSS");
    }

  } catch {
    // Timeout or network error – return defaults
  }

  return result;
}

/**
 * Calculate a quality score (0-100) based on website analysis.
 */
function calculateQualityScore(analysis: {
  hasHttps: boolean;
  hasMobileViewport: boolean;
  isResponsive: boolean;
  hasContactForm: boolean;
  hasModernCms: boolean;
  copyrightYear: number | null;
  firstSeenYear: number | null;
}): number {
  let score = 0;

  // HTTPS: 20 points
  if (analysis.hasHttps) score += 20;

  // Mobile viewport: 25 points
  if (analysis.hasMobileViewport) score += 25;

  // Responsive design: 15 points
  if (analysis.isResponsive) score += 15;

  // Contact form: 10 points
  if (analysis.hasContactForm) score += 10;

  // Modern CMS: 10 points
  if (analysis.hasModernCms) score += 10;

  // Age penalty: deduct points for old copyright year
  const referenceYear = analysis.copyrightYear || analysis.firstSeenYear;
  if (referenceYear) {
    const age = CURRENT_YEAR - referenceYear;
    if (age <= 1) score += 20;
    else if (age <= 2) score += 15;
    else if (age <= 3) score += 10;
    else if (age <= 5) score += 5;
    else score += 0; // older than 5 years: no bonus
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Main analysis function – analyzes a website URL and returns a full report.
 */
export async function analyzeWebsite(websiteUrl: string | null | undefined): Promise<WebsiteAnalysisResult> {
  if (!websiteUrl) {
    return {
      hasWebsite: false,
      leadType: "no_website",
      websiteAge: null,
      websiteScore: 0,
      details: {
        firstSeenYear: null,
        copyrightYear: null,
        hasHttps: false,
        hasMobileViewport: false,
        hasModernCms: false,
        cmsVersion: null,
        isResponsive: false,
        hasContactForm: false,
        pageLoadIndicators: [],
        ageSource: "none",
      },
    };
  }

  // Run Wayback Machine and HTML analysis in parallel
  const [firstSeenYear, htmlAnalysis] = await Promise.all([
    getWaybackFirstYear(websiteUrl),
    analyzeWebsiteHtml(websiteUrl),
  ]);

  // Determine age
  let websiteAge: number | null = null;
  let ageSource: "wayback" | "copyright" | "estimated" | "none" = "none";

  if (firstSeenYear) {
    websiteAge = CURRENT_YEAR - firstSeenYear;
    ageSource = "wayback";
  } else if (htmlAnalysis.copyrightYear) {
    websiteAge = CURRENT_YEAR - htmlAnalysis.copyrightYear;
    ageSource = "copyright";
  }

  // Calculate quality score
  const websiteScore = calculateQualityScore({
    hasHttps: htmlAnalysis.hasHttps,
    hasMobileViewport: htmlAnalysis.hasMobileViewport,
    isResponsive: htmlAnalysis.isResponsive,
    hasContactForm: htmlAnalysis.hasContactForm,
    hasModernCms: htmlAnalysis.hasModernCms,
    copyrightYear: htmlAnalysis.copyrightYear,
    firstSeenYear,
  });

  // Classify lead type
  let leadType: "no_website" | "outdated_website" | "poor_website" | "unknown" = "unknown";

  if (websiteAge !== null && websiteAge >= OUTDATED_THRESHOLD_YEARS) {
    leadType = "outdated_website";
  } else if (websiteScore < POOR_SCORE_THRESHOLD) {
    leadType = "poor_website";
  } else if (websiteAge !== null) {
    leadType = "unknown"; // has a decent website
  }

  return {
    hasWebsite: true,
    leadType,
    websiteAge,
    websiteScore,
    details: {
      firstSeenYear,
      copyrightYear: htmlAnalysis.copyrightYear,
      hasHttps: htmlAnalysis.hasHttps,
      hasMobileViewport: htmlAnalysis.hasMobileViewport,
      hasModernCms: htmlAnalysis.hasModernCms,
      cmsVersion: htmlAnalysis.cmsVersion,
      isResponsive: htmlAnalysis.isResponsive,
      hasContactForm: htmlAnalysis.hasContactForm,
      pageLoadIndicators: htmlAnalysis.pageLoadIndicators,
      ageSource,
    },
  };
}
