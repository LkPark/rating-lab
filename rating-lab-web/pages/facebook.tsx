import { useQuery } from "@apollo/client";
import { Title } from "@mantine/core";

import { FacebookProfileTable } from "@/components";
import QUERY_FACEBOOK_TERMS from "api/query/facebook-profile.graphql";

export default function Facebook() {
  const { loading, data } = useQuery(QUERY_FACEBOOK_TERMS);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Title order={1}>Collected Facebook Profiles</Title>
      <br />
      <br />
      <FacebookProfileTable
        data={data?.facebookProfiles.data.map(({ attributes }: any) => {
          return {
            name: attributes.name,
            email: attributes.email,
            dob: attributes.dob,
            picture:
              "http://localhost:1337" + attributes.picture.data.attributes.url,
            album:
              "http://localhost:1337" + attributes.album.data[0].attributes.url,
          };
        })}
      />
    </>
  );
}
