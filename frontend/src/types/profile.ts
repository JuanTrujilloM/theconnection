// A photo in the profile form. New photos carry a `file` to upload; photos
// already saved on the server are referenced by `url` only (no `file`).
export interface ProfilePhoto {
  id: string;
  url: string;
  file?: File;
}

// Shape returned by GET /profile/me (used to pre-fill the edit form).
export interface ProfilePhotoResponse {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface ProfileResponse {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  height: number;
  biography: string;
  university: string;
  major: string;
  semester: string;
  availability: string;
  photos: ProfilePhotoResponse[];
}
