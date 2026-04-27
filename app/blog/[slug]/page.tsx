import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPost, getBlogPosts } from '@/lib/webflow/client';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts();
    return posts.map((p) => ({ slug: p.fieldData.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug).catch(() => null);

  if (!post) notFound();

  const image = post.fieldData['main-image'];
  const body = post.fieldData['post-body'] ?? '';
  const publishedOn = post.fieldData['published-on'] ?? post.createdOn;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight text-gray-900">
            The Last Shall Be First
          </Link>
          <Link
            href="/login"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-brand-600 hover:underline mb-6 inline-block">
          ← Back to home
        </Link>

        {image?.url && (
          <div className="relative h-64 w-full rounded-xl overflow-hidden mb-8 bg-gray-100">
            <Image src={image.url} alt={image.alt ?? post.fieldData.name} fill className="object-cover" />
          </div>
        )}

        <div className="mb-2 text-sm text-gray-400">
          {new Date(publishedOn).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">{post.fieldData.name}</h1>

        {body ? (
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="text-gray-500 italic">No content available.</p>
        )}
      </main>
    </div>
  );
}
