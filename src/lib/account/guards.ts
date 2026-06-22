// The user must type exactly DELETE to confirm account deletion.
export function isDeleteConfirmed(input: string | null | undefined): boolean {
  return input === 'DELETE';
}

// An admin may not delete their own account via the admin path (use self-service).
export function canAdminDelete(adminId: string, targetId: string): boolean {
  return adminId !== targetId;
}
