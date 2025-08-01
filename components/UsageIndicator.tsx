'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  HardDrive, 
  FileText, 
  Brain, 
  DollarSign,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { lightThemeClasses } from '@/lib/theme/light-theme';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UsageData {
  tier: string;
  usage: {
    filesUploaded: {
      current: number;
      limit: number;
      percentage: number;
    };
    aiSummaries: {
      current: number;
      limit: number;
      percentage: number;
    };
    storage: {
      current: number;
      limit: number;
      percentage: number;
      unit: string;
    };
    aiSpend: {
      current: number;
      limit: number;
      percentage: number;
      unit: string;
    };
  };
  warnings: string[];
}

export function UsageIndicator() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/billing/usage');
      if (!response.ok) throw new Error('Failed to fetch usage');
      const data = await response.json();
      setUsage(data);
    } catch (err) {
      setError('Failed to load usage data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={cn(lightThemeClasses.card.base, "p-6")}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !usage) {
    return null;
  }

  const usageItems = [
    {
      label: 'Storage Used',
      icon: HardDrive,
      data: usage.usage.storage,
      color: 'green'
    },
    {
      label: 'AI Summaries',
      icon: Brain,
      data: usage.usage.aiSummaries,
      color: 'purple'
    },
    {
      label: 'AI Spend',
      icon: DollarSign,
      data: usage.usage.aiSpend,
      color: 'orange'
    }
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-[#6366F1]';
  };

  const formatLimit = (limit: number, unit?: string) => {
    if (limit === -1) return 'Unlimited';
    if (limit === 0) return 'Not available';
    return `${limit}${unit || ''}`;
  };

  return (
    <Card className={cn(lightThemeClasses.card.base, "p-6")}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
        <span className="text-sm text-gray-600">
          {usage.tier.charAt(0).toUpperCase() + usage.tier.slice(1)} Plan
        </span>
      </div>

      <div className="space-y-4">
        {usageItems.map((item) => {
          const Icon = item.icon;
          const isUnlimited = item.data.limit === -1;
          const isUnavailable = item.data.limit === 0;
          const percentage = isUnlimited ? 0 : item.data.percentage;
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-gray-600">
                  {item.data.current}{(item.data as any).unit || ''} / {formatLimit(item.data.limit, (item.data as any).unit)}
                </span>
              </div>
              {!isUnlimited && !isUnavailable && (
                <Progress 
                  value={percentage} 
                  className="h-2"
                  indicatorClassName={getProgressColor(percentage)}
                />
              )}
              {percentage >= 80 && !isUnlimited && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Approaching limit</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {usage.warnings.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-800">Suspicious Activity Detected</p>
              {usage.warnings.map((warning, i) => (
                <p key={i} className="text-xs text-red-700">{warning}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {usage.tier === 'explorer' && (
        <div className="mt-4 p-3 bg-[#E0E7FF] border border-[#C7D2FE] rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#6366F1]" />
              <p className="text-sm text-gray-700">Need more?</p>
            </div>
            <Link href="/pricing">
              <Button size="sm" className={cn(lightThemeClasses.button.primary, "h-7 text-xs")}>
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}