import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
  
import { api } from "~/utils/api";

const UserProfilePage: NextPage<{ userId: string }> = ({ userId }) => {
  const { data: user } = api.userProfile.getUserByUserId.useQuery({
    userId,
  });

  if (!user) return <div>404</div>;

  return (
    <>
      <Head>
        <title>
          {user.firstName} {user.lastName}
        </title>
      </Head>
      <PageLayout>
        <div className="flex flex-col items-center border-b">
          <Image
            src={user.profileImageUrl}
            alt={`${user.firstName ?? ""} profile picture`}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>{user.id}</div>
          <div>
            {user.firstName} {user.lastName}
          </div>
        </div>
      </PageLayout>
    </>
  );
};

  import { createServerSideHelpers } from '@trpc/react-query/server';
  import { appRouter } from "~/server/api/root";
import { PageLayout } from "~/components/pageLayout";
  import SuperJSON from "superjson";
import { prisma } from "~/server/db";
import Image from "next/image";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON, // optional - adds superjson serialization
  });

  const userId = context.params?.userId

  if (typeof userId !== "string") throw new Error("invalid slug")

  await ssg.userProfile.getUserByUserId.prefetch({userId})

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userId
    },
  }
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking"}
}

export default UserProfilePage;
