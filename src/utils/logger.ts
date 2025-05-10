/**
 * Logger utility for TruthShield application.
 * Provides standardized logging and error reporting.
 */

// Environment check
const isDev = process.env.NODE_ENV === 'development';

// In a production app, you might want to integrate with a service like Sentry, LogRocket, etc.
const REPORT_ENDPOINT = 'https://api.truthshield.org/logs';

/**
 * Custom log levels
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Format for error reports
 */
interface ErrorReport {
  message: string;
  stack?: string;
  componentName?: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  additionalInfo?: Record<string, any>;
}

/**
 * Log a message with specified level
 */
export const log = (level: LogLevel, message: string, ...args: any[]) => {
  if (isDev || level === 'error') {
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
        if (isDev) {
          console.debug(`[${timestamp}] [DEBUG]`, message, ...args);
        }
        break;
    }
  }
};

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
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    additionalInfo
  };
  
  log('error', `Error in ${componentName || 'unknown'}:`, error);
  
  // In development, just log to console
  if (isDev) {
    console.group('Error Report (Would be sent in production)');
    console.error(errorReport);
    console.groupEnd();
    return;
  }
  
  // In production, send to reporting endpoint
  try {
    // Mock implementation - in a real app, replace with actual API call
    // await axios.post(REPORT_ENDPOINT, errorReport);
    
    // For now, just log to console that it would be reported
    console.info('Error report sent to server', { endpoint: REPORT_ENDPOINT });
  } catch (reportError) {
    // Handle error in the error reporter (log locally if remote logging fails)
    console.error('Failed to report error:', reportError);
  }
};

/**
 * Wrapped console methods that are safe to use in production
 */
export const logger = {
  info: (message: string, ...args: any[]) => log('info', message, ...args),
  warn: (message: string, ...args: any[]) => log('warn', message, ...args),
  error: (message: string, ...args: any[]) => log('error', message, ...args),
  debug: (message: string, ...args: any[]) => log('debug', message, ...args),
  reportError
};

export default logger; 