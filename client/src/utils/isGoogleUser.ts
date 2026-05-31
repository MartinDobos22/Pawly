import type { User } from 'firebase/auth';

export function isGoogleUser(user: User): boolean {
  return user.providerData.some((p) => p.providerId === 'google.com');
}
