import logger from '../utils/logger';

interface MisinformationData {
  claim: string;
  category: string;
  verificationResult: 'true' | 'false' | 'partial' | 'unverified';
  source: 'text' | 'image' | 'url';
  timestamp: string;
  region?: string;
}

/**
 * Tracks a fact-checking attempt for analytics purposes
 * Currently logs but doesn't send to backend
 */
export const trackFactCheck = async (data: Omit<MisinformationData, 'timestamp'>): Promise<void> => {
  try {
    const analyticsData: MisinformationData = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    
    logger.debug('Analytics data tracked locally', {
      category: analyticsData.category,
      source: analyticsData.source,
      result: analyticsData.verificationResult
    });
    
    // Skip backend call, just log locally
  } catch (error) {
    // Don't let analytics errors break the application
    logger.error('Error logging analytics data:', error);
  }
};

/**
 * Get trending misinformation by category
 * Returns mock data
 */
export const getTrendingMisinformation = async (): Promise<{category: string, count: number}[]> => {
  logger.debug('Returning mock trending data');
    
  // Always return mock data
    return getMockTrendingData();
};

/**
 * Mock trending data
 */
const getMockTrendingData = (): {category: string, count: number}[] => {
  return [
    { category: 'Military Movements', count: 237 },
    { category: 'Diplomatic Statements', count: 189 },
    { category: 'Civilian Casualties', count: 142 },
    { category: 'Border Incidents', count: 98 },
    { category: 'Economic Impact', count: 76 }
  ];
};

/**
 * Get common misinformation patterns
 * Returns mock data
 */
export const getCommonMisinformationPatterns = async (): Promise<{pattern: string, example: string}[]> => {
  logger.debug('Returning mock misinformation patterns');
  
  // Always return mock data
  return getStaticMisinformationPatterns();
};

/**
 * Static misinformation patterns
 */
const getStaticMisinformationPatterns = (): {pattern: string, example: string}[] => {
  return [
    { 
      pattern: 'Manipulated media',
      example: 'Old videos or images recontextualized as recent events'
    },
    {
      pattern: 'False attribution',
      example: 'Statements falsely attributed to government officials'
    },
    {
      pattern: 'Exaggerated numbers', 
      example: 'Casualty figures or troop movements vastly inflated'
    },
    {
      pattern: 'Fabricated events',
      example: 'Entirely fictional incidents reported as news'
    },
    {
      pattern: 'Misleading context',
      example: 'Real facts presented in misleading context'
    }
  ];
}; 