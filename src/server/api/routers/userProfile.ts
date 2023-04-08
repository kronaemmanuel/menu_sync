import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const userProfileRouter = createTRPCRouter({
  getUserByUserId: publicProcedure.input(z.object({ userId: z.string() })).query(
    async ({ input}) => {
      const user = await clerkClient.users.getUser(input.userId)

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found"
        })
      }

      return filterUserForClient(user)
    }
  )
});
