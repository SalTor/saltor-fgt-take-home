import type { AppProps } from "next/app";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import catalog from "src/pages/api/FGT-Frontend-Take-Home";

import "src/styles/globals.css";

type CartItem = { count: number; product: Product };

export const useCartStore = create<{
  isCartOpen: boolean;
  toggleCartOpen(): void;
  cart: () => CartItem[];
  currentCart: Record<number, CartItem>;
  addToCart(product: Product): void;
  reduceFromCart(product: Product): void;
  removeFromCart(product: Product): void;
}>((set, get) => ({
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
}));

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const toggleCartOpen = useCartStore((state) => state.toggleCartOpen);
  const addToCart = useCartStore((state) => state.addToCart);
  const reduceFromCart = useCartStore((state) => state.reduceFromCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  // const cart = useCartStore((state) => state.cart); // TODO: Why doesn't zustand computation work?
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const currentCart = useCartStore((state) => state.currentCart);

  const recommendations = useMemo(() => {
    const { treeCount, kitCount, hasClips } = Object.values(currentCart).reduce(
      (acc, curr) => {
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
    const recClips = treeCount > 0 && !hasClips;
    const recKit = treeCount > kitCount;
    return catalog.recommendations.filter((r) => {
      return !(
        (r.id === 1532751872052 && !recKit) ||
        (r.id === 4813305610302 && !recClips)
      );
    });
  }, [currentCart]);

  const productBadge = useMemo(() => {
    const productId = router.query.id;
    if (productId) {
      return currentCart[parseInt(productId as string, 10)]?.count || null;
    }
    return null;
  }, [currentCart, router.query]);

  const cartSum = useMemo(() => {
    return Object.values(currentCart).reduce(
      (acc, curr) => (acc += curr.product.price * curr.count),
      0
    );
  }, [currentCart]);

  const {
    showShippingCopy,
    freeShippingProgressPercent,
    freeShippingProgressDollars,
  } = useMemo(() => {
    return {
      showShippingCopy: cartSum > 0,
      freeShippingProgressDollars: 150 - cartSum,
      freeShippingProgressPercent: `${(
        (1 - (150 - cartSum) / 150) *
        100
      ).toFixed(0)}%`,
    };
  }, [cartSum]);

  return (
    <>
      <main className="w-5/6 lg:w-4/5 xl:w-3/5 2xl:w-2/5 m-auto">
        <nav
          className={`flex justify-between mb-${
            router.pathname === "/" ? "5" : "8"
          } w-full`}
        >
          <Link href="/">
            <Image src="/images/logo.svg" height={38} width={30} alt="Logo" />
          </Link>

          <button onClick={toggleCartOpen} className="relative">
            <Image
              src="/images/circle-cart.svg"
              height={50}
              width={50}
              alt="Logo"
            />
            {productBadge && (
              <span
                className="absolute -top-1 -right-1 h-4 w-4 flex justify-center items-center text-white text-center bg-[red] rounded-full"
                style={{ fontSize: 8 }}
              >
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

            <div className="absolute top-0 right-0 bottom-0 h-full bg-white p-[20px] pt-[60px] w-full sm:w-3/4 md:w-4/6 lg:w-3/6 xl:w-[600px] overflow-y-scroll max-w-[440px]">
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

              <button className="absolute left-1/2 top-6 -translate-x-0.5">
                <Image
                  src="/images/cart.svg"
                  height={40}
                  width={37}
                  alt="icon"
                />
              </button>

              <div className="mt-6">
                {showShippingCopy && (
                  <div className="mb-8 text-center">
                    {freeShippingProgressDollars < 0 ? (
                      <p>Free shipping for you!</p>
                    ) : (
                      <div>
                        <p className="mb-3">
                          You&apos;re{" "}
                          <span className="font-medium">
                            ${freeShippingProgressDollars.toFixed(2)}
                          </span>{" "}
                          away from free shipping!
                        </p>
                        <div className="w-full bg-[#d7dad2] h-3">
                          <div
                            className="bg-[#155343] h-3"
                            style={{
                              width: freeShippingProgressPercent,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {Object.values(currentCart)
                  .length /* TODO: figure out a computed value for this instead of running Object.values on every render */ ? (
                  <>
                    <div className="px-4">
                      {Object.values(currentCart).map((c) => (
                        <article
                          key={c.product.id}
                          className="flex px-3 mb-3 place-content-between"
                        >
                          <div className="flex">
                            <div
                              className="relative"
                              style={{
                                height: 110,
                                width: 110,
                                minHeight: 110,
                                minWidth: 110,
                              }}
                            >
                              <Image
                                src={c.product.thumbnail.src}
                                fill
                                alt={c.product.thumbnail.alt || c.product.title}
                              />
                            </div>

                            <div className="mx-5 grid grid-cols-1 grid-rows-3 place-content-between">
                              <p className="text-sm">{c.product.title}</p>

                              <p className="text-sm">{`$${c.product.price}`}</p>

                              <div className="flex items-center">
                                <button
                                  onClick={() => reduceFromCart(c.product)}
                                >
                                  <Image
                                    src="/images/circle-minus.svg"
                                    height={20}
                                    width={20}
                                    alt="Remove one"
                                  />
                                </button>

                                <div className="mx-2 text-md leading-none">
                                  {c.count}
                                </div>

                                <button onClick={() => addToCart(c.product)}>
                                  <Image
                                    src="/images/circle-plus.svg"
                                    height={20}
                                    width={20}
                                    alt="Add another"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            className=""
                            onClick={() => removeFromCart(c.product)}
                          >
                            <Image
                              src="/images/circle-trash.svg"
                              height={35}
                              width={35}
                              alt="Remove all"
                            />
                          </button>
                        </article>
                      ))}

                      <div className="my-6 flex justify-between text-lg">
                        <p className="font-medium">Subtotal</p>$
                        {cartSum.toFixed(2)}
                      </div>
                    </div>

                    {!!recommendations.length && (
                      <>
                        <div className="h-1 w-full bg-[#d7dad2] mx-1 mt-6 mb-2 rounded" />

                        <h1 className="mb-3 text-lg">Recommended Items</h1>

                        {recommendations.map((r) => (
                          <article
                            key={r.id}
                            className="flex justify-between items-center p-5 mb-3"
                          >
                            <div
                              className="relative"
                              style={{
                                height: 110,
                                width: 110,
                                minHeight: 110,
                                minWidth: 110,
                              }}
                            >
                              <Image
                                src={r.thumbnail.src}
                                fill
                                alt={r.thumbnail.alt || r.title}
                              />
                            </div>

                            <span>
                              <h1 className="text-lg font-medium grow-1 w-[170px]">
                                {r.title}
                              </h1>
                            </span>

                            <button onClick={() => addToCart(r)}>
                              <Image
                                src="/images/circle-plus.svg"
                                height={35}
                                width={35}
                                alt="Add to cart"
                                style={{ minWidth: 35, minHeight: 35 }}
                              />
                            </button>
                          </article>
                        ))}
                      </>
                    )}
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
