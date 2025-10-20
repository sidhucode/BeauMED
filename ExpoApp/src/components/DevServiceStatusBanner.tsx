/**
 * Dev Service Status Banner
 * Shows AWS service health status for development/debugging
 * Only visible when __DEV__ is true
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView, Modal} from 'react-native';
import {awsHealthMonitor, formatTimeAgo, type AWSService} from '../utils/awsServiceHealth';
import {useTheme} from '../state/ThemeContext';

export default function DevServiceStatusBanner() {
  const {colors} = useTheme();
  const [hasIssues, setHasIssues] = useState(false);
  const [servicesWithIssues, setServicesWithIssues] = useState<AWSService[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [, forceUpdate] = useState(0);

  // Check for service issues every 5 seconds
  useEffect(() => {
    const checkStatus = () => {
      const issues = awsHealthMonitor.hasActiveOutages();
      const services = awsHealthMonitor.getServicesWithIssues();
      setHasIssues(issues);
      setServicesWithIssues(services);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Don't show anything in production
  if (!__DEV__) {
    return null;
  }

  // Don't show banner if no issues
  if (!hasIssues) {
    return null;
  }

  return (
    <>
      <Pressable
        style={[styles.banner, {backgroundColor: colors.error || '#ef4444'}]}
        onPress={() => setShowDetails(true)}
      >
        <Text style={styles.bannerIcon}>⚠️</Text>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>AWS Service Issues Detected</Text>
          <Text style={styles.bannerSubtitle}>
            {servicesWithIssues.join(', ')} • Tap for details
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={[styles.modalContainer, {backgroundColor: colors.background}]}>
          <View style={[styles.modalHeader, {backgroundColor: colors.headerBackground}]}>
            <Text style={[styles.modalTitle, {color: colors.headerText}]}>
              AWS Service Status
            </Text>
            <Pressable onPress={() => setShowDetails(false)}>
              <Text style={[styles.closeButton, {color: colors.headerText}]}>Close</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Current Status */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Current Status</Text>
              {awsHealthMonitor.getAllServiceStatuses().map((entry, index) => {
                const statusColor =
                  entry.status === 'operational' ? '#22c55e' :
                  entry.status === 'degraded' ? '#f59e0b' :
                  entry.status === 'down' ? '#ef4444' : colors.muted;

                const statusIcon =
                  entry.status === 'operational' ? '✅' :
                  entry.status === 'degraded' ? '⚠️' :
                  entry.status === 'down' ? '❌' : '❓';

                return (
                  <View
                    key={index}
                    style={[
                      styles.statusCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.statusHeader}>
                      <Text style={styles.statusIcon}>{statusIcon}</Text>
                      <Text style={[styles.serviceName, {color: colors.text}]}>
                        {entry.service}
                      </Text>
                      <Text style={[styles.statusBadge, {backgroundColor: statusColor}]}>
                        {entry.status.toUpperCase()}
                      </Text>
                    </View>

                    <Text style={[styles.statusMessage, {color: colors.muted}]}>
                      {entry.message}
                    </Text>

                    {entry.errorCode && (
                      <Text style={[styles.errorCode, {color: colors.muted}]}>
                        Error: {entry.errorCode}
                      </Text>
                    )}

                    {entry.region && (
                      <Text style={[styles.region, {color: colors.muted}]}>
                        Region: {entry.region}
                      </Text>
                    )}

                    <Text style={[styles.timestamp, {color: colors.muted}]}>
                      {formatTimeAgo(entry.timestamp)}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Recent Events */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Recent Events</Text>
              {awsHealthMonitor.getMaintenanceLogs(20).map((log, index) => {
                const eventIcon =
                  log.event === 'service_recovered' ? '✅' :
                  log.event === 'outage_detected' ? '🚨' : '📝';

                return (
                  <View
                    key={index}
                    style={[
                      styles.logCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.logHeader}>
                      <Text style={styles.logIcon}>{eventIcon}</Text>
                      <Text style={[styles.logService, {color: colors.text}]}>
                        {log.service}
                      </Text>
                      <Text style={[styles.logTime, {color: colors.muted}]}>
                        {formatTimeAgo(log.timestamp)}
                      </Text>
                    </View>
                    <Text style={[styles.logMessage, {color: colors.muted}]}>
                      {log.message}
                    </Text>
                    {log.errorCode && (
                      <Text style={[styles.logError, {color: colors.muted}]}>
                        {log.errorCode}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Export Logs Button */}
            <View style={styles.section}>
              <Pressable
                style={[styles.exportButton, {backgroundColor: colors.primary}]}
                onPress={() => {
                  console.log(awsHealthMonitor.formatMaintenanceLog());
                  console.log('\nFull JSON Export:\n', awsHealthMonitor.exportLogsAsJSON());
                  alert('Logs exported to console (press Cmd+J or j in Expo terminal)');
                }}
              >
                <Text style={[styles.exportButtonText, {color: colors.primaryText}]}>
                  Export Logs to Console
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    zIndex: 9999,
  },
  bannerIcon: {
    fontSize: 20,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  bannerSubtitle: {
    color: '#ffffff',
    opacity: 0.9,
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 16,
  },
  serviceName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusMessage: {
    fontSize: 12,
    marginBottom: 4,
  },
  errorCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  region: {
    fontSize: 11,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  logCard: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logIcon: {
    fontSize: 14,
  },
  logService: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  logTime: {
    fontSize: 11,
  },
  logMessage: {
    fontSize: 12,
    marginBottom: 2,
  },
  logError: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  exportButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
