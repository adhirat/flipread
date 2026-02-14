// Plan configuration — limits for each subscription tier

export interface PlanLimits {
  maxBooks: number;
  maxFileSizeBytes: number;
  maxMonthlyViews: number;
  customSlug: boolean;
  passwordProtection: boolean;
  removeBranding: boolean;
  customBackground: boolean;
  analyticsLevel: 'basic' | 'detailed' | 'detailed_export';
}

export const PLANS: Record<string, PlanLimits> = {
  free: {
    maxBooks: 1,
    maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
    maxMonthlyViews: 500,
    customSlug: false,
    passwordProtection: false,
    removeBranding: false,
    customBackground: false,
    analyticsLevel: 'basic',
  },
  basic: {
    maxBooks: 2,
    maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxMonthlyViews: 2_000,
    customSlug: false,
    passwordProtection: false,
    removeBranding: false,
    customBackground: true,
    analyticsLevel: 'basic',
  },
  pro: {
    maxBooks: 25,
    maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB
    maxMonthlyViews: 50_000,
    customSlug: true,
    passwordProtection: true,
    removeBranding: true,
    customBackground: true,
    analyticsLevel: 'detailed',
  },
  business: {
    maxBooks: Infinity,
    maxFileSizeBytes: 200 * 1024 * 1024, // 200 MB
    maxMonthlyViews: Infinity,
    customSlug: true,
    passwordProtection: true,
    removeBranding: true,
    customBackground: true,
    analyticsLevel: 'detailed_export',
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLANS[plan] || PLANS.free;
}
