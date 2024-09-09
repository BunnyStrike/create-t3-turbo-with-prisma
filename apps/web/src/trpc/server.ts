import { cache } from "react";
import { cookies, headers } from "next/headers";
import { createHydrationHelpers } from "@trpc/react-query/rsc";


import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

// import type { AppRouter } from "@acme/api";
// import { createCaller, createTRPCContext } from "@acme/api";
// import { auth } from "@acme/auth";

// import { appRouter, createQueryClient } from "./query-client";
import { appRouter, createTRPCContext } from "@acme/api";
import SuperJSON from "superjson";
import { createTRPCClient, loggerLink, TRPCClientError } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { callProcedure } from "@trpc/server";
import type { TRPCErrorResponse } from "@trpc/server/rpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  const supabase = createServerComponentClient({ cookies });

  return createTRPCContext({
    // session: await auth(),
    headers: heads,
    supabase,
  });
});

// const getQueryClient = cache(createQueryClient);
// const caller = createCaller(createContext);

// export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
//   caller,
//   getQueryClient,
// );




import { httpLink } from '@trpc/client/links/httpLink';

export const api = createTRPCClient<typeof appRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpLink({
      url: '/trpc',
      transformer: SuperJSON,
    }),
    /**
     * Custom RSC link that invokes procedures directly in the server component Don't be too afraid
     * about the complexity here, it's just wrapping `callProcedure` with an observable to make it a
     * valid ending link for tRPC.
     */
    () =>
      ({ op }) =>
        observable((observer) => {
          createContext()
            .then((ctx) => {
              return callProcedure({
                procedures: appRouter._def.procedures,
                path: op.path,
                getRawInput: () => Promise.resolve(op.input),
                ctx,
                type: op.type,
              });
            })
            .then((data) => {
              observer.next({ result: { data } });
              observer.complete();
            })
            .catch((cause: TRPCErrorResponse) => {
              observer.error(TRPCClientError.from(cause));
            });
        }),
  ],
});