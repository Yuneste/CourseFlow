import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StudentVerificationService } from '@/lib/services/student-verification.service';
import { getStripe } from '@/lib/stripe/client';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify student status
    const verification = await StudentVerificationService.verifyStudentStatus(user.email);

    if (!verification.isStudent) {
      return NextResponse.json({
        verified: false,
        message: verification.message
      });
    }

    // Create a discount coupon in Stripe
    const stripe = getStripe();
    
    // Check if user already has a student discount
    const { data: profile } = await supabase
      .from('profiles')
      .select('student_discount_id')
      .eq('id', user.id)
      .single();

    if (profile?.student_discount_id) {
      return NextResponse.json({
        verified: true,
        message: 'You already have a student discount applied to your account.',
        discountPercent: verification.discountPercent
      });
    }

    // Create a coupon for this student
    const coupon = await stripe.coupons.create({
      percent_off: verification.discountPercent!,
      duration: 'forever',
      name: `Student Discount - ${user.email}`,
      metadata: {
        user_id: user.id,
        email: user.email,
        type: 'student_discount'
      }
    });

    // Create a promotion code
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: verification.discountCode!,
      max_redemptions: 1,
      restrictions: {
        first_time_transaction: true,
      },
      metadata: {
        user_id: user.id,
        email: user.email
      }
    });

    // Store the discount info in the user's profile
    await supabase
      .from('profiles')
      .update({
        student_discount_id: promoCode.id,
        student_verified_at: new Date().toISOString()
      })
      .eq('id', user.id);

    return NextResponse.json({
      verified: true,
      message: verification.message,
      discountCode: verification.discountCode,
      discountPercent: verification.discountPercent
    });
  } catch (error: any) {
    console.error('Student verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify student status' },
      { status: 500 }
    );
  }
}