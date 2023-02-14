import React from "react";
import { render, screen } from "@testing-library/react";

import ShoppingCart from "./shopping-cart";

test("should show shopping cart", () => {
  render(<ShoppingCart />);
});
