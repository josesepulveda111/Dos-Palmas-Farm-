export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor: string;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: Money;
};

export type Product = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: { maxVariantPrice: Money; minVariantPrice: Money };
  compareAtPriceRange: { maxVariantPrice: Money };
  variants: ProductVariant[];
  featuredImage: Image;
  images: Image[];
  seo: { title: string; description: string };
  tags: string[];
  updatedAt: string;
  vendor: string;
  collections: any;
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  seo: { title: string; description: string };
  updatedAt: string;
  path?: string;
};

export type CartItem = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: { name: string; value: string }[];
    product: Product;
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: CartItem[];
  totalQuantity: number;
};










