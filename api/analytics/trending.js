/**
 * TruthShield Analytics - Trending Data Endpoint
 */

// Simple in-memory cache (resets on serverless function cold starts)
// NOT FOR PRODUCTION - This is just for demonstration purposes
// This data would ideally be stored in a database and shared between endpoints
const analyticsCache = {
  factChecks: [],
  lastReset: new Date().toISOString()
};

// Add some initial mock data
if (analyticsCache.factChecks.length === 0) {
  analyticsCache.factChecks.push(
    { 
      category: 'Military Movements', 
      verificationResult: 'false', 
      claim: 'Mock data', 
      source: 'text',
      timestamp: new Date().toISOString()
    }
  );
}

module.exports = async (req, res) => {
  // Set CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only handle GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Use a mix of real (cached) data and mock data
    let trendingData = [];
    
    // If we have some cached data, use it to generate trends
    if (analyticsCache.factChecks.length > 0) {
      const categoryCounts = {};
      
      // Count occurrences of each category
      analyticsCache.factChecks.forEach(item => {
        if (categoryCounts[item.category]) {
          categoryCounts[item.category]++;
        } else {
          categoryCounts[item.category] = 1;
        }
      });
      
      // Convert to array and sort
      trendingData = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    }
    
    // If we don't have enough real data, supplement with mock data
    if (trendingData.length < 5) {
      const mockData = [
        { category: 'Military Movements', count: 237 },
        { category: 'Diplomatic Statements', count: 189 },
        { category: 'Civilian Casualties', count: 142 },
        { category: 'Border Incidents', count: 98 },
        { category: 'Economic Impact', count: 76 }
      ];
      
      // Filter mock data to exclude categories we already have
      const existingCategories = trendingData.map(item => item.category);
      const filteredMockData = mockData.filter(item => !existingCategories.includes(item.category));
      
      // Combine real and mock data
      trendingData = [...trendingData, ...filteredMockData].slice(0, 5);
    }
    
    console.log('[API /api/analytics/trending] Sending trending data:', { count: trendingData.length });
    
    return res.status(200).json(trendingData);
  } catch (error) {
    console.error('[API /api/analytics/trending] Error generating trending data:', error);
    return res.status(500).json({ error: 'Failed to generate trending data' });
  }
}; 