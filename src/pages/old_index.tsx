import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/pageLayout";

const CreateRestaurantWizard = () => {
  const {user} = useUser();

  const ctx = api.useContext()

  const { mutate, isLoading: isCreating } = api.restaurants.create.useMutation({
    onSuccess: () => {
      setTitle("")
      setDescription("")
      void ctx.restaurants.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessages = e.data?.zodError?.fieldErrors
      if (errorMessages) {
        if (errorMessages.title && errorMessages.title[0]) {
          toast.error(`Title: ${errorMessages.title[0]}`);
        }
        if (errorMessages.description && errorMessages.description[0]) {
          toast.error(`Description: ${errorMessages.description[0]}`);
        }
      } else {
        toast.error("Failed to create")
      }
    }
  });
  
  const [ title, setTitle ] = useState("")
  const [ description, setDescription ] = useState("")

  if (!user) return <div>User not found!</div>;

  return (
    <div className="mt-4">
      <h3>Add New Restaurant:</h3>
      <div className="flex space-x-4">
        <label>Title:</label>
        <input
          placeholder="Enter Name"
          className="text-gray-800"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCreating}
        />
      </div>
      <div className="flex space-x-4">
        <label>Description:</label>
        <input
          placeholder="Enter Description"
          className="text-gray-800"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isCreating}
        />
      </div>
      <div className="p-2">
        {title !== "" && description !== "" && !isCreating && (
          <button
            className="rounded-md bg-white text-gray-800"
            onClick={() => mutate({ title, description })}
          >
            Submit
          </button>
        )}
        {isCreating && <LoadingSpinner size={20} />}
      </div>
    </div>
  );
}

type RestaurantWithUser = RouterOutputs["restaurants"]["getAll"][number]

const RestaurantView = (props: RestaurantWithUser ) => {
  const {restaurant, user} = props
  return (
    <div className="py-2" key={restaurant.id}>
      <Link href={`/restaurant/${restaurant.id}`}>
        <h2 className="text-xl font-semibold">{restaurant.title}</h2>
      </Link>
      <p>{restaurant.description}</p>
      <div className="flex gap-2">
        <Link href={`/profile/${user.id}`}>
          <span>
            {user.firstName} {user.lastName}
          </span>
        </Link>
        <span>·</span>
        <span>{dayjs(restaurant.createdAt).fromNow()}</span>
      </div>
    </div>
  );
};

const RestaurantsList = () => {
  const { data, isLoading: postsLoading } = api.restaurants.getAll.useQuery();

  if (postsLoading) return <LoadingPage/>

  if (!data) return <div>Something went wrong</div>

  return (
    <div className="mt-4">
      {data.map((fullRestaurant) => (
        <RestaurantView
          {...fullRestaurant}
          key={fullRestaurant.restaurant.id}
        />
      ))}
    </div>
  );
}

const Home: NextPage = () => {
  const {isLoaded: userLoaded, isSignedIn}= useUser()

  // Start fetching asap
  api.restaurants.getAll.useQuery();

  // Return empty div if both aren't loaded, since user tends to load faster
  if (!userLoaded) return <div/>

  return (
    <PageLayout>
      <div className="flex justify-end border-b p-4">
        {!isSignedIn && <SignInButton />}
        {!!isSignedIn && <SignOutButton />}
      </div>
      <div className="p-4">
        <h1 className="text-3xl font-bold">Restaurants</h1>
        <CreateRestaurantWizard />
        <RestaurantsList />
      </div>
    </PageLayout>
  );
};

export default Home;
