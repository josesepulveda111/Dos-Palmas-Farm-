import Cookies from "js-cookie";
import type { Cart, CartItem, Money, Product } from "@/lib/types";
import products from "@/data/products.json";

const CART_KEY_PREFIX = "local-cart:";

function getStorageKey(cartId: string) {
  return `${CART_KEY_PREFIX}${cartId}`;
}

function calculateTotals(lines: CartItem[]): { subtotal: Money; total: Money; tax: Money; totalQuantity: number } {
  let amount = 0;
  let quantity = 0;
  for (const line of lines) {
    const lineAmount = parseFloat(line?.cost?.totalAmount?.amount as any) ||
      parseFloat((line as any)?.merchandise?.price?.amount) || 0;
    amount += lineAmount;
    quantity += line.quantity || 0;
  }
  const subtotal = { amount: amount.toFixed(2), currencyCode: "USD" } as Money;
  const total = { amount: amount.toFixed(2), currencyCode: "USD" } as Money;
  const tax = { amount: "0.00", currencyCode: "USD" } as Money;
  return { subtotal, total, tax, totalQuantity: quantity };
}

function loadCart(cartId: string): Cart | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(getStorageKey(cartId));
  return raw ? (JSON.parse(raw) as Cart) : null;
}

function saveCart(cart: Cart) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(getStorageKey(cart.id), JSON.stringify(cart));
}

export async function createCart(): Promise<Cart> {
  const id = crypto.randomUUID();
  const empty: Cart = {
    id,
    checkoutUrl: "",
    cost: {
      subtotalAmount: { amount: "0.00", currencyCode: "USD" },
      totalAmount: { amount: "0.00", currencyCode: "USD" },
      totalTaxAmount: { amount: "0.00", currencyCode: "USD" },
    },
    lines: [] as any,
    totalQuantity: 0,
  };
  saveCart(empty);
  Cookies.set("cartId", id);
  return empty;
}

export async function getCart(cartId: string): Promise<Cart | undefined> {
  const cart = loadCart(cartId);
  return cart || undefined;
}

function findProductByVariantId(variantId: string): Product | undefined {
  try {
    const list = products as any[];
    const found = list.find((p) => (p.variants?.edges || []).some((e: any) => e.node.id === variantId));
    if (!found) return undefined;
    const images = (found.images?.edges || []).map((e: any) => e.node);
    const variants = (found.variants?.edges || []).map((e: any) => e.node);
    return { ...found, images, variants } as Product;
  } catch {
    return undefined;
  }
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const existing = loadCart(cartId) || (await createCart());
  const newLines: CartItem[] = existing.lines ? (existing.lines as any) : [];

  for (const line of lines) {
    const product = findProductByVariantId(line.merchandiseId);
    const price = product?.priceRange?.minVariantPrice || { amount: "0.00", currencyCode: "USD" };
    // Merge with existing line if same merchandise (variant) already in cart
    const existingLine = newLines.find((l) => l.merchandise.id === line.merchandiseId);
    if (existingLine) {
      existingLine.quantity = (existingLine.quantity || 0) + line.quantity;
      const newAmount = parseFloat(price.amount) * existingLine.quantity;
      existingLine.cost.totalAmount.amount = newAmount.toFixed(2);
      existingLine.cost.totalAmount.currencyCode = price.currencyCode;
    } else {
      const cartLine: CartItem = {
        id: crypto.randomUUID(),
        quantity: line.quantity,
        cost: { totalAmount: { amount: (parseFloat(price.amount) * line.quantity).toFixed(2), currencyCode: price.currencyCode } },
        merchandise: {
          id: line.merchandiseId,
          title: product?.title || "",
          selectedOptions: [],
          product: (product as Product) || ({} as Product),
        },
      };
      newLines.push(cartLine);
    }
  }

  const totals = calculateTotals(newLines);
  const updated: Cart = {
    ...existing,
    lines: newLines as any,
    totalQuantity: totals.totalQuantity,
    cost: {
      subtotalAmount: totals.subtotal,
      totalAmount: totals.total,
      totalTaxAmount: totals.tax,
    },
  };
  saveCart(updated);
  return updated;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const existing = loadCart(cartId) || (await createCart());
  const newLines = (existing.lines as any as CartItem[]).filter((l) => !lineIds.includes(l.id));
  const totals = calculateTotals(newLines);
  const updated: Cart = {
    ...existing,
    lines: newLines as any,
    totalQuantity: totals.totalQuantity,
    cost: {
      subtotalAmount: totals.subtotal,
      totalAmount: totals.total,
      totalTaxAmount: totals.tax,
    },
  };
  saveCart(updated);
  return updated;
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const existing = loadCart(cartId) || (await createCart());
  const currentLines = existing.lines as any as CartItem[];
  for (const line of lines) {
    const found = currentLines.find((l) => l.id === line.id);
    if (found) {
      found.quantity = line.quantity;
      const product = findProductByVariantId(line.merchandiseId);
      const price = product?.priceRange?.minVariantPrice || { amount: "0.00", currencyCode: "USD" };
      found.cost.totalAmount.amount = (parseFloat(price.amount) * line.quantity).toFixed(2);
    }
  }
  const totals = calculateTotals(currentLines);
  const updated: Cart = {
    ...existing,
    lines: currentLines as any,
    totalQuantity: totals.totalQuantity,
    cost: {
      subtotalAmount: totals.subtotal,
      totalAmount: totals.total,
      totalTaxAmount: totals.tax,
    },
  };
  saveCart(updated);
  return updated;
}


