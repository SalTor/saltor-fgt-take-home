import type { AppProps } from "next/app";
import Image from "next/image";
import { useRouter } from "next/router";

import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import catalog from "src/pages/api/FGT-Frontend-Take-Home";

import "src/styles/globals.css";

type CartItem = { count: number; product: Product };

export const useCartStore = create(
  persist<{
    isCartOpen: boolean;
    toggleCartOpen(): void;
    cart: () => CartItem[];
    currentCart: Record<number, CartItem>;
    addToCart(product: Product): void;
    reduceFromCart(product: Product): void;
    removeFromCart(product: Product): void;
  }>(
    (set, get) => ({
      isCartOpen: false,
      toggleCartOpen: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      currentCart: {},
      cart: () => Object.values(get().currentCart),
      addToCart: (product) =>
        set((state) => {
          const existing = state.currentCart[product.id];
          if (existing) {
            return {
              currentCart: {
                ...state.currentCart,
                [product.id]: {
                  ...existing,
                  count: existing.count + 1,
                },
              },
            };
          }
          state.currentCart[product.id] = { count: 1, product };
          return {
            currentCart: { ...state.currentCart },
          };
        }),
      reduceFromCart: (product) =>
        set((state) => {
          const existing = state.currentCart[product.id];
          if (!existing) return { currentCart: state.currentCart };
          if (existing.count === 1) {
            delete state.currentCart[product.id];
            return {
              currentCart: { ...state.currentCart },
            };
          }
          state.currentCart[product.id].count--;
          return {
            currentCart: { ...state.currentCart },
          };
        }),
      removeFromCart: (product) =>
        set((state) => {
          const copy = { ...state.currentCart };
          delete copy[product.id];
          return {
            currentCart: { ...copy },
          };
        }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const toggleCartOpen = useCartStore((state) => state.toggleCartOpen);
  // const cart = useCartStore((state) => state.cart);
  const currentCart = useCartStore((state) => state.currentCart);
  const addToCart = useCartStore((state) => state.addToCart);
  const reduceFromCart = useCartStore((state) => state.reduceFromCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const { recKit, recClips } = useMemo(() => {
    const { treeCount, kitCount, hasClips } = Object.values(currentCart).reduce(
      (acc, curr) => {
        console.log(`curr ${curr.product.id}`, curr);
        if (curr.product.product_type === "Tree")
          return { ...acc, treeCount: acc.treeCount + curr.count };
        if (curr.product.id === 1532751872052)
          return { ...acc, kitCount: curr.count };
        if (curr.product.id === 4813305610302)
          return { ...acc, hasClips: true };
        return acc;
      },
      { treeCount: 0, kitCount: 0, hasClips: false }
    );
    return {
      recClips: treeCount > 0 && !hasClips,
      recKit: treeCount > kitCount,
    };
  }, [currentCart]);

  const productBadge = useMemo(() => {
    const productId = router.query.id;
    if (productId) {
      return currentCart[parseInt(productId as string, 10)]?.count || null;
    }
    return null;
  }, [currentCart, router.query]);

  const handleCart = () => {
    toggleCartOpen();
  };

  return (
    <>
      <main className="w-5/6 lg:w-4/5 xl:w-3/5 2xl:w-2/5 m-auto">
        <nav className="flex justify-between mb-5 w-full">
          <Image src="/images/logo.svg" height={38} width={30} alt="Logo" />

          <button onClick={handleCart} className="relative">
            <Image
              src="/images/circle-cart.svg"
              height={50}
              width={50}
              alt="Logo"
            />
            {productBadge && (
              <span className="absolute top-0 right-0 text-xs h-5 w-5 flex justify-center items-center text-white text-center bg-[red] rounded-full">
                <span>{productBadge}</span>
              </span>
            )}
          </button>
        </nav>

        <Component {...pageProps} />

        {isCartOpen && (
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-[#d9d9d9]/80">
            <div
              className="absolute top-0 right-0 bottom-0 left-0"
              onClick={() => toggleCartOpen()}
            />
            <div className="absolute top-0 right-0 bottom-0 h-full bg-white p-6 w-3/4 md:w-4/6 lg:w-3/6 xl:w-[600px]">
              <button
                className="absolute top-6 left-6"
                onClick={() => toggleCartOpen()}
              >
                <Image
                  src="/images/close-button.svg"
                  height={28}
                  width={28}
                  alt="Close cart"
                />
              </button>

              <button className="absolute left-1/2 top-6">
                <Image
                  src="/images/cart.svg"
                  height={40}
                  width={37}
                  alt="icon"
                />
              </button>

              <div className="mt-6">
                {/* spacing */}

                {/* $x away from free shipping! */}
                {/* progress bar */}
                {Object.values(currentCart)
                  .length /* TODO: figure out a computed value for this instead of running Object.values on every render */ ? (
                  <>
                    {Object.values(currentCart).map((c) => (
                      <article key={c.product.id}>
                        <div className="relative h-28 w-28">
                          <Image
                            src={c.product.thumbnail.src}
                            fill
                            alt={c.product.thumbnail.alt || c.product.title}
                          />
                        </div>
                        <div>
                          <p>{c.product.title}</p>

                          <p>{`$${c.product.price}`}</p>

                          <div>
                            <button onClick={() => reduceFromCart(c.product)}>
                              <Image
                                src="/images/circle-minus.svg"
                                height={20}
                                width={20}
                                alt="Remove one"
                              />
                            </button>
                            {c.count}
                            <button onClick={() => addToCart(c.product)}>
                              <Image
                                src="/images/circle-plus.svg"
                                height={20}
                                width={20}
                                alt="Add another"
                              />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(c.product)}>
                            <Image
                              src="/images/circle-trash.svg"
                              height={35}
                              width={35}
                              alt="Remove all"
                            />
                          </button>
                        </div>
                      </article>
                    ))}
                    <div className="my-6 flex justify-between">
                      <p>Subtotal</p>$
                      {Object.values(currentCart)
                        .reduce(
                          (acc, curr) =>
                            (acc += curr.product.price * curr.count),
                          0
                        )
                        .toFixed(2)}
                    </div>
                    <hr />
                    <h1>Recommended Items</h1>
                    {catalog.recommendations.map((r) => {
                      if (r.id === 1532751872052 && !recKit) return null;
                      if (r.id === 4813305610302 && !recClips) return null;
                      return (
                        <article
                          key={r.id}
                          className="flex justify-between items-center"
                        >
                          <div className="relative h-28 w-28">
                            <Image
                              src={r.thumbnail.src}
                              fill
                              alt={r.thumbnail.alt || r.title}
                            />
                          </div>
                          <h1 className="text-xl">{r.title}</h1>
                          <button onClick={() => addToCart(r)}>
                            <Image
                              src="/images/circle-plus.svg"
                              height={35}
                              width={35}
                              alt="Add to cart"
                            />
                          </button>
                        </article>
                      );
                    })}
                  </>
                ) : (
                  <h1>Empty shopping cart</h1>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
