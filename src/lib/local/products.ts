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
  categories,
  tags,
  minPrice,
  maxPrice,
  search,
}: {
  cursor?: string;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
  categories?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}): Promise<{ pageInfo: PageInfo; products: Product[] }> {
  let list = (products as unknown as any[]).slice();

  // Apply explicit filters first (scalable and clear)
  if (typeof minPrice === "number") {
    list = list.filter((p) => {
      const productMaxPrice = parseFloat(p.priceRange.maxVariantPrice.amount);
      return productMaxPrice >= minPrice;
    });
  }

  if (typeof maxPrice === "number") {
    list = list.filter((p) => {
      const productMinPrice = parseFloat(p.priceRange.minVariantPrice.amount);
      return productMinPrice <= maxPrice;
    });
  }

  if (categories && categories.length > 0) {
    // Get all collections to map handles to titles
    const collections = await import("@/data/collections.json");
    const handleToTitleMap = new Map();
    collections.default.forEach((c: any) => {
      handleToTitleMap.set(c.handle.toLowerCase(), c.title.toLowerCase());
    });
    
    const selectedTitles = new Set(
      categories.map((handle) => handleToTitleMap.get(String(handle).toLowerCase())).filter(Boolean)
    );
    
    list = list.filter((p) => {
      const productCategories = (p?.collections?.nodes || []).map((n: any) => String(n?.title || "").toLowerCase());
      // OR within categories: product matches if any of its categories is in selected set
      return productCategories.some((title: string) => selectedTitles.has(title));
    });
  }

  if (tags && tags.length > 0) {
    const tagSet = new Set(tags.map((t) => String(t).toLowerCase()));
    list = list.filter((p) => (p?.tags || []).some((t: string) => tagSet.has(String(t).toLowerCase())));
  }

  if (search && search.trim()) {
    const searchTerm = search.toLowerCase();
    list = list.filter((p) =>
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      (p.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Back-compat: also support legacy query string if provided
  if (query && !(categories || tags || typeof minPrice === "number" || typeof maxPrice === "number" || search)) {
    const queryParts = query.split(' ').filter(part => part.trim());
    for (const part of queryParts) {
      if (part.includes('variants.price:<=')) {
        const qMax = parseFloat(part.split('<=')[1]);
        list = list.filter((p) => {
          const productMinPrice = parseFloat(p.priceRange.minVariantPrice.amount);
          return productMinPrice <= qMax;
        });
      } else if (part.includes('variants.price:>=')) {
        const qMin = parseFloat(part.split('>=')[1]);
        list = list.filter((p) => {
          const productMaxPrice = parseFloat(p.priceRange.maxVariantPrice.amount);
          return productMaxPrice >= qMin;
        });
      } else {
        const searchTerm = part.toLowerCase();
        list = list.filter((p) =>
          p.title.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          (p.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm))
        );
      }
    }
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

export async function getLocalHighestProductPrice(): Promise<{
  amount: string;
  currencyCode: string;
}> {
  const list = products as unknown as any[];
  let maxPrice = 0;
  let currencyCode = "USD";
  
  list.forEach((product) => {
    const productMaxPrice = parseFloat(product.priceRange.maxVariantPrice.amount);
    if (productMaxPrice > maxPrice) {
      maxPrice = productMaxPrice;
      currencyCode = product.priceRange.maxVariantPrice.currencyCode;
    }
  });
  
  return {
    amount: maxPrice.toString(),
    currencyCode: currencyCode
  };
}


