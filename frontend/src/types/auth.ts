export interface AuthUser {
  id: string;
  email: string;
  cellphone: string;
  isVerified: boolean;
  // Derived server-side (User.onboardingCompletedAt != null). Drives the
  // onboarding-vs-dashboard routing for returning users.
  onboardingCompleted: boolean;
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
