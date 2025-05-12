/**
 * API endpoint to send report emails
 */

const { log, validateRequest, formatErrorResponse } = require('./utils/apiHelpers');
const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_APP_PASSWORD;
const EMAIL_TO = process.env.EMAIL_TO || 'reports@truthshield.org';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@truthshield.org';

// Debug environment variables when loaded
console.log('[API /api/send-report] Loading endpoint...');
console.log('[API /api/send-report] ENVIRONMENT VARIABLES CHECK:');
console.log('[API /api/send-report] NODE_ENV:', process.env.NODE_ENV);
console.log('[API /api/send-report] VERCEL_ENV:', process.env.VERCEL_ENV);
console.log('[API /api/send-report] EMAIL_USER exists:', !!EMAIL_USER);
console.log('[API /api/send-report] EMAIL_APP_PASSWORD exists:', !!EMAIL_PASSWORD);
console.log('[API /api/send-report] EMAIL_TO:', EMAIL_TO);
console.log('[API /api/send-report] EMAIL_FROM:', EMAIL_FROM);
console.log('[API /api/send-report] Running in directory:', process.cwd());
console.log('[API /api/send-report] NODE version:', process.version);

// Create email transporter
const createTransporter = async () => {
  // Check if email credentials are configured
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.log('[API /api/send-report] Email credentials not configured. Email sending disabled.');
    console.log('[API /api/send-report] EMAIL_USER:', EMAIL_USER ? 'exists' : 'missing');
    console.log('[API /api/send-report] EMAIL_APP_PASSWORD:', EMAIL_PASSWORD ? 'exists' : 'missing');
    return null;
  }

  try {
    console.log('[API /api/send-report] Creating transporter with Gmail service');
    console.log('[API /api/send-report] Using email user:', EMAIL_USER);
    
    // Create a transporter using Gmail with enhanced timeout settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD, // App password for Gmail
      },
      debug: true, // Enable debug logging
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,  // 5 seconds
      socketTimeout: 10000,   // 10 seconds
    });

    // Verify the connection configuration
    console.log('[API /api/send-report] Verifying SMTP connection...');
    try {
      const verifyResult = await transporter.verify();
      console.log('[API /api/send-report] SMTP connection verified successfully:', verifyResult);
      return transporter;
    } catch (verifyError) {
      console.error('[API /api/send-report] SMTP verification failed:', verifyError);
      throw verifyError;
    }
  } catch (error) {
    console.error('[API /api/send-report] Failed to create email transporter:', error);
    return null;
  }
};

// Format HTML email content for better readability
const createHtmlEmailContent = (reportData) => {
  const {
    reportType,
    description,
    contentId,
    contentType,
    contentPreview,
    userEmail,
    claimData,
    verdict,
    explanation,
    sources,
    timestamp,
    reportId
  } = reportData;

  return `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        h2 { color: #4b5563; margin-top: 20px; }
        .section { margin-bottom: 20px; background: #f9fafb; padding: 15px; border-radius: 5px; }
        .label { font-weight: bold; }
        .text-muted { color: #6b7280; }
        pre { white-space: pre-wrap; background: #f1f5f9; padding: 10px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>TruthShield Report Notification</h1>
        
        <div class="section">
          <h2>Report Details</h2>
          <p><span class="label">Type:</span> ${reportType}</p>
          <p><span class="label">Content ID:</span> ${contentId}</p>
          <p><span class="label">Content Type:</span> ${contentType}</p>
          <p><span class="label">Submitted By:</span> ${userEmail || 'Anonymous'}</p>
          <p><span class="label">Timestamp:</span> ${new Date(timestamp).toLocaleString()}</p>
          <p><span class="label">Report ID:</span> ${reportId || 'Unknown'}</p>
        </div>

        ${description ? `
        <div class="section">
          <h2>User Description</h2>
          <pre>${description}</pre>
        </div>
        ` : ''}

        <div class="section">
          <h2>Reported Content</h2>
          ${claimData ? `<p><span class="label">Claim:</span> ${claimData}</p>` : ''}
          ${contentPreview ? `<p><span class="label">Preview:</span> ${contentPreview}</p>` : ''}
          ${verdict ? `<p><span class="label">Verdict:</span> ${verdict}</p>` : ''}
        </div>

        ${explanation ? `
        <div class="section">
          <h2>Explanation</h2>
          <pre>${explanation}</pre>
        </div>
        ` : ''}

        ${sources ? `
        <div class="section">
          <h2>Sources</h2>
          <pre>${sources}</pre>
        </div>
        ` : ''}
        
        <p class="text-muted">
          This is an automated message from the TruthShield platform. Please review this report and take appropriate action.
        </p>
      </div>
    </body>
  </html>
  `;
};

// Save report to database or storage (fallback mechanism)
const saveReportToDatabase = async (reportData) => {
  // In a real implementation, this would save to a database
  // For now, we'll just log it more persistently
  
  try {
    // Format the report data for storage
    const reportForStorage = {
      ...reportData,
      savedAt: new Date().toISOString(),
      status: 'saved_as_fallback'
    };
    
    // Here we would typically use a database SDK to save the data
    // Example: await db.collection('reports').add(reportForStorage);
    
    // For now, create a more substantial log
    log.info('REPORT_FALLBACK_STORAGE: Report saved as fallback', reportForStorage);
    
    // Log the full report data to console for backup purposes
    console.log('================ FALLBACK REPORT STORAGE ================');
    console.log(JSON.stringify(reportForStorage, null, 2));
    console.log('=======================================================');
    
    return true;
  } catch (storageError) {
    log.error('Failed to save report in fallback storage:', storageError);
    return false;
  }
};

module.exports = async function handler(request, response) {
  // Track email sending status for response
  let emailSent = false;
  let emailError = null;
  let fallbackSaved = false;
  
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  console.log(`[API /api/send-report] [${requestId}] Request received at ${new Date().toISOString()}`);
  
  try {
    // Log all request details for debugging
    console.log(`[API /api/send-report] [${requestId}] Request details:`, {
      method: request.method,
      url: request.url,
      headers: JSON.stringify(request.headers).substring(0, 200) + '...',
      bodyType: typeof request.body
    });

    // Only accept POST requests
    if (request.method !== 'POST') {
      console.log(`[API /api/send-report] [${requestId}] Invalid method:`, request.method);
      return response.status(405).json({ 
        error: 'Method not allowed', 
        message: 'Only POST requests are accepted' 
      });
    }

    // Validate request body
    if (!request.body) {
      console.log(`[API /api/send-report] [${requestId}] Request body is missing completely`);
      return response.status(400).json({
        error: 'Bad request',
        message: 'Request body is missing'
      });
    }

    const { reportData } = request.body;
    
    console.log(`[API /api/send-report] [${requestId}] Report data present:`, !!reportData);
    
    if (!reportData) {
      console.log(`[API /api/send-report] [${requestId}] Missing reportData in request body. Body:`, 
        JSON.stringify(request.body).substring(0, 200));
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Missing report data in request body',
        receivedBody: JSON.stringify(request.body).substring(0, 100)
      });
    }

    console.log(`[API /api/send-report] [${requestId}] Got valid report with type:`, reportData.reportType);
    
    // Extract report details
    const {
      reportType,
      description,
      contentId,
      contentType,
      contentPreview,
      userEmail,
      claimData,
      verdict,
      explanation
    } = reportData;

    // Assign a unique ID to this report
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    reportData.reportId = reportId;

    // Create plain text email content
    const emailSubject = `TruthShield Report: ${reportType} - ${contentId}`;
    
    const emailPlainText = `
Report Details:
--------------
Report Type: ${reportType}
Content ID: ${contentId}
Content Type: ${contentType}
User Email: ${userEmail || 'Anonymous'}
Timestamp: ${new Date().toISOString()}
Report ID: ${reportId}

Description from user:
${description || 'No description provided'}

Content being reported:
-----------------------
Claim: ${claimData || contentPreview || 'Not provided'}
Verdict: ${verdict || 'Not provided'}

Explanation:
${explanation || 'Not provided'}

This report has been logged in the system.
`;

    // Create HTML version of the email
    const emailHtml = createHtmlEmailContent({...reportData, reportId});

    // Attempt to send email
    try {
      console.log(`[API /api/send-report] [${requestId}] Initializing email transport`);
      const transporter = await createTransporter();
      
      if (transporter) {
        // Define email options
        const mailOptions = {
          from: EMAIL_FROM,
          to: EMAIL_TO,
          replyTo: userEmail || EMAIL_FROM,
          subject: emailSubject,
          text: emailPlainText,
          html: emailHtml
        };

        console.log(`[API /api/send-report] [${requestId}] Attempting to send email to:`, EMAIL_TO);
        
        // Send the email with proper error handling
        try {
          const info = await transporter.sendMail(mailOptions);
          
          emailSent = true;
          console.log(`[API /api/send-report] [${requestId}] Email sent successfully:`, {
            messageId: info.messageId,
            response: info.response,
            to: EMAIL_TO
          });
        } catch (sendError) {
          // Capture specific sending error
          console.error(`[API /api/send-report] [${requestId}] Failed to send email:`, sendError);
          emailError = {
            message: sendError.message,
            code: sendError.code || 'UNKNOWN',
            responseCode: sendError.responseCode || null
          };
          
          // Attempt fallback storage since email failed
          fallbackSaved = await saveReportToDatabase(reportData);
        }
      } else {
        // Email transport isn't available, use fallback
        console.warn(`[API /api/send-report] [${requestId}] Email transport not available. Using fallback storage.`);
        
        // Store report via fallback mechanism
        fallbackSaved = await saveReportToDatabase(reportData);
      }
    } catch (emailSetupError) {
      // Handle error in email setup (outside of the actual sending)
      console.error(`[API /api/send-report] [${requestId}] Error in email setup:`, emailSetupError);
      emailError = {
        message: emailSetupError.message,
        stage: 'setup'
      };
      
      // Attempt fallback storage
      fallbackSaved = await saveReportToDatabase(reportData);
    }

    // Return appropriate response based on email status
    if (emailSent) {
      const responseTime = Date.now() - startTime;
      console.log(`[API /api/send-report] [${requestId}] Success response. Processing time: ${responseTime}ms`);
      
      return response.status(200).json({
        success: true,
        message: 'Report received and email notification sent',
        reportId,
        emailSent: true
      });
    } else {
      // Email wasn't sent but we still processed the report
      const statusCode = fallbackSaved ? 200 : 500;
      const success = fallbackSaved;
      
      const responseTime = Date.now() - startTime;
      console.log(`[API /api/send-report] [${requestId}] Partial/failed response. Processing time: ${responseTime}ms. Success: ${success}`);
      
      return response.status(statusCode).json({
        success,
        message: fallbackSaved 
          ? 'Report received and saved, but email notification could not be sent' 
          : 'Failed to process report completely',
        reportId,
        emailSent: false,
        emailError: emailError || 'Email configuration issue',
        fallbackSaved
      });
    }
  } catch (error) {
    // Handle any unexpected errors in the overall process
    console.error(`[API /api/send-report] [${requestId}] Error processing report submission:`, error);
    
    return formatErrorResponse(
      response, 
      error, 
      'Failed to process report submission. Please try again later.'
    );
  }
} 