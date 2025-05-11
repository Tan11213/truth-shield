/**
 * TruthShield Analytics Serverless Function
 * 
 * This backend endpoint receives analytics events from the frontend and:
 * 1. Logs them securely on the server side
 * 2. Stores them in a simple in-memory cache (for demo purposes)
 * 3. Provides mock trend data derived partly from the cache
 * 
 * PRODUCTION NOTE: In a real production environment, this would:
 * - Store analytics events in a database (Vercel KV, Postgres, etc.)
 * - Implement proper aggregation and analysis
 * - Potentially forward data to a dedicated analytics service
 */

// Simple in-memory cache (resets on serverless function cold starts)
// NOT FOR PRODUCTION - This is just for demonstration purposes
const analyticsCache = {
  factChecks: [],
  lastReset: new Date().toISOString()
};

module.exports = async (req, res) => {
  // Set CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST requests for tracking analytics events
  if (req.method === 'POST' && req.url.includes('/track')) {
    try {
      const analyticsData = req.body;
      
      if (!analyticsData || !analyticsData.claim || !analyticsData.category || !analyticsData.verificationResult) {
        return res.status(400).json({ error: 'Missing required analytics data fields' });
      }
      
      // Add timestamp if not provided
      if (!analyticsData.timestamp) {
        analyticsData.timestamp = new Date().toISOString();
      }
      
      // Log the analytics event (visible in Vercel logs)
      console.log('[Analytics] Tracking fact check:', {
        category: analyticsData.category,
        result: analyticsData.verificationResult,
        source: analyticsData.source,
        timestamp: analyticsData.timestamp,
        // Don't log the full claim for privacy
        claimLength: analyticsData.claim.length
      });
      
      // Store in our simple cache
      analyticsCache.factChecks.push(analyticsData);
      
      // Limit cache size to prevent memory issues
      if (analyticsCache.factChecks.length > 100) {
        analyticsCache.factChecks = analyticsCache.factChecks.slice(-100);
      }
      
      // PRODUCTION NOTE: In a real implementation, you would:
      // 1. Store this in a database
      // 2. Send to a third-party analytics service via secure API calls
      // const analyticsApiKey = process.env.ANALYTICS_API_KEY;
      // if (analyticsApiKey) {
      //   await axios.post('https://api.analytics-service.com/events', 
      //     analyticsData, 
      //     { headers: { 'Authorization': `Bearer ${analyticsApiKey}` } }
      //   );
      // }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('[Analytics] Error processing analytics event:', error);
      return res.status(500).json({ error: 'Failed to process analytics data' });
    }
  }
  
  // Handle GET requests for trending data
  if (req.method === 'GET' && req.url.includes('/trending')) {
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
      
      return res.status(200).json({
        trends: trendingData,
        info: {
          dataSource: analyticsCache.factChecks.length > 0 ? 'hybrid' : 'mock',
          cacheSize: analyticsCache.factChecks.length,
          lastReset: analyticsCache.lastReset
        }
      });
    } catch (error) {
      console.error('[Analytics] Error generating trending data:', error);
      return res.status(500).json({ error: 'Failed to generate trending data' });
    }
  }
  
  // Handle GET requests for misinformation patterns
  if (req.method === 'GET' && req.url.includes('/patterns')) {
    // This is static data, no need for a database
    const patterns = [
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
    
    return res.status(200).json({ patterns });
  }
  
  // Handle unknown routes
  return res.status(404).json({ error: 'Not found' });
}; 