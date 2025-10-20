/**
 * AWS Service Health Monitor
 * Tracks AWS service availability and logs maintenance/outage information
 * For development use only - helps identify when AWS services are down
 */

export type AWSService =
  | 'API_GATEWAY'
  | 'COGNITO'
  | 'LAMBDA'
  | 'DYNAMODB'
  | 'S3'
  | 'BEDROCK';

export type ServiceStatus = 'operational' | 'degraded' | 'down' | 'unknown';

export type ServiceHealthEntry = {
  service: AWSService;
  status: ServiceStatus;
  message: string;
  timestamp: number;
  errorCode?: string;
  errorDetails?: string;
  region?: string;
};

export type MaintenanceLog = {
  timestamp: number;
  service: AWSService;
  event: 'outage_detected' | 'service_recovered' | 'error_logged';
  status: ServiceStatus;
  message: string;
  errorCode?: string;
  region?: string;
};

class AWSServiceHealthMonitor {
  private serviceStatus: Map<AWSService, ServiceHealthEntry> = new Map();
  private maintenanceLogs: MaintenanceLog[] = [];
  private maxLogSize = 100; // Keep last 100 log entries

  /**
   * Log an AWS service error and update service status
   */
  logServiceError(
    service: AWSService,
    error: any,
    region?: string
  ): ServiceStatus {
    const timestamp = Date.now();
    const errorCode = error?.code || error?.name || 'UNKNOWN_ERROR';
    const errorMessage = error?.message || 'Unknown error occurred';

    // Detect service status from error
    const status = this.detectServiceStatus(errorCode, errorMessage);

    // Update service status
    const entry: ServiceHealthEntry = {
      service,
      status,
      message: errorMessage,
      timestamp,
      errorCode,
      errorDetails: JSON.stringify(error, null, 2),
      region,
    };

    const previousStatus = this.serviceStatus.get(service)?.status;
    this.serviceStatus.set(service, entry);

    // Log maintenance event if status changed
    if (previousStatus !== status) {
      this.addMaintenanceLog({
        timestamp,
        service,
        event: status === 'operational' ? 'service_recovered' : 'outage_detected',
        status,
        message: errorMessage,
        errorCode,
        region,
      });

      console.warn(`[AWS Health] ${service} status changed: ${previousStatus} → ${status}`);
    }

    // Always log the error
    this.addMaintenanceLog({
      timestamp,
      service,
      event: 'error_logged',
      status,
      message: errorMessage,
      errorCode,
      region,
    });

    console.error(`[AWS Health] ${service} error:`, {
      status,
      errorCode,
      message: errorMessage,
      region,
    });

    return status;
  }

  /**
   * Detect service status from error code/message
   */
  private detectServiceStatus(errorCode: string, errorMessage: string): ServiceStatus {
    const code = errorCode.toUpperCase();
    const message = errorMessage.toLowerCase();

    // Service completely down
    if (
      code === 'INTERNALFAILURE' ||
      code === 'INTERNALSERVERERROR' ||
      code === 'SERVICEUNAVAILABLE' ||
      message.includes('internal failure') ||
      message.includes('service unavailable') ||
      message.includes('reached max retries')
    ) {
      return 'down';
    }

    // Service degraded
    if (
      code === 'THROTTLINGEXCEPTION' ||
      code === 'REQUESTTIMEOUT' ||
      code === 'TIMEOUT' ||
      message.includes('timeout') ||
      message.includes('throttl') ||
      message.includes('rate limit')
    ) {
      return 'degraded';
    }

    // Authentication/authorization issues (service operational, credentials wrong)
    if (
      code === 'UNAUTHORIZEDEXCEPTION' ||
      code === 'ACCESSDENIED' ||
      code === 'INVALIDTOKEN' ||
      message.includes('unauthorized') ||
      message.includes('access denied')
    ) {
      return 'operational'; // Service is up, auth is the issue
    }

    // Client errors (bad request, not found, etc.) - service is operational
    if (
      code.startsWith('INVALID') ||
      code === 'NOTFOUND' ||
      code === 'BADREQUEST' ||
      message.includes('not found') ||
      message.includes('invalid')
    ) {
      return 'operational';
    }

    return 'unknown';
  }

  /**
   * Mark a service as operational (after successful request)
   */
  markServiceOperational(service: AWSService, region?: string) {
    const previousStatus = this.serviceStatus.get(service)?.status;

    if (previousStatus && previousStatus !== 'operational') {
      const timestamp = Date.now();

      this.serviceStatus.set(service, {
        service,
        status: 'operational',
        message: 'Service recovered',
        timestamp,
        region,
      });

      this.addMaintenanceLog({
        timestamp,
        service,
        event: 'service_recovered',
        status: 'operational',
        message: 'Service is now operational',
        region,
      });

      console.log(`[AWS Health] ✅ ${service} recovered`);
    }
  }

  /**
   * Add a maintenance log entry
   */
  private addMaintenanceLog(log: MaintenanceLog) {
    this.maintenanceLogs.unshift(log); // Add to beginning

    // Keep only last N entries
    if (this.maintenanceLogs.length > this.maxLogSize) {
      this.maintenanceLogs = this.maintenanceLogs.slice(0, this.maxLogSize);
    }
  }

  /**
   * Get current status of a service
   */
  getServiceStatus(service: AWSService): ServiceHealthEntry | null {
    return this.serviceStatus.get(service) || null;
  }

  /**
   * Get all service statuses
   */
  getAllServiceStatuses(): ServiceHealthEntry[] {
    return Array.from(this.serviceStatus.values());
  }

  /**
   * Get maintenance logs
   */
  getMaintenanceLogs(limit?: number): MaintenanceLog[] {
    return limit ? this.maintenanceLogs.slice(0, limit) : [...this.maintenanceLogs];
  }

  /**
   * Get logs for a specific service
   */
  getServiceLogs(service: AWSService, limit?: number): MaintenanceLog[] {
    const serviceLogs = this.maintenanceLogs.filter(log => log.service === service);
    return limit ? serviceLogs.slice(0, limit) : serviceLogs;
  }

  /**
   * Check if any service is currently down
   */
  hasActiveOutages(): boolean {
    return Array.from(this.serviceStatus.values()).some(
      entry => entry.status === 'down' || entry.status === 'degraded'
    );
  }

  /**
   * Get list of services with issues
   */
  getServicesWithIssues(): AWSService[] {
    return Array.from(this.serviceStatus.values())
      .filter(entry => entry.status === 'down' || entry.status === 'degraded')
      .map(entry => entry.service);
  }

  /**
   * Clear all logs (for testing)
   */
  clearLogs() {
    this.maintenanceLogs = [];
  }

  /**
   * Export logs as JSON string
   */
  exportLogsAsJSON(): string {
    return JSON.stringify({
      serviceStatus: Array.from(this.serviceStatus.entries()),
      maintenanceLogs: this.maintenanceLogs,
      timestamp: Date.now(),
    }, null, 2);
  }

  /**
   * Format maintenance log for console output
   */
  formatMaintenanceLog(): string {
    let output = '\n=== AWS Service Maintenance Log ===\n\n';

    // Current service status
    output += 'Current Service Status:\n';
    const statuses = this.getAllServiceStatuses();
    if (statuses.length === 0) {
      output += '  No services tracked yet\n';
    } else {
      statuses.forEach(entry => {
        const statusEmoji =
          entry.status === 'operational' ? '✅' :
          entry.status === 'degraded' ? '⚠️' :
          entry.status === 'down' ? '❌' : '❓';

        output += `  ${statusEmoji} ${entry.service}: ${entry.status.toUpperCase()}\n`;
        if (entry.message) {
          output += `     ${entry.message}\n`;
        }
        if (entry.errorCode) {
          output += `     Error Code: ${entry.errorCode}\n`;
        }
      });
    }

    output += '\nRecent Events:\n';
    const recentLogs = this.getMaintenanceLogs(10);
    if (recentLogs.length === 0) {
      output += '  No events logged\n';
    } else {
      recentLogs.forEach(log => {
        const date = new Date(log.timestamp).toLocaleString();
        const eventEmoji =
          log.event === 'service_recovered' ? '✅' :
          log.event === 'outage_detected' ? '🚨' : '📝';

        output += `  ${eventEmoji} [${date}] ${log.service}: ${log.message}\n`;
      });
    }

    output += '\n=================================\n';
    return output;
  }
}

// Singleton instance
export const awsHealthMonitor = new AWSServiceHealthMonitor();

/**
 * Helper function to wrap API calls and automatically log errors
 */
export async function monitoredAPICall<T>(
  service: AWSService,
  apiCall: () => Promise<T>,
  region?: string
): Promise<T> {
  try {
    const result = await apiCall();
    awsHealthMonitor.markServiceOperational(service, region);
    return result;
  } catch (error) {
    const status = awsHealthMonitor.logServiceError(service, error, region);

    // Enhance error with service status info
    if (error && typeof error === 'object') {
      (error as any).awsServiceStatus = status;
      (error as any).awsService = service;
    }

    throw error;
  }
}

/**
 * Format time ago string
 */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
