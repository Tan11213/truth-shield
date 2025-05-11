/**
 * TruthShield Analytics - Track Events Endpoint
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

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
    console.log('[API /api/analytics/track] Tracking fact check:', {
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
    console.error('[API /api/analytics/track] Error processing analytics event:', error);
    return res.status(500).json({ error: 'Failed to process analytics data' });
  }
}; 