import { GraphCanvas, SphereWithIcon } from "reagraph";
import { useEffect, useState } from "react";
import weaviate from "weaviate-ts-client";
import { Title, Flex } from "@mantine/core";

const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

export default function Relationship({ id }) {
  const [weaviateReady, setWeaviateReady] = useState(false);
  const [persons, setPersons] = useState([] as any[]);
  const [owner, setOwner] = useState({} as any);

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
        .withFields("image, owner, relationship, originalImage")
        .do();

      if (!resImage.data.Get.Person) return;

      const ownerImage = resImage.data.Get.Person.filter(
        (person: any) => person.owner === id
      )[0];

      const relations = await client.graphql
        .get()
        .withClassName("Person")
        .withFields(
          "image, owner, relationship, originalImage _additional { certainty }"
        )
        .withNearImage({ image: ownerImage.image, certainty: 0.922 })
        .do();

      if (!relations.data.Get.Person) return;
      //TODO double check 4el without mike
      const relationshipMap = relations.data.Get.Person.filter(
        (person: any) => person.owner !== id && person.relationship !== id
      ).reduce(
        (acc, item) => ({
          ...acc,
          [item.owner || item.relationship]: item,
        }),
        {}
      );

      const imagesNew = Object.entries(relationshipMap).map(
        ([name, person]: any) => {
          return {
            image: ["data:image/jpeg;base64,", person.image].join(""),
            name: name + "/" + Number(person._additional.certainty).toFixed(2),
          };
        }
      );

      setOwner(ownerImage);
      setPersons(imagesNew);
    }

    if (weaviateReady) {
      fetch();
    }
  }, [weaviateReady]);

  const nodes = [
    {
      id,
      label: owner.owner,
      icon: ["data:image/jpeg;base64,", owner.image].join(""),
    },
    ...persons.map((person) => ({
      id: person.name,
      label: person.name,
      icon: person.image,
    })),
  ];
  const edges = persons.map((person) => ({
    source: id,
    target: person.name,
    id: `${id}-${person.name}`,
  }));

  return (
    <>
      <Title order={1}>Dashboard</Title>
      <br />
      <br />
      <Flex gap={"lg"}>
        <div style={{ height: 1024, width: 1024 }}>
          <GraphCanvas
            nodes={nodes}
            edges={edges as any}
            renderNode={({ node, ...rest }) => (
              <SphereWithIcon
                {...rest}
                node={node}
                image={node.icon || ""}
                size={3}
              />
            )}
          />
        </div>
      </Flex>
    </>
  );
}
