import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import catalog from "src/pages/api/FGT-Frontend-Take-Home";

import styles from "src/styles/products.module.css";

export default function Home(props: Catalog) {
  return (
    <>
      <Head>
        <title>Fast Growing Trees</title>
      </Head>
      <section className={styles.productWrap}>
        {props.products.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id}>
            <article className={styles.product}>
              <Image
                src={product.thumbnail.src}
                width={281}
                height={253}
                alt={product.thumbnail.alt || product.title}
              />
              <span className={styles.productName}>{product.title}</span>
            </article>
          </Link>
        ))}
      </section>
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: catalog,
  };
}
