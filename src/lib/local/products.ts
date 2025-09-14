import products from "@/data/products.json";
import type { PageInfo, Product } from "@/lib/types";

function paginate<T>(items: T[], first: number, cursor?: string): { data: T[]; pageInfo: PageInfo } {
  const startIndex = cursor ? Math.max(0, items.findIndex((p: any) => p.id === cursor) + 1) : 0;
  const slice = items.slice(startIndex, startIndex + first);
  const endCursor = slice.length ? (slice[slice.length - 1] as any).id : "";
  return {
    data: slice as T[],
    pageInfo: {
      hasNextPage: startIndex + first < items.length,
      hasPreviousPage: startIndex > 0,
      endCursor,
    },
  };
}

function reshapeProducts(list: any[]): Product[] {
  return list.map((p) => {
    const images = (p.images.edges || []).map((e: any) => ({ ...e.node }));
    const variants = (p.variants.edges || []).map((e: any) => ({ ...e.node }));
    return {
      ...p,
      images,
      variants,
    } as unknown as Product;
  });
}

export async function getLocalProducts({
  cursor,
  sortKey,
  reverse,
  query,
}: {
  cursor?: string;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
}): Promise<{ pageInfo: PageInfo; products: Product[] }> {
  let list = (products as unknown as any[]).slice();

  if (query) {
    const q = query.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  if (sortKey === "PRICE") {
    list.sort((a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
    if (reverse) list.reverse();
  } else if (sortKey === "CREATED_AT") {
    list.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    if (reverse) list.reverse();
  }

  const { data, pageInfo } = paginate(list, 20, cursor);
  return { pageInfo, products: reshapeProducts(data) };
}

export async function getLocalProduct(handle: string): Promise<Product | undefined> {
  const list = products as unknown as any[];
  const found = list.find((p) => p.handle === handle);
  return found ? reshapeProducts([found])[0] : undefined;
}

export async function getLocalProductRecommendations(id: string): Promise<Product[]> {
  const list = products as unknown as any[];
  const others = list.filter((p) => p.id !== id).slice(0, 4);
  return reshapeProducts(others);
}

export async function getLocalVendors(): Promise<{ vendor: string; productCount: number }[]> {
  const list = products as unknown as any[];
  const counts: Record<string, number> = {};
  list.forEach((p) => (counts[p.vendor] = (counts[p.vendor] || 0) + 1));
  return Object.entries(counts).map(([vendor, productCount]) => ({ vendor, productCount }));
}

export async function getLocalTags(): Promise<string[]> {
  const list = products as unknown as any[];
  return Array.from(new Set(list.flatMap((p) => p.tags)));
}


