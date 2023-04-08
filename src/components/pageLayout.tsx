import type { PropsWithChildren } from "react"

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex justify-center">
      <div className="h-full w-full border md:max-w-2xl">
          {props.children}
      </div>
    </main>
  );
}