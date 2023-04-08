import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 Request per 1 minute
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const restaurantsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const restaurants = await ctx.prisma.restaurant.findMany({
      take: 10,
      orderBy: [{createdAt: "desc"}]
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: restaurants.map((restaurant) => restaurant.userId),
        limit: 10,
      })
    ).map(filterUserForClient);

    return restaurants.map(restaurant => {
      const user = users.find(user => user.id === restaurant.userId)
      
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "User for restaurant not found"})

      return {
        restaurant,
        user,
      };
    })
  }),

  create: privateProcedure.input(z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(500),
  })).mutation(async ({ctx, input}) => {
    const userId = ctx.userId;
    const {title, description} = input

    const { success } = await ratelimit.limit(userId)
    if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

    const restaurant = await ctx.prisma.restaurant.create({
      data: {
        userId,
        title,
        description
      }
    })

    return restaurant
  })
});
