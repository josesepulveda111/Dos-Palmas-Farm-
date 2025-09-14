import collections from "@/data/collections.json";
import products from "@/data/products.json";
import type { Collection } from "@/lib/types";

export async function getLocalCollections(): Promise<Collection[]> {
  const list = products as unknown as any[];

  return (collections as any[]).map((c) => {
    // Find first product that belongs to this collection title
    const prod = list.find((p) =>
      (p?.collections?.nodes || []).some((n: any) => n?.title === c.title)
    );

    // Prefer featuredImage, fallback to first image in edges
    const featured = prod?.featuredImage;
    const firstImg = prod?.images?.edges?.[0]?.node;
    const image = featured || firstImg || null;

    // Build a lightweight products list for count display (edges length)
    const productsInCollection = list.filter((p) =>
      (p?.collections?.nodes || []).some((n: any) => n?.title === c.title)
    );
    const productsConnection = {
      edges: productsInCollection.map((p) => ({ node: { id: p.id } })),
    };

    return {
      handle: c.handle,
      title: c.title,
      description: c.description,
      seo: { title: c.title, description: c.description },
      updatedAt: new Date().toISOString(),
      path: `/products/${c.handle}`,
      image,
      products: productsConnection,
    } as any;
  }) as Collection[];
}


