import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/pageLayout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

import { api } from "~/utils/api";

const SingleRestaurantPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.restaurants.getById.useQuery({ id });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>
          {data.restaurant.title}
        </title>
      </Head>
      <PageLayout>
        <div className="flex flex-col items-center border-b">
          <div>{data.restaurant.id}</div>
          <div>
            {data.restaurant.title}
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper()

  const id = context.params?.id

  if (typeof id !== "string") throw new Error("invalid slug")

  await ssg.restaurants.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id
    },
  }
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking"}
}

export default SingleRestaurantPage;
