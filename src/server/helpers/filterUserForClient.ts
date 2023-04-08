import type { User } from "@clerk/nextjs/dist/api";

export const filterUserForClient = (user: User) => {
  return { 
    id: user.id, 
    firstName: user.firstName, 
    lastName: user.lastName, 
    profileImageUrl: user.profileImageUrl
  };
}
