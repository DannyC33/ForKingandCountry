const WEBFLOW_BASE = 'https://api.webflow.com/v2';

interface WebflowPost {
  id: string;
  fieldData: {
    name: string;
    slug: string;
    'post-summary'?: string;
    'post-body'?: string;
    'main-image'?: { url: string; alt: string | null };
    'published-on'?: string;
    [key: string]: unknown;
  };
  lastPublished: string | null;
  lastUpdated: string;
  createdOn: string;
}

interface WebflowCollection {
  id: string;
  displayName: string;
  slug: string;
}

async function webflowFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${WEBFLOW_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
      'accept-version': '2.0.0',
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Webflow API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function getCollections(): Promise<WebflowCollection[]> {
  const siteId = process.env.WEBFLOW_SITE_ID;
  if (!siteId) return [];

  const data = await webflowFetch<{ collections: WebflowCollection[] }>(
    `/sites/${siteId}/collections`
  );
  return data.collections ?? [];
}

export async function getBlogPosts(): Promise<WebflowPost[]> {
  const collectionId = process.env.WEBFLOW_BLOG_COLLECTION_ID;
  if (!collectionId) return [];

  const data = await webflowFetch<{ items: WebflowPost[] }>(
    `/collections/${collectionId}/items?limit=20`
  );
  return data.items ?? [];
}

export async function getBlogPost(slug: string): Promise<WebflowPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.fieldData.slug === slug) ?? null;
}

export type { WebflowPost };
