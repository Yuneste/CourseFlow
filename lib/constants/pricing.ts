export const PRICING_PLANS = [
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Perfect for individual students',
    features: [
      '5GB storage space',
      '100 AI summaries/month',
      'Unlimited courses',
      'Join up to 5 study groups',
      'Document annotation',
      'Progress tracking'
    ],
    prices: {
      monthly: {
        amount: 10,
        currency: '€',
        period: 'month',
        stripePriceId: process.env.NODE_ENV === 'development' ? 'price_test_scholar_monthly' : 'price_live_scholar_monthly',
        paymentLink: process.env.NODE_ENV === 'development' 
          ? 'https://buy.stripe.com/test_dRmeVdc3ucf2cgl2fn9sk00'
          : 'https://buy.stripe.com/live_scholar_monthly' // TODO: Add production link
      },
      yearly: {
        amount: 96,
        currency: '€',
        period: 'year',
        stripePriceId: process.env.NODE_ENV === 'development' ? 'price_test_scholar_yearly' : 'price_live_scholar_yearly',
        paymentLink: process.env.NODE_ENV === 'development'
          ? 'https://buy.stripe.com/test_28E6oH3wYfrecgl9HP9sk01'
          : 'https://buy.stripe.com/live_scholar_yearly', // TODO: Add production link
        savings: '20% off'
      }
    }
  },
  {
    id: 'master',
    name: 'Master',
    description: 'For power users and study groups',
    features: [
      '50GB storage space',
      '500 AI summaries/month',
      'Unlimited courses',
      'Create unlimited study groups',
      'Priority AI processing',
      'Advanced analytics',
      'Export to any format',
      'Priority support'
    ],
    popular: true,
    prices: {
      monthly: {
        amount: 25,
        currency: '€',
        period: 'month',
        stripePriceId: process.env.NODE_ENV === 'development' ? 'price_test_master_monthly' : 'price_live_master_monthly',
        paymentLink: process.env.NODE_ENV === 'development'
          ? 'https://buy.stripe.com/test_aFa4gzgjK0wk6W16vD9sk02'
          : 'https://buy.stripe.com/live_master_monthly' // TODO: Add production link
      },
      yearly: {
        amount: 240,
        currency: '€',
        period: 'year',
        stripePriceId: process.env.NODE_ENV === 'development' ? 'price_test_master_yearly' : 'price_live_master_yearly',
        paymentLink: process.env.NODE_ENV === 'development'
          ? 'https://buy.stripe.com/test_8x23cv9Vmdj6eot1bj9sk03'
          : 'https://buy.stripe.com/live_master_yearly', // TODO: Add production link
        savings: '20% off'
      }
    }
  }
];

export const FREE_PLAN = {
  id: 'explorer',
  name: 'Explorer',
  description: 'Get started for free',
  features: [
    '500MB storage space',
    '10 AI summaries/month',
    'Up to 3 courses',
    'Join 1 study group',
    'Basic file organization'
  ],
  prices: {
    monthly: {
      amount: 0,
      currency: '€',
      period: 'month'
    }
  }
};