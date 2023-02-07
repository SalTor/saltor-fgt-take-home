import type { AppProps } from "next/app";
import Image from "next/image";

import { create } from "zustand";

import "src/styles/globals.css";

type CartItem = { count: number; product: Product };

export const useCartStore = create<{
  isCartOpen: boolean;
  toggleCartOpen(): void;
  cart: () => CartItem[];
  currentCart: Record<number, CartItem>;
  addToCart(id: Product): void;
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
      return {
        currentCart: {
          ...state.currentCart,
          [product.id]: { count: 1, product },
        },
      };
    }),
}));

export default function App({ Component, pageProps }: AppProps) {
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const toggleCartOpen = useCartStore((state) => state.toggleCartOpen);
  const cart = useCartStore((state) => state.cart);
  const handleCart = () => {
    toggleCartOpen();
  };

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row-reverse", // TODO: reverse for release
        }}
      >
        <Image src="/images/logo.svg" height={50} width={50} alt="Logo" />
        <button onClick={handleCart}>
          <Image src="/images/cart.svg" height={50} width={50} alt="Logo" />
        </button>
      </nav>
      <Component {...pageProps} />
      {isCartOpen && (
        <div
          className="skrim"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "rgba(0, 0, 0, .5)",
          }}
        >
          <div
            className="backdrop"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
            onClick={() => toggleCartOpen()}
          />
          <div
            className="the-cart"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              height: "100%",
              width: 300,
              background: "white",
            }}
          >
            <p>YOUR CART</p>
            {cart().map((c) => (
              <p>
                {c.product.id} x {c.count}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
