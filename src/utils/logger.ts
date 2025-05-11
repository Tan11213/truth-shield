/**
 * Logger utility for TruthShield application.
 * Provides standardized logging and error reporting.
 */

// Environment variables
const isDev = process.env.NODE_ENV === 'development';
const logLevel = process.env.REACT_APP_LOG_LEVEL || 'info';
// Disable analytics by default until server is set up
const enableAnalytics = false; // process.env.REACT_APP_ENABLE_ANALYTICS !== 'false';
const debugMode = process.env.REACT_APP_DEBUG === 'true';

// API endpoint for centralized logging
// Commented out until server is properly configured
// const LOG_ENDPOINT = process.env.REACT_APP_LOG_API || 'https://api.truthshield.org/logs';
const LOG_ENDPOINT = process.env.REACT_APP_LOG_API || 'http://localhost:3000/api/logs';

/**
 * Custom log levels with numeric values for comparison
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
};

/**
 * Format for error reports
 */
interface ErrorReport {
  message: string;
  stack?: string;
  componentName?: string;
  sessionId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  additionalInfo?: Record<string, any>;
}

// Generate a session ID for this browser session
const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

/**
 * Check if the given log level should be displayed based on configured level
 */
function shouldLog(level: LogLevel): boolean {
  if (isDev || debugMode) return true;
  const configuredLevel = logLevel as LogLevel;
  return LOG_LEVEL_SEVERITY[level] >= LOG_LEVEL_SEVERITY[configuredLevel];
}

/**
 * Log a message with specified level
 */
export const log = (level: LogLevel, message: string, ...args: any[]) => {
  if (shouldLog(level)) {
    const timestamp = new Date().toISOString();
    
    switch (level) {
      case 'info':
        console.info(`[${timestamp}] [INFO]`, message, ...args);
        break;
      case 'warn':
        console.warn(`[${timestamp}] [WARN]`, message, ...args);
        break;
      case 'error':
        console.error(`[${timestamp}] [ERROR]`, message, ...args);
        break;
      case 'debug':
        console.debug(`[${timestamp}] [DEBUG]`, message, ...args);
        break;
    }
  }
  
  // Send analytics for production if enabled
  if (enableAnalytics && !isDev && level !== 'debug') {
    sendLogToServer(level, message, args).catch(err => {
      // Silently fail for logging errors
      console.error('Failed to send log to server:', err);
    });
  }
};

/**
 * Send logs to remote server for analytics
 */
async function sendLogToServer(level: LogLevel, message: string, args: any[]): Promise<void> {
  // Skip if analytics are disabled or development environment
  if (!enableAnalytics || isDev) return;
  
  try {
    const logData = {
      level,
      message,
      data: args.length > 0 ? args : undefined,
      timestamp: new Date().toISOString(),
      sessionId: SESSION_ID,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Temporarily disabled until proper server endpoint is available
    console.debug('[Remote Logging disabled] Would send log data:', logData);
    
    // Commented out actual sending logic until server is ready
    /*
    // Use navigator.sendBeacon for non-blocking logs
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(LOG_ENDPOINT, JSON.stringify(logData));
    } else {
      // Fallback to fetch with keepalive
      fetch(LOG_ENDPOINT, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      }).catch(() => {
        // Ignore errors - we don't want logging to cause issues
      });
    }
    */
  } catch (error) {
    // Silent failure for logging
  }
}

/**
 * Report an error to the backend
 */
export const reportError = async (
  error: Error,
  componentName?: string,
  additionalInfo?: Record<string, any>
): Promise<void> => {
  const errorReport: ErrorReport = {
    message: error.message,
    stack: error.stack,
    componentName,
    sessionId: SESSION_ID,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    additionalInfo
  };
  
  log('error', `Error in ${componentName || 'unknown'}:`, error);
  
  // In development or if analytics disabled, just log to console
  if (isDev || !enableAnalytics) {
    console.group('Error Report (Would be sent in production)');
    console.error(errorReport);
    console.groupEnd();
    return;
  }
  
  // Remote reporting temporarily disabled
  console.debug('[Remote Error Reporting disabled] Would send error:', errorReport);
  
  /*
  // In production, send to reporting endpoint
  try {
    // Use fetch with keepalive to ensure the request completes even during page navigation
    fetch(LOG_ENDPOINT, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...errorReport,
        type: 'error_report'
      })
    }).catch(() => {
      // Ignore any fetch errors
    });
  } catch (reportError) {
    // Handle error in the error reporter (safely fail)
    console.error('Failed to report error:', reportError);
  }
  */
};

/**
 * Creates a timing logger for performance tracking
 */
export const createTimingLogger = (operationName: string) => {
  const startTime = performance.now();
  
  return {
    end: (additionalInfo?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      logger.info(`Timing: ${operationName} completed in ${duration.toFixed(2)}ms`, {
        operation: operationName,
        durationMs: duration,
        ...additionalInfo
      });
      
      // Report performance metrics in production
      if (enableAnalytics && !isDev) {
        sendLogToServer('info', `PERF:${operationName}`, [{ 
          durationMs: duration,
          ...additionalInfo
        }]).catch(() => {});
      }
    }
  };
};

/**
 * Wrapped console methods that are safe to use in production
 */
export const logger = {
  info: (message: string, ...args: any[]) => log('info', message, ...args),
  warn: (message: string, ...args: any[]) => log('warn', message, ...args),
  error: (message: string, ...args: any[]) => log('error', message, ...args),
  debug: (message: string, ...args: any[]) => log('debug', message, ...args),
  reportError,
  timing: createTimingLogger
};

export default logger; 