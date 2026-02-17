// Plan configuration — limits for each subscription tier

export interface PlanLimits {
  maxBooks: number;
  maxFileSizeBytes: number;
  maxMonthlyViews: number;
  customSlug: boolean;
  passwordProtection: boolean;
  removeBranding: boolean;
  customBackground: boolean;
  customDomain: boolean;
  analyticsLevel: 'basic' | 'detailed' | 'detailed_export';
  privateStore: boolean;
  maxMembers: number;
  sharing: boolean;
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
    customDomain: false,
    analyticsLevel: 'basic',
    privateStore: false,
    maxMembers: 0,
    sharing: false,
  },
  basic: {
    maxBooks: 5,
    maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxMonthlyViews: 2_000,
    customSlug: false,
    passwordProtection: false,
    removeBranding: false,
    customBackground: true,
    customDomain: false,
    analyticsLevel: 'basic',
    privateStore: false,
    maxMembers: 0,
    sharing: false,
  },
  pro: {
    maxBooks: 50,
    maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB
    maxMonthlyViews: 50_000,
    customSlug: true,
    passwordProtection: true,
    removeBranding: true,
    customBackground: true,
    customDomain: true,
    analyticsLevel: 'detailed',
    privateStore: true,
    maxMembers: 50,
    sharing: true,
  },
  business: {
    maxBooks: Infinity,
    maxFileSizeBytes: 200 * 1024 * 1024, // 200 MB
    maxMonthlyViews: Infinity,
    customSlug: true,
    passwordProtection: true,
    removeBranding: true,
    customBackground: true,
    customDomain: true,
    analyticsLevel: 'detailed_export',
    privateStore: true,
    maxMembers: Infinity,
    sharing: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLANS[plan] || PLANS.free;
}
