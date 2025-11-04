export type CurrentUser = {
  id: string;
  email: string | null;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
};

export type CurrentUserSnapshot =
  | { status: "authenticated"; user: CurrentUser }
  | { status: "unauthenticated"; user: null }
  | { status: "loading"; user: CurrentUser | null };

export type CurrentUserContextValue = CurrentUserSnapshot & {
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type UserRole = 'advertiser' | 'influencer';

export type VerificationStatus = 'pending' | 'verified' | 'failed';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserConsent {
  id: string;
  userId: string;
  consentType: 'terms_of_service' | 'privacy_policy' | 'marketing';
  agreed: boolean;
  agreedAt: string;
}
