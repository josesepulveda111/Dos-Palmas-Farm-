// Lightweight type bridge so local implementation compiles without Shopify SDK types
// Re-export local domain types
export type {
  Cart,
  Collection,
  Image,
  Page,
  PageInfo,
  Product,
} from "@/lib/types";

// Generic connection type
export type Connection<T> = {
  edges: Array<{ node: T }>;
};

// Minimal placeholders for menu and customer inputs
export type Menu = { title: string; path: string };
export type CustomerInput = { email: string; password: string; [key: string]: any };

// Shopify operation response placeholders (typed as any to satisfy generics)
export type ShopifyAddToCartOperation = any;
export type ShopifyCart = any;
export type ShopifyCartOperation = any;
export type ShopifyCollection = any;
export type ShopifyCollectionOperation = any;
export type ShopifyCollectionProductsOperation = any;
export type ShopifyCollectionsOperation = any;
export type ShopifyCreateCartOperation = any;
export type ShopifyMenuOperation = any;
export type ShopifyPageOperation = any;
export type ShopifyPagesOperation = any;
export type ShopifyProduct = any;
export type ShopifyProductOperation = any;
export type ShopifyProductRecommendationsOperation = any;
export type ShopifyProductsOperation = any;
export type ShopifyRemoveFromCartOperation = any;
export type ShopifyUpdateCartOperation = any;

export type registerOperation = any;
export type user = any;
export type userOperation = any;



