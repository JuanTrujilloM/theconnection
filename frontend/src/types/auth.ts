export interface AuthUser {
  id: string;
  email: string;
  cellphone: string;
  isVerified: boolean;
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
