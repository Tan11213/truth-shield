/**
 * TruthShield Analytics - Misinformation Patterns Endpoint
 */

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
    
    console.log('[API /api/analytics/patterns] Sending misinformation patterns');
    
    return res.status(200).json(patterns);
  } catch (error) {
    console.error('[API /api/analytics/patterns] Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve misinformation patterns' });
  }
}; 