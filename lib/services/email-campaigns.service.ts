import { createAdminClient } from '@/lib/supabase/admin';
import { UpgradeOpportunity } from './revenue-optimization.service';

export interface EmailCampaign {
  id: string;
  name: string;
  type: 'upgrade' | 'retention' | 'winback' | 'onboarding';
  subject: string;
  content: string;
  targetAudience: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledFor?: Date;
  sentAt?: Date;
  metrics?: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

export class EmailCampaignService {
  private static instance: EmailCampaignService;

  static getInstance(): EmailCampaignService {
    if (!this.instance) {
      this.instance = new EmailCampaignService();
    }
    return this.instance;
  }

  async createUpgradeCampaign(opportunities: UpgradeOpportunity[]): Promise<EmailCampaign> {
    const highValueTargets = opportunities.filter(opp => opp.score >= 80);
    
    const campaign: EmailCampaign = {
      id: `upgrade_${Date.now()}`,
      name: `Upgrade Campaign - ${new Date().toISOString().split('T')[0]}`,
      type: 'upgrade',
      subject: this.generateSubject('upgrade', highValueTargets[0]?.currentTier),
      content: this.generateEmailContent('upgrade', {
        tier: highValueTargets[0]?.suggestedTier || 'scholar'
      }),
      targetAudience: `${highValueTargets.length} high-value users`,
      status: 'draft'
    };

    // Store campaign in database
    await this.saveCampaign(campaign, highValueTargets.map(t => t.userId));

    return campaign;
  }

  private generateSubject(type: string, context?: string): string {
    const subjects = {
      upgrade: {
        explorer: '🚀 Unlock CourseFlow\'s Full Potential - Special Offer Inside',
        scholar: '📚 Ready for Master? Exclusive Upgrade Opportunity'
      },
      retention: '💙 We miss you! Here\'s 20% off your next month',
      winback: '🎁 Come back to CourseFlow - 50% off for 3 months',
      onboarding: '👋 Welcome to CourseFlow! Here\'s how to get started'
    };

    if (type === 'upgrade' && context) {
      return subjects.upgrade[context as keyof typeof subjects.upgrade] || subjects.upgrade.explorer;
    }

    const subject = subjects[type as keyof typeof subjects];
    return typeof subject === 'string' ? subject : 'CourseFlow Update';
  }

  private generateEmailContent(type: string, data: any): string {
    switch (type) {
      case 'upgrade':
        return `
Hi there!

We've noticed you've been making great use of CourseFlow! 🎉

Based on your usage patterns, we think you'd benefit from our ${data.tier === 'master' ? 'Master' : 'Scholar'} plan features:

${data.tier === 'master' ? `
✨ Unlimited AI summaries and analysis
📊 Advanced analytics and insights
👥 Priority support
🚀 Early access to new features
` : `
✨ 50 AI summaries per month
📁 10GB storage
📊 Basic analytics
🎯 Study planning tools
`}

**Special offer**: Upgrade today and get 20% off your first 3 months!

[Upgrade Now] → https://courseflow.app/pricing?utm_source=email&utm_campaign=upgrade

Questions? Just reply to this email.

Best regards,
The CourseFlow Team
        `;

      case 'retention':
        return `
Hi there,

We noticed you haven't been using CourseFlow as much lately. We'd love to help!

Is there something we can improve? We're constantly adding new features based on user feedback.

As a thank you for being a valued member, here's 20% off your next month:

[Claim Discount] → https://courseflow.app/account?discount=RETAIN20

We're here if you need anything!

The CourseFlow Team
        `;

      default:
        return 'Email content';
    }
  }

  async sendCampaign(campaignId: string): Promise<boolean> {
    // In production, integrate with email service (SendGrid, Postmark, etc.)
    const supabase = createAdminClient();

    try {
      // Get campaign and recipients
      const { data: campaign } = await supabase
        .from('email_campaigns')
        .select('*, email_campaign_recipients(user_id)')
        .eq('id', campaignId)
        .single();

      if (!campaign) return false;

      // Simulate sending emails
      const recipients = campaign.email_campaign_recipients || [];
      
      // Update campaign status
      await supabase
        .from('email_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          'metrics.sent': recipients.length
        })
        .eq('id', campaignId);

      // Log send events
      for (const recipient of recipients) {
        await supabase.from('usage_tracking').insert({
          user_id: recipient.user_id,
          metric_type: 'email_sent',
          metric_value: 1,
          metadata: {
            campaign_id: campaignId,
            campaign_type: campaign.type
          }
        });
      }

      return true;

    } catch (error) {
      console.error('Failed to send campaign:', error);
      return false;
    }
  }

  private async saveCampaign(campaign: EmailCampaign, recipientIds: string[]): Promise<void> {
    const supabase = createAdminClient();

    try {
      // Save campaign
      await supabase.from('email_campaigns').insert({
        ...campaign,
        metrics: {
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0
        }
      });

      // Save recipients
      const recipients = recipientIds.map(userId => ({
        campaign_id: campaign.id,
        user_id: userId,
        status: 'pending'
      }));

      if (recipients.length > 0) {
        await supabase.from('email_campaign_recipients').insert(recipients);
      }

    } catch (error) {
      console.error('Failed to save campaign:', error);
    }
  }

  async trackEmailEvent(
    userId: string,
    campaignId: string,
    event: 'opened' | 'clicked' | 'converted'
  ): Promise<void> {
    const supabase = createAdminClient();

    try {
      // Log event
      await supabase.from('usage_tracking').insert({
        user_id: userId,
        metric_type: `email_${event}`,
        metric_value: 1,
        metadata: {
          campaign_id: campaignId,
          timestamp: new Date().toISOString()
        }
      });

      // Update campaign metrics
      const { data: campaign } = await supabase
        .from('email_campaigns')
        .select('metrics')
        .eq('id', campaignId)
        .single();

      if (campaign) {
        const metrics = campaign.metrics || { sent: 0, opened: 0, clicked: 0, converted: 0 };
        metrics[event] = (metrics[event] || 0) + 1;

        await supabase
          .from('email_campaigns')
          .update({ metrics })
          .eq('id', campaignId);
      }

    } catch (error) {
      console.error('Failed to track email event:', error);
    }
  }

  async getRecommendedCampaigns(): Promise<{
    upgrade: number;
    retention: number;
    winback: number;
  }> {
    const supabase = createAdminClient();

    try {
      // Find users who need campaigns
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

      // Upgrade candidates: active free users
      const { count: upgradeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_tier', 'explorer')
        .gte('last_active', thirtyDaysAgo);

      // Retention candidates: paid users who haven't been active
      const { count: retentionCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('subscription_tier', ['scholar', 'master'])
        .lte('last_active', thirtyDaysAgo);

      // Winback candidates: cancelled users
      const { count: winbackCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'canceled')
        .gte('updated_at', sixtyDaysAgo);

      return {
        upgrade: upgradeCount || 0,
        retention: retentionCount || 0,
        winback: winbackCount || 0
      };

    } catch (error) {
      console.error('Failed to get campaign recommendations:', error);
      return { upgrade: 0, retention: 0, winback: 0 };
    }
  }
}