import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const restaurantsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.restaurant.findMany();
  }),
});
