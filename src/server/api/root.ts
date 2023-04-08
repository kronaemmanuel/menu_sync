import { createTRPCRouter } from "~/server/api/trpc";
import { restaurantsRouter } from "./routers/restaurants";
import { userProfileRouter } from "./routers/userProfile";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  restaurants: restaurantsRouter,
  userProfile: userProfileRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
