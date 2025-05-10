import axios from 'axios';

interface MisinformationData {
  claim: string;
  category: string;
  verificationResult: 'true' | 'false' | 'partial' | 'unverified';
  source: 'text' | 'image' | 'url';
  timestamp: string;
  region?: string;
}

// Mock backend endpoint for analytics
const API_ENDPOINT = 'https://api.truthshield.org/analytics';

/**
 * Tracks a fact-checking attempt for analytics purposes
 */
export const trackFactCheck = async (data: Omit<MisinformationData, 'timestamp'>): Promise<void> => {
  try {
    const analyticsData: MisinformationData = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    
    // In production, this would send data to a real backend
    // For now, we'll just log it to console
    console.log('Analytics data tracked:', analyticsData);
    
    // Mock API call - in production, uncomment this
    /*
    await axios.post(API_ENDPOINT + '/track', analyticsData);
    */
    
    // Store in local storage for demo purposes
    const existingData = localStorage.getItem('truthshield_analytics');
    const storedData = existingData ? JSON.parse(existingData) : [];
    localStorage.setItem('truthshield_analytics', JSON.stringify([...storedData, analyticsData]));
    
  } catch (error) {
    console.error('Error tracking analytics data:', error);
  }
};

/**
 * Get trending misinformation by category
 */
export const getTrendingMisinformation = async (): Promise<{category: string, count: number}[]> => {
  try {
    // In production, fetch from real backend
    // For demo, we'll use localStorage data
    const existingData = localStorage.getItem('truthshield_analytics');
    if (!existingData) return getMockTrendingData();
    
    const storedData = JSON.parse(existingData) as MisinformationData[];
    
    // Group by category and count
    const categoryCounts: Record<string, number> = {};
    storedData.forEach(item => {
      if (categoryCounts[item.category]) {
        categoryCounts[item.category]++;
      } else {
        categoryCounts[item.category] = 1;
      }
    });
    
    // Convert to array of objects and sort by count
    const trendingData = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    })).sort((a, b) => b.count - a.count);
    
    return trendingData.length ? trendingData : getMockTrendingData();
    
  } catch (error) {
    console.error('Error fetching trending misinformation:', error);
    return getMockTrendingData();
  }
};

/**
 * Get mock trending data for the demo
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
 */
export const getCommonMisinformationPatterns = (): {pattern: string, example: string}[] => {
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