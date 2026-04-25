import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { UsersApiService } from "@/lib/api-services";

const STORAGE_PREFIX = "userNameSynced:";

/**
 * Once per signed-in session, push the user's Clerk display name to the
 * backend `users` collection so other parts of the app (e.g. host name on
 * public trip cards) can resolve names by user_id.
 */
export const useUserNameSync = () => {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const candidateName =
      user.username ||
      user.fullName ||
      user.firstName ||
      user.primaryEmailAddress?.emailAddress;

    if (!candidateName) return;

    const storageKey = `${STORAGE_PREFIX}${user.id}`;
    const previouslySynced = sessionStorage.getItem(storageKey);
    if (previouslySynced === candidateName) return;

    UsersApiService.syncUserName(user.id, candidateName)
      .then(() => {
        sessionStorage.setItem(storageKey, candidateName);
      })
      .catch((err) => {
        console.error("Failed to sync user name:", err);
      });
  }, [isSignedIn, user]);
};
