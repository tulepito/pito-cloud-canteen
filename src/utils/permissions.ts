import { ensureCurrentUser } from './data';
import type { TCurrentUser } from './types';

export const checkUserIsAdmin = (user: TCurrentUser) => {
  const currentUser = ensureCurrentUser(user);
  return currentUser.attributes.profile.metadata?.isAdmin;
};
