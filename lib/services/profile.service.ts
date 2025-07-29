/**
 * Profile service
 * Handles all profile-related operations
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/services/logger.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import type { User as Profile } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ProfileUpdateData {
  study_program?: string;
  degree_type?: string;
  start_year?: number;
  expected_graduation_year?: number;
  country?: string;
  academic_system?: 'gpa' | 'ects' | 'uk_honours' | 'percentage';
  full_name?: string;
  onboarding_completed?: boolean;
}

export class ProfileService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error('Failed to fetch profile', error, {
        action: 'getProfile',
        metadata: { userId }
      });
      return null;
    }
    
    return data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    userEmail: string | undefined,
    updateData: ProfileUpdateData
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    
    logger.info('Updating profile', {
      action: 'updateProfile',
      metadata: { userId, fields: Object.keys(updateData) }
    });
    
    try {
      // First try to update existing profile
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select();

      if (updateError) {
        // If profile doesn't exist, create it
        if (updateError.code === 'PGRST116') { // No rows returned
          logger.info('Profile not found, creating new profile', {
            action: 'createProfile',
            metadata: { userId }
          });
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userEmail,
              ...updateData
            });
            
          if (insertError) {
            logger.error('Failed to create profile', insertError, {
              action: 'createProfile',
              metadata: { userId }
            });
            return { success: false, error: 'Failed to create profile' };
          }
          
          return { success: true };
        }
        
        logger.error('Failed to update profile', updateError, {
          action: 'updateProfile',
          metadata: { userId }
        });
        return { success: false, error: 'Failed to update profile' };
      }
      
      logger.info('Profile updated successfully', {
        action: 'updateProfileSuccess',
        metadata: { userId }
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Unexpected error updating profile', error, {
        action: 'updateProfile',
        metadata: { userId }
      });
      return { success: false, error: ERROR_MESSAGES.GENERIC };
    }
  }

  /**
   * Complete user onboarding
   */
  static async completeOnboarding(userId: string): Promise<boolean> {
    const result = await this.updateProfile(
      userId,
      undefined,
      { onboarding_completed: true }
    );
    
    return result.success;
  }

  /**
   * Get user's subscription status
   */
  static async getSubscriptionStatus(userId: string): Promise<{
    tier: string;
    status: string;
    storage_used: number;
    storage_limit: number;
  } | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      logger.warn('Failed to fetch subscription status', {
        action: 'getSubscriptionStatus',
        metadata: { userId, error: error.message }
      });
      
      // Return default free tier if no subscription found
      return {
        tier: 'explorer',
        status: 'active',
        storage_used: 0,
        storage_limit: 500 * 1024 * 1024 // 500MB
      };
    }
    
    return data;
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    userId: string,
    preferences: Record<string, any>
  ): Promise<boolean> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      logger.error('Failed to update preferences', error, {
        action: 'updatePreferences',
        metadata: { userId }
      });
      return false;
    }
    
    return true;
  }

  /**
   * Delete user profile (for account deletion)
   */
  static async deleteProfile(userId: string): Promise<boolean> {
    const supabase = await createClient();
    
    try {
      // Delete in order due to foreign key constraints
      const tables = [
        'user_preferences',
        'subscriptions',
        'profiles'
      ];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq(table === 'profiles' ? 'id' : 'user_id', userId);
        
        if (error) {
          logger.error(`Failed to delete from ${table}`, error, {
            action: 'deleteProfile',
            metadata: { userId, table }
          });
        }
      }
      
      logger.info('Profile deleted successfully', {
        action: 'deleteProfile',
        metadata: { userId }
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to delete profile', error, {
        action: 'deleteProfile',
        metadata: { userId }
      });
      return false;
    }
  }
}