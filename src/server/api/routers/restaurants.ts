import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return { 
    id: user.id, 
    firstName: user.firstName, 
    lastName: user.lastName, 
    profileImageUrl: user.profileImageUrl
  };
}

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
