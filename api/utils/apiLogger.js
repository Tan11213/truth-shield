/**
 * API Logger utility for debugging Vercel serverless functions
 */

// Simple request logger middleware
const logRequest = (req, serviceName) => {
  const timestamp = new Date().toISOString();
  const method = req.method || 'UNKNOWN';
  const url = req.url || 'UNKNOWN';
  const body = req.body ? JSON.stringify(req.body).substring(0, 200) : 'EMPTY';
  const headers = req.headers ? JSON.stringify(req.headers) : 'NONE';
  
  console.log(`
========== API REQUEST [${serviceName}] ==========
[${timestamp}] ${method} ${url}
Headers: ${headers}
Body: ${body}
=============================================
  `);

  return timestamp;
};

// Log API call to external service
const logExternalAPICall = (service, endpoint, payload) => {
  console.log(`
========== EXTERNAL API CALL ==========
Service: ${service}
Endpoint: ${endpoint}
Payload: ${typeof payload === 'object' ? JSON.stringify(payload).substring(0, 300) : payload}
=======================================
  `);
};

// Log API response from external service
const logExternalAPIResponse = (service, status, responseData) => {
  console.log(`
========== EXTERNAL API RESPONSE ==========
Service: ${service}
Status: ${status}
Response: ${typeof responseData === 'object' ? JSON.stringify(responseData).substring(0, 300) : responseData}
==========================================
  `);
};

// Log API response to client
const logResponse = (timestamp, serviceName, status, responseData) => {
  const endTimestamp = new Date().toISOString();
  
  console.log(`
========== API RESPONSE [${serviceName}] ==========
Request time: ${timestamp}
Response time: ${endTimestamp}
Status: ${status}
Response: ${typeof responseData === 'object' ? JSON.stringify(responseData).substring(0, 300) : responseData}
===============================================
  `);
};

module.exports = {
  logRequest,
  logExternalAPICall,
  logExternalAPIResponse,
  logResponse
}; 