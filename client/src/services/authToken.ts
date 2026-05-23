import { auth } from '../config/firebase';

export async function getAuthHeader(): Promise<Record<string, string>> {
  const currentUser = auth.currentUser;
  if (!currentUser) return {};
  const token = await currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function handleUnauthorized(status: number): Promise<void> {
  if (status === 401) {
    await auth.signOut();
  }
}
