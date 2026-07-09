// Response shapes for the admin panel (GET /admin/*). Mirror of AdminService.

export interface AdminUserProfile {
  name: string;
  age: number;
  gender: string;
  university: string;
  major: string;
  semester: string;
  status: string; // SEARCHING | PAUSED
}

export interface AdminUser {
  id: string;
  email: string;
  cellphone: string;
  isVerified: boolean;
  createdAt: string;
  matchCount: number;
  profile: AdminUserProfile | null;
}

export interface AdminMatchPartner {
  id: string;
  name: string;
  university: string;
}

export interface AdminMatchDate {
  scheduledAt: string;
  status: string;
  venueName: string;
}

export interface AdminMatch {
  id: string;
  status: string; // pending | confirmed | completed | canceled
  compatibilityScore: number;
  createdAt: string;
  userA: AdminMatchPartner;
  userB: AdminMatchPartner;
  date: AdminMatchDate | null;
}

export interface AdminFeedback {
  id: string;
  occurred: boolean;
  rating: number | null;
  comments: string | null;
  noShowReason: string | null;
  amountSpent: number | null;
  createdAt: string;
  userName: string;
  venueName: string;
  scheduledAt: string;
}

export interface AdminReport {
  id: string;
  createdAt: string;
  reporter: AdminMatchPartner;
  reported: AdminMatchPartner;
}

// --- Match detail (comparison view) ---

export interface AdminPreferences {
  relationshipType: string;
  orientation: string;
  minAge: number;
  maxAge: number;
  genderInterest: string;
  sameUniversity: boolean;
  heightRange: string;
  energyVibe: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  isVerified: boolean;
  name: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  biography: string | null;
  university: string | null;
  major: string | null;
  semester: string | null;
  status: string | null;
  primaryPhoto: string | null;
  photos: string[];
  hobbies: string[];
  preferences: AdminPreferences | null;
}

export interface AdminAvailabilitySlot {
  date: string;
  timeSlot: string;
}

export interface AdminVenueOption {
  venueName: string;
  type: string;
  userASelected: boolean;
  userBSelected: boolean;
}

export interface AdminMatchFeedback {
  userName: string;
  occurred: boolean;
  rating: number | null;
  comments: string | null;
  noShowReason: string | null;
  amountSpent: number | null;
}

export interface AdminMatchDetail {
  id: string;
  status: string;
  compatibilityScore: number;
  createdAt: string;
  updatedAt: string;
  userA: AdminUserDetail;
  userB: AdminUserDetail;
  sharedHobbies: string[];
  venueOptions: AdminVenueOption[];
  availability: {
    userA: AdminAvailabilitySlot[];
    userB: AdminAvailabilitySlot[];
  };
  date: {
    venueName: string;
    address: string;
    scheduledAt: string;
    status: string;
  } | null;
  feedback: AdminMatchFeedback[];
}
