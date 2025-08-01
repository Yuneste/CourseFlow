import { createAdminClient } from '@/lib/supabase/admin';

export interface AbusePattern {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  window: number; // milliseconds
  action: 'warn' | 'throttle' | 'block' | 'ban';
}

// Abuse patterns to detect
export const ABUSE_PATTERNS: AbusePattern[] = [
  {
    type: 'rapid_file_upload',
    severity: 'medium',
    threshold: 50, // 50 files
    window: 60 * 1000, // 1 minute
    action: 'throttle'
  },
  {
    type: 'excessive_ai_usage',
    severity: 'high',
    threshold: 100, // 100 AI calls
    window: 60 * 60 * 1000, // 1 hour
    action: 'block'
  },
  {
    type: 'account_creation_spam',
    severity: 'critical',
    threshold: 5, // 5 accounts
    window: 60 * 60 * 1000, // 1 hour (same IP)
    action: 'ban'
  },
  {
    type: 'failed_payment_attempts',
    severity: 'high',
    threshold: 10, // 10 failed payments
    window: 24 * 60 * 60 * 1000, // 24 hours
    action: 'block'
  },
  {
    type: 'api_scraping',
    severity: 'high',
    threshold: 1000, // 1000 requests
    window: 60 * 1000, // 1 minute
    action: 'ban'
  },
  {
    type: 'storage_abuse',
    severity: 'medium',
    threshold: 5 * 1024 * 1024 * 1024, // 5GB
    window: 24 * 60 * 60 * 1000, // 24 hours
    action: 'throttle'
  }
];

export interface AbuseDetectionResult {
  abusive: boolean;
  patterns: Array<{
    type: string;
    severity: string;
    action: string;
    details: string;
  }>;
  riskScore: number; // 0-100
  recommendations: string[];
}

// Detect abuse patterns for a user
export async function detectAbusePatterns(userId: string): Promise<AbuseDetectionResult> {
  const supabase = createAdminClient();
  const detectedPatterns: AbuseDetectionResult['patterns'] = [];
  let riskScore = 0;
  const recommendations: string[] = [];

  try {
    // Get user's recent activity
    const now = Date.now();
    
    for (const pattern of ABUSE_PATTERNS) {
      const startTime = new Date(now - pattern.window).toISOString();
      
      let count = 0;
      
      switch (pattern.type) {
        case 'rapid_file_upload': {
          const { count: fileCount } = await supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', startTime);
          count = fileCount || 0;
          break;
        }
        
        case 'excessive_ai_usage': {
          const { count: aiCount } = await supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', startTime);
          count = aiCount || 0;
          break;
        }
        
        case 'failed_payment_attempts': {
          const { count: failureCount } = await supabase
            .from('usage_tracking')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('metric_type', 'payment_failed')
            .gte('created_at', startTime);
          count = failureCount || 0;
          break;
        }
        
        case 'storage_abuse': {
          const { data: files } = await supabase
            .from('files')
            .select('file_size')
            .eq('user_id', userId)
            .gte('created_at', startTime);
          
          count = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
          break;
        }
      }
      
      // Check if pattern threshold is exceeded
      if (count >= pattern.threshold) {
        detectedPatterns.push({
          type: pattern.type,
          severity: pattern.severity,
          action: pattern.action,
          details: `${count} occurrences in ${pattern.window / 1000}s (threshold: ${pattern.threshold})`
        });
        
        // Calculate risk score
        switch (pattern.severity) {
          case 'low': riskScore += 10; break;
          case 'medium': riskScore += 25; break;
          case 'high': riskScore += 40; break;
          case 'critical': riskScore += 60; break;
        }
      }
    }
    
    // Additional behavioral checks
    const behavioralRisk = await checkBehavioralRisk(userId);
    riskScore += behavioralRisk;
    
    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);
    
    // Generate recommendations
    if (riskScore >= 80) {
      recommendations.push('Immediate account suspension recommended');
      recommendations.push('Manual review required');
    } else if (riskScore >= 60) {
      recommendations.push('Temporary API rate limiting');
      recommendations.push('Disable high-cost features');
    } else if (riskScore >= 40) {
      recommendations.push('Monitor account closely');
      recommendations.push('Send warning email');
    }
    
    return {
      abusive: riskScore >= 60,
      patterns: detectedPatterns,
      riskScore,
      recommendations
    };
    
  } catch (error) {
    console.error('Abuse detection failed:', error);
    return {
      abusive: false,
      patterns: [],
      riskScore: 0,
      recommendations: ['Unable to perform abuse detection']
    };
  }
}

// Check for behavioral risk indicators
async function checkBehavioralRisk(userId: string): Promise<number> {
  const supabase = createAdminClient();
  let riskScore = 0;
  
  try {
    // Check account age
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at, email')
      .eq('id', userId)
      .single();
    
    if (profile) {
      const accountAge = Date.now() - new Date(profile.created_at).getTime();
      const daysSinceCreation = accountAge / (24 * 60 * 60 * 1000);
      
      // New accounts are higher risk
      if (daysSinceCreation < 1) riskScore += 20;
      else if (daysSinceCreation < 7) riskScore += 10;
      
      // Check for suspicious email patterns
      const email = profile.email.toLowerCase();
      if (email.includes('temp') || email.includes('disposable')) {
        riskScore += 15;
      }
    }
    
    // Check for unusual usage patterns
    const { data: recentFiles } = await supabase
      .from('files')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (recentFiles && recentFiles.length > 10) {
      // Check for burst patterns (many files uploaded within seconds)
      let burstCount = 0;
      for (let i = 1; i < recentFiles.length; i++) {
        const timeDiff = new Date(recentFiles[i-1].created_at).getTime() - 
                        new Date(recentFiles[i].created_at).getTime();
        if (timeDiff < 1000) { // Less than 1 second between uploads
          burstCount++;
        }
      }
      
      if (burstCount > 20) riskScore += 15;
    }
    
  } catch (error) {
    console.error('Behavioral risk check failed:', error);
  }
  
  return riskScore;
}

// Apply abuse prevention actions
export async function applyAbusePrevention(
  userId: string,
  action: 'warn' | 'throttle' | 'block' | 'ban'
): Promise<boolean> {
  const supabase = createAdminClient();
  
  try {
    switch (action) {
      case 'warn':
        // Log warning
        await supabase.from('usage_tracking').insert({
          user_id: userId,
          metric_type: 'abuse_warning',
          metric_value: 1,
          metadata: { timestamp: new Date().toISOString() }
        });
        break;
        
      case 'throttle':
        // Apply temporary rate limiting
        await supabase.from('profiles').update({
          rate_limit_until: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        }).eq('id', userId);
        break;
        
      case 'block':
        // Block access to certain features
        await supabase.from('profiles').update({
          feature_flags: { ai_blocked: true, uploads_blocked: true }
        }).eq('id', userId);
        break;
        
      case 'ban':
        // Suspend account
        await supabase.from('profiles').update({
          account_status: 'suspended',
          suspended_at: new Date().toISOString(),
          suspension_reason: 'Abuse detected'
        }).eq('id', userId);
        break;
    }
    
    // Log the action
    await supabase.from('usage_tracking').insert({
      user_id: userId,
      metric_type: `abuse_action_${action}`,
      metric_value: 1,
      metadata: { 
        timestamp: new Date().toISOString(),
        action
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to apply abuse prevention:', error);
    return false;
  }
}

// Cost anomaly detection
export async function detectCostAnomalies(userId: string): Promise<{
  anomalyDetected: boolean;
  estimatedCost: number;
  historicalAverage: number;
  deviationPercentage: number;
}> {
  const supabase = createAdminClient();
  
  try {
    // Get current month's AI usage
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const { data: currentUsage } = await supabase
      .from('ai_usage_logs')
      .select('cost')
      .eq('user_id', userId)
      .gte('created_at', currentMonth.toISOString());
    
    const currentCost = currentUsage?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
    
    // Get historical average (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const { data: historicalUsage } = await supabase
      .from('ai_usage_logs')
      .select('cost, created_at')
      .eq('user_id', userId)
      .gte('created_at', threeMonthsAgo.toISOString())
      .lt('created_at', currentMonth.toISOString());
    
    const monthlyTotals = new Map<string, number>();
    historicalUsage?.forEach(log => {
      const month = new Date(log.created_at).toISOString().slice(0, 7);
      monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + (log.cost || 0));
    });
    
    const historicalAverage = monthlyTotals.size > 0
      ? Array.from(monthlyTotals.values()).reduce((a, b) => a + b, 0) / monthlyTotals.size
      : 0;
    
    // Calculate deviation
    const deviationPercentage = historicalAverage > 0
      ? ((currentCost - historicalAverage) / historicalAverage) * 100
      : 0;
    
    // Anomaly if current cost is 200% higher than average
    const anomalyDetected = deviationPercentage > 200;
    
    return {
      anomalyDetected,
      estimatedCost: currentCost,
      historicalAverage,
      deviationPercentage
    };
    
  } catch (error) {
    console.error('Cost anomaly detection failed:', error);
    return {
      anomalyDetected: false,
      estimatedCost: 0,
      historicalAverage: 0,
      deviationPercentage: 0
    };
  }
}