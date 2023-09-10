import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { ApolloProvider } from "@apollo/client";

import { client } from "@/api";
import { NavBar } from "../components";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>RatingLab</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      >
        <div style={{ display: "flex" }}>
          <NavBar />
          <main style={{ flex: "1", padding: "20px" }}>
            <ApolloProvider client={client}>
              <Component {...pageProps} />
            </ApolloProvider>
          </main>
        </div>
      </MantineProvider>
    </>
  );
}
