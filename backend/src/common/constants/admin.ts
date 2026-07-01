// Admin access is allowlist-based — there is no role column. ADMIN_EMAILS is a
// comma-separated list of emails granted the venue-management view. Single
// source of truth for both the guard and the isAdmin flag on /auth/me.
function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().has(email.trim().toLowerCase());
}
