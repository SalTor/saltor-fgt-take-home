import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import Image from "next/image";

import { useCartStore } from "src/pages/_app";
import catalog from "src/pages/api/FGT-Frontend-Take-Home";

import styles from "src/styles/products.module.css";

export default function Product(props: { details: Product | null }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleShowCart = useCartStore((state) => state.toggleCartOpen);
  const { details: data } = props;
  if (!data) return <p>sorry no product details ATM</p>;
  return (
    <>
      <Head>
        <title>Products/{data.title}</title>
      </Head>

      <div className="flex gap-5">
        <div className="relative w-3/5 h-[500px] rounded-md truncate">
          <Image
            src={data.thumbnail.src}
            fill
            alt={data.thumbnail.alt || data.title}
          />
        </div>

        <aside className="w-2/5 bg-white truncate rounded-md whitespace-normal p-4">
          <h1 className="text-3xl">{data.title}</h1>
          <p className="my-4">About</p>
          <p>{data.body}</p>
          <button
            className="mt-6 w-full p-4 text-center text-2xl bg-[#CD0100] text-white rounded-md"
            onClick={() => {
              addToCart(data);
              toggleShowCart();
            }}
          >
            Add to Cart
          </button>
        </aside>
      </div>
    </>
  );
}

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  if (context.params?.id) {
    const match = catalog.products.find(
      (p) => p.id === parseInt(context.params.id, 10)
    );
    if (match) return { props: { details: match } };
    return { props: { details: null } };
  }
  return { props: { details: null } };
}

export function getStaticPaths() {
  return {
    paths: [{ params: { id: "1" } }],
    fallback: true,
  };
}
