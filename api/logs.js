/**
 * Simple logs API endpoint to capture client-side logs
 */

module.exports = (req, res) => {
  // Always respond with success regardless of method
  const timestamp = new Date().toISOString();
  
  // If it's a POST request, log the data
  if (req.method === 'POST') {
    try {
      const logData = req.body;
      // Just log to console instead of storing in a DB
      console.log(`
========== CLIENT LOG ==========
Time: ${timestamp}
Level: ${logData?.level || 'unknown'}
Message: ${logData?.message || 'No message'}
Session: ${logData?.sessionId || 'unknown'}
URL: ${logData?.url || 'unknown'}
Data: ${JSON.stringify(logData?.data || {}).substring(0, 200)}
===============================
      `);
    } catch (error) {
      console.error('Error processing client log:', error);
    }
  }
  
  // Always return success
  return res.status(200).json({ 
    success: true,
    timestamp,
    message: 'Log received'
  });
}; 