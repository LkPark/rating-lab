import { useEffect, useState } from "react";
import weaviate from "weaviate-ts-client";
import { Avatar, Text, Title, Paper, Flex } from "@mantine/core";
import Link from "next/link";

const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

export default function Home() {
  const [weaviateReady, setWeaviateReady] = useState(false);
  const [persons, setPersons] = useState([] as any[]);

  useEffect(() => {
    client.schema
      .getter()
      .do()
      .then(async () => {
        setWeaviateReady(true);
      });
  }, []);

  useEffect(() => {
    async function fetch() {
      const resImage = await client.graphql
        .get()
        .withClassName("Person")
        .withFields("image, owner, relationship")
        .do();

      if (!resImage.data.Get.Person) return;

      const imagesNew = resImage.data.Get.Person.filter(
        (person: any) => person.owner
      ).map((person: any) => {
        return {
          image: ["data:image/jpeg;base64,", person.image].join(""),
          owner: person.owner,
          relationship: person.relationship,
        };
      });

      setPersons(imagesNew);
    }

    if (weaviateReady) {
      fetch();
    }
  }, [weaviateReady]);

  return (
    <>
      <Title order={1}>Dashboard</Title>
      <br />
      <br />
      <Flex gap={"lg"}>
        {persons.map((person, index) => {
          return (
            <Link key={index} href={`/relationship/${person.owner}`} passHref>
              <Paper
                radius="md"
                withBorder
                p="lg"
                sx={(theme) => ({
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[8]
                      : theme.white,
                })}
              >
                <Avatar src={person.image} size={120} radius={120} mx="auto" />
                <Text ta="center" fz="lg" weight={500} mt="md">
                  {person.owner}
                </Text>
              </Paper>
            </Link>
          );
        })}
      </Flex>
    </>
  );
}
