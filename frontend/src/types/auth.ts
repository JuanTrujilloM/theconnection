export interface AuthUser {
  id: string;
  email: string;
  cellphone: string;
  isVerified: boolean;
  // Derived server-side (User.onboardingCompletedAt != null). Drives the
  // onboarding-vs-dashboard routing for returning users.
  onboardingCompleted: boolean;
  // Allowlist-derived (ADMIN_EMAILS); gates the admin venue-management view.
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  email: string;
  cellphone: string;
}

export interface VerifyPayload {
  email: string;
  code: string;
}
