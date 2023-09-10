import { ApolloClient, InMemoryCache } from "@apollo/client";

import * as typeDefs from "./schema.graphql";

export function getStrapiURL(path = "") {
  return `${
    process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"
  }${path}`;
}

export const client = new ApolloClient({
  uri: getStrapiURL('/graphql'),
  cache: new InMemoryCache(),
  typeDefs,
});
