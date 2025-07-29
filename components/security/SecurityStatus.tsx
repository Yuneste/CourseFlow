'use client';

import { Shield, ShieldCheck, ShieldAlert, Lock, Unlock, Key, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SecurityScore {
  score: number;
  maxScore: number;
  factors: {
    name: string;
    status: 'good' | 'warning' | 'error';
    description: string;
    action?: () => void;
  }[];
}

interface SecurityStatusProps {
  score: SecurityScore;
  className?: string;
}

export function SecurityStatus({ score, className }: SecurityStatusProps) {
  const percentage = (score.score / score.maxScore) * 100;
  
  const getStatusColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (percentage >= 80) return <ShieldCheck className="h-6 w-6" />;
    if (percentage >= 60) return <Shield className="h-6 w-6" />;
    return <ShieldAlert className="h-6 w-6" />;
  };

  const getStatusLabel = () => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-gray-100 dark:bg-gray-800', getStatusColor())}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Security Score</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getStatusLabel()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={cn('text-2xl font-bold', getStatusColor())}>
            {score.score}/{score.maxScore}
          </div>
          <p className="text-xs text-gray-500">points</p>
        </div>
      </div>

      <Progress value={percentage} className="mb-6" />

      <div className="space-y-3">
        {score.factors.map((factor, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'mt-0.5',
                factor.status === 'good' && 'text-green-600',
                factor.status === 'warning' && 'text-yellow-600',
                factor.status === 'error' && 'text-red-600'
              )}>
                {factor.status === 'good' ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : factor.status === 'warning' ? (
                  <Shield className="h-5 w-5" />
                ) : (
                  <ShieldAlert className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{factor.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {factor.description}
                </p>
              </div>
            </div>
            {factor.action && (
              <Button
                size="sm"
                variant="ghost"
                onClick={factor.action}
                className="text-xs"
              >
                Fix
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// Two-factor authentication setup
interface TwoFactorSetupProps {
  enabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
  className?: string;
}

export function TwoFactorSetup({
  enabled,
  onEnable,
  onDisable,
  className
}: TwoFactorSetupProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            enabled
              ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          )}>
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {enabled
                ? 'Your account is protected with 2FA'
                : 'Add an extra layer of security to your account'}
            </p>
          </div>
        </div>
        <Button
          variant={enabled ? 'outline' : 'default'}
          size="sm"
          onClick={enabled ? onDisable : onEnable}
        >
          {enabled ? 'Disable' : 'Enable'}
        </Button>
      </div>
    </Card>
  );
}

// Active sessions display
interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

interface ActiveSessionsProps {
  sessions: Session[];
  onRevokeSession: (sessionId: string) => void;
  className?: string;
}

export function ActiveSessions({
  sessions,
  onRevokeSession,
  className
}: ActiveSessionsProps) {
  return (
    <Card className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-gray-400">
                {session.current ? (
                  <Lock className="h-5 w-5 text-green-600" />
                ) : (
                  <Unlock className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {session.device}
                  {session.current && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Current
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {session.location} • Last active {' '}
                  {session.lastActive.toLocaleDateString()}
                </p>
              </div>
            </div>
            {!session.current && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRevokeSession(session.id)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Revoke
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// Security activity log
interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'settings_change' | 'failed_login';
  description: string;
  timestamp: Date;
  ip?: string;
  device?: string;
}

interface SecurityActivityProps {
  events: SecurityEvent[];
  className?: string;
}

export function SecurityActivity({ events, className }: SecurityActivityProps) {
  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return <Lock className="h-4 w-4 text-green-600" />;
      case 'logout':
        return <Unlock className="h-4 w-4 text-gray-400" />;
      case 'password_change':
        return <Key className="h-4 w-4 text-blue-600" />;
      case 'settings_change':
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case 'failed_login':
        return <ShieldAlert className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Security Activity</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="mt-0.5">{getEventIcon(event.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{event.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {event.timestamp.toLocaleString()}
                {event.ip && ` • ${event.ip}`}
                {event.device && ` • ${event.device}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}