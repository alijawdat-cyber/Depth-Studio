// Simple logger utility for Depth Studio backend
export const logger = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] INFO: ${message}`, data);
    } else {
      console.log(`[${timestamp}] INFO: ${message}`);
    }
  },

  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    if (error) {
      console.error(`[${timestamp}] ERROR: ${message}`, error);
    } else {
      console.error(`[${timestamp}] ERROR: ${message}`);
    }
  },

  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.warn(`[${timestamp}] WARN: ${message}`, data);
    } else {
      console.warn(`[${timestamp}] WARN: ${message}`);
    }
  },

  debug: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.debug(`[${timestamp}] DEBUG: ${message}`, data);
    } else {
      console.debug(`[${timestamp}] DEBUG: ${message}`);
    }
  }
}; 