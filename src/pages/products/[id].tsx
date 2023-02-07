import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import Image from "next/image";

import { useCartStore } from "src/pages/_app";
import catalog from "src/pages/api/FGT-Frontend-Take-Home";

import styles from "src/styles/products.module.css";

export default function Product(props: { details: Product | null }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { details: data } = props;
  if (!data) return <p>sorry no product details ATM</p>;
  return (
    <>
      <Head>
        <title>Products/{data.title}</title>
      </Head>
      <div className={styles.productPage}>
        <Image
          className={styles.productShot}
          src={data.thumbnail.src}
          height={557}
          width={554}
          alt={data.thumbnail.alt || data.title}
        />
        <article className={styles.productBody}>
          <h1>{data.title}</h1>
          <p>{data.body}</p>
          <button onClick={() => addToCart(data)}>add to cart</button>
        </article>
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
