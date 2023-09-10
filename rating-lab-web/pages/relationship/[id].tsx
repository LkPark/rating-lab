import dynamic from "next/dynamic";

const Page = dynamic(() => import("../../components/Dashboard"), {
  ssr: false,
});

export async function getServerSideProps(context: any) {
  return {
    props: {
      id: context.query.id,
    },
  };
}

export default Page;
