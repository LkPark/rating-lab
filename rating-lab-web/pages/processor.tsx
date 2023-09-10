import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import {
  fetchImage,
  detectAllFaces,
  extractFaces,
  SsdMobilenetv1Options,
  nets,
} from "face-api.js";
import weaviate from "weaviate-ts-client";
import { Avatar, Text, Button, Grid, Center, Paper } from "@mantine/core";
import { Title } from "@mantine/core";

import QUERY_FACEBOOK_TERMS from "api/query/facebook-profile.graphql";

const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

export default function Processor() {
  const [weaviateReady, setWeaviateReady] = useState(false);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);
  const [persons, setPersons] = useState([] as any[]);

  const { loading, data } = useQuery(QUERY_FACEBOOK_TERMS);

  useEffect(() => {
    client.schema
      .getter()
      .do()
      .then(async () => {
        await client.schema
          .classCreator()
          .withClass({
            class: "Person",
            vectorizer: "img2vec-neural",
            vectorIndexType: "hnsw",
            moduleConfig: {
              "img2vec-neural": {
                imageFields: ["image"],
              },
            },
            properties: [
              {
                name: "owner",
                dataType: ["string"],
              },
              {
                name: "relationship",
                dataType: ["string"],
              },
              {
                name: "image",
                dataType: ["blob"],
              },
              {
                name: "originalImage",
                dataType: ["string"],
              },
            ],
          })
          .do()
          .catch(() => {});

        setWeaviateReady(true);
      });
  }, []);

  useEffect(() => {
    function isFaceDetectionModelLoaded() {
      return !!nets.ssdMobilenetv1.params;
    }

    if (!isFaceDetectionModelLoaded()) {
      nets.ssdMobilenetv1.load("/").then(async () => {
        setFaceDetectionReady(true);
      });
    }
  }, []);

  useEffect(() => {
    setInterval(async () => {
      const resImage = await client.graphql
        .get()
        .withClassName("Person")
        .withFields("image, owner, relationship")
        .do();

      if (!resImage.data.Get.Person) return;

      const imagesNew = resImage.data.Get.Person.map((person: any) => {
        return {
          image: ["data:image/jpeg;base64,", person.image].join(""),
          owner: person.owner,
          relationship: person.relationship,
        };
      });

      setPersons(imagesNew);
    }, 5000);
  }, []);

  return (
    <>
      <Title order={1}>Smart Face Recognition</Title>
      <br />
      <br />
      <Center maw={400} h={100} mx="auto">
        <Grid>
          <Grid.Col span={6}>
            <Button
              disabled={!weaviateReady && !faceDetectionReady && !loading}
              onClick={async () => {
                const options = new SsdMobilenetv1Options({
                  minConfidence: 0.8,
                });

                data?.facebookProfiles.data.forEach(
                  async ({ attributes }: any) => {
                    const img = await fetchImage(
                      "http://localhost:1337" +
                        attributes.picture.data.attributes.url
                    );
                    const detections = await detectAllFaces(img, options);
                    const faceImages = await extractFaces(img, detections);

                    faceImages
                      .map((faceImage: any) => {
                        return {
                          image: faceImage
                            .toDataURL("image/jpeg")
                            .split(";base64,")[1],
                          owner: attributes.name,
                          relationship: "",
                        };
                      })
                      .forEach(({ image, owner, relationship }) => {
                        client.data
                          .creator()
                          .withClassName("Person")
                          .withProperties({
                            image,
                            owner,
                            relationship,
                            originalImage:
                              "http://localhost:1337" +
                              attributes.picture.data.attributes.url,
                          })
                          .do();
                      });
                  }
                );

                data?.facebookProfiles.data.forEach(
                  async ({ attributes }: any) => {
                    const img = await fetchImage(
                      "http://localhost:1337" +
                        attributes.album.data[0].attributes.url
                    );
                    const detections = await detectAllFaces(img, options);
                    const faceImages = await extractFaces(img, detections);

                    faceImages
                      .map((faceImage) => {
                        return {
                          image: faceImage
                            .toDataURL("image/jpeg")
                            .split(";base64,")[1],
                          owner: "",
                          relationship: attributes.name,
                        };
                      })
                      .forEach(async ({ image, owner, relationship }) => {
                        await client.data
                          .creator()
                          .withClassName("Person")
                          .withProperties({
                            image,
                            owner,
                            relationship,
                            originalImage:
                              "http://localhost:1337" +
                              attributes.album.data[0].attributes.url,
                          })
                          .do();
                      });
                  }
                );
              }}
            >
              Start
            </Button>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button
              disabled={!weaviateReady}
              onClick={async () => {
                await client.schema.deleteAll();
              }}
            >
              Clean
            </Button>
          </Grid.Col>
        </Grid>
      </Center>
      <Grid>
        {persons.map((person, index) => {
          return (
            <Grid.Col key={index} span={3}>
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
                {person.owner && person.relationship === "" && (
                  <Text ta="center" fz="lg" weight={500} mt="md">
                    Owner {person.owner || "Unknown"}
                  </Text>
                )}

                {person.owner === "" && person.relationship && (
                  <Text ta="center" fz="lg" weight={500} mt="md">
                    Found in {person.relationship} album
                  </Text>
                )}
              </Paper>
            </Grid.Col>
          );
        })}
      </Grid>
    </>
  );
}
