// In-memory metrics storage (use Redis in production)
const metricsStore = {
  startTime: Date.now(),
  requests: new Map<string, { count: number; errors: number; totalTime: number }>(),
  customMetrics: new Map<string, number>(),
};

// Export functions for updating metrics
export function recordRequest(endpoint: string, responseTime: number, error: boolean = false) {
  const current = metricsStore.requests.get(endpoint) || { count: 0, errors: 0, totalTime: 0 };
  current.count++;
  current.totalTime += responseTime;
  if (error) current.errors++;
  metricsStore.requests.set(endpoint, current);
}

export function recordCustomMetric(name: string, value: number) {
  metricsStore.customMetrics.set(name, value);
}

export function incrementCustomMetric(name: string, increment: number = 1) {
  const current = metricsStore.customMetrics.get(name) || 0;
  metricsStore.customMetrics.set(name, current + increment);
}

export function getMetricsStore() {
  return metricsStore;
}